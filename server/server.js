require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const MAX_USERS_PER_ROOM = 10;
const ROOM_FILL_TIMEOUT = 20;

const PORT = process.env.PORT || 8000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
	cors: {
		origin: ['http://localhost:4200'],
		methods: ['GET', 'POST'],
	},
});

app.use(cors());

app.get('/', (req, res) => {
	res.send('Server running on port 8000');
});

app.get('/race-text', async (req, res) => {
	try {
		const { minLength, maxLength } = req.query;

		const params = {};
		if (minLength) params.minLength = minLength;
		if (maxLength) params.maxLength = maxLength;

		const response = await axios.get('https://api.quotable.io/random', {
			httpsAgent: agent,
			params,
		});

		res.json(response.data);
	} catch (error) {
		console.error('Failed to fetch race text', error);
		res.status(500).json({ error: 'Failed to fetch race text' });
	}
});

app.post('/create-room', (req, res) => {
	let roomId;
	const MAX_ATTEMPTS = 10;
	let attempts = 0;

	do {
		roomId = crypto.randomBytes(8).toString('hex');
		attempts++;
	} while (roomUsers[roomId] && attempts < MAX_ATTEMPTS);

	if (roomUsers[roomId]) {
		return res.status(500).send({ error: 'Could not generate unique room ID' });
	}

	res.send({ roomId });
});

const roomUsers = {};
const roomState = {};
const roomRaceTime = {};
const usersFinishedByRoom = {};
const roomFillTimers = {};

io.on('connection', socket => {
	console.log('A user connected, user ID: ' + socket.id);

	socket.on('join-room', async data => {
		const { roomId, username } = data;

		if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
			console.log(`Invalid roomId from user ${socket.id}`);
			socket.emit('join-rejected', { reason: 'invalid-room-id' });
			return;
		}

		const cleanUsername = sanitizeUsername(username);
		if (!cleanUsername) {
			console.log(`Invalid or empty username from user ${socket.id}`);
			socket.emit('join-rejected', { reason: 'invalid-username' });
			return;
		}

		if (!roomUsers[roomId]) {
			roomUsers[roomId] = [];
			roomState[roomId] = { countdownTimerActive: false, countdownTimerFinished: false };
			roomRaceTime[roomId] = 20; //! fixed initially
			usersFinishedByRoom[roomId] = new Set();

			try {
				const response = await axios.get('https://api.quotable.io/random', {
					httpsAgent: agent,
					params: { minLength: 50 },
				});
				roomState[roomId].text = response.data.content;
				console.log(`Race text for room ${roomId} initialized:`, roomState[roomId].text);
			} catch (err) {
				console.error(`Failed to fetch race text for room ${roomId}:`, err);
				roomState[roomId].text = 'Error fetching text, please try again.';
			}
		}

		if (roomState[roomId].countdownTimerFinished) {
			console.log(`${username} with id: '${socket.id}' rejected to join room ${roomId}, ctdown finished`);
			socket.emit('join-rejected', { reason: 'countdown-finished' });
			return;
		}

		if (roomUsers[roomId].length >= MAX_USERS_PER_ROOM) {
			console.log(`${username} with id: '${socket.id}' rejected - room ${roomId} is full`);
			socket.emit('join-rejected', { reason: 'room-full' });
			return;
		}

		const userData = {
			id: socket.id,
			username: username,
		};

		roomUsers[roomId].push(userData);
		socket.join(roomId);

		socket.emit('race-text', roomState[roomId].text);

		io.to(roomId).emit('update-users', getRoomUsers(roomId));

		if (roomUsers[roomId].length === MAX_USERS_PER_ROOM) {
			console.log(`Room ${roomId} is now full. Starting countdown immediately.`);

			if (roomFillTimers[roomId]) {
				clearTimeout(roomFillTimers[roomId]);
				delete roomFillTimers[roomId];
			}
			startCountdownTimer(roomId);
			roomState[roomId].countdownTimerActive = true;
		}

		if (
			roomUsers[roomId].length >= 2 &&
			roomUsers[roomId].length < MAX_USERS_PER_ROOM &&
			!roomFillTimers[roomId] &&
			!roomState[roomId].countdownTimerActive &&
			!roomState[roomId].countdownTimerFinished
		) {
			console.log(
				`Room ${roomId} reached ${roomUsers[roomId].length} players, starting fill timer of ${ROOM_FILL_TIMEOUT}.`
			);

			roomFillTimers[roomId] = setTimeout(() => {
				if (
					roomUsers[roomId] &&
					roomUsers[roomId].length >= 2 &&
					roomUsers[roomId].length <= MAX_USERS_PER_ROOM &&
					!roomState[roomId].countdownTimerActive &&
					!roomState[roomId].countdownTimerFinished
				) {
					console.log(
						`Room ${roomId} fill timeout expired. Starting countdown with ${roomUsers[roomId].length} players.`
					);
					startCountdownTimer(roomId);
					roomState[roomId].countdownTimerActive = true;
				}
				delete roomFillTimers[roomId];
			}, ROOM_FILL_TIMEOUT * 1000);
		}

		socket.on('user-stats-update', data => {
			const { roomId, userStats } = data;

			if (roomState[roomId]) {
				roomState[roomId][socket.id] = userStats;

				if (
					userStats.hasFinished &&
					!Array.from(usersFinishedByRoom[roomId]).some(entry => entry.startsWith(`${socket.id}:`))
				) {
					console.log('user has finished', socket.id);

					const place = usersFinishedByRoom[roomId].size + 1;
					usersFinishedByRoom[roomId].add(`${socket.id}:${place}`);

					io.to(roomId).emit('user-finished', { userId: socket.id, place });

					console.log('users Finished', usersFinishedByRoom[roomId]);
				}
			}
			// console.log('room state after user-stats-update', roomState);

			io.to(roomId).emit('update-user-stats', roomState[roomId]);
		});

		console.log(`User joined room ${roomId}, user ID: ${socket.id}`);
		console.log('Users in all rooms', roomUsers);
		console.log('Room state in all rooms', roomState);
	});

	socket.on('disconnect', () => {
		const roomId = findRoomIdByUserId(socket.id);
		removeUserFromRooms(socket.id);
		console.log(`User disconnected, user ID: ${socket.id}`);

		if (!roomUsers[roomId] || roomUsers[roomId].length === 0) {
			if (roomFillTimers[roomId]) {
				clearTimeout(roomFillTimers[roomId]);
				delete roomFillTimers[roomId];
			}
		}

		if (roomId && (!roomUsers[roomId] || roomUsers[roomId].length === 0)) {
			if (roomRaceTime[roomId]) {
				delete roomRaceTime[roomId];
				console.log(`Race time for room '${roomId}' removed.`);
			}

			if (roomState[roomId]) {
				delete roomState[roomId];
				console.log(`Room state for room '${roomId}' removed.`);
			}

			delete roomUsers[roomId];
			console.log(`Empty room '${roomId}' removed.`);

			delete usersFinishedByRoom[roomId];
			console.log(`Users finished for room '${roomId}' removed.`);
		}
	});
});

function findRoomIdByUserId(userId) {
	for (const roomId in roomUsers) {
		if (roomUsers[roomId].some(user => user.id === userId)) {
			return roomId;
		}
	}
	return null;
}

function startCountdownTimer(roomId) {
	io.to(roomId).emit('countdown-timer-started');

	// let countdown = 10;
	let countdown = 3;
	const intervalId = setInterval(() => {
		io.to(roomId).emit('countdown-update', countdown);
		countdown--;

		if (countdown < 0) {
			clearInterval(intervalId);
			io.to(roomId).emit('countdown-timer-finished');
			roomState[roomId].countdownTimerActive = false;
			roomState[roomId].countdownTimerFinished = true;

			startTotalTimeAllowedTimer(roomId);
		}
	}, 1000);
}

function startTotalTimeAllowedTimer(roomId) {
	const intervalId = setInterval(() => {
		if (roomRaceTime[roomId] && roomRaceTime[roomId] > 0) {
			roomRaceTime[roomId]--;
			io.to(roomId).emit('update-total-race-time', roomRaceTime[roomId]);
		}

		if (!roomRaceTime[roomId] || roomRaceTime[roomId] <= 0) {
			clearInterval(intervalId);
			io.to(roomId).emit('race-time-finished');
			console.log('race has finished due to `race-time-finished`');

			delete roomRaceTime[roomId];
			console.log(`Race time for room '${roomId}' removed.`);
			delete roomState[roomId];
			console.log(`Room state for room '${roomId}' removed.`);
			delete roomUsers[roomId];
			console.log(`Empty room '${roomId}' removed.`);
			delete usersFinishedByRoom[roomId];
			console.log(`Users finished for room '${roomId}' removed.`);
		}
	}, 1000);
}

function getRoomUsers(roomId) {
	return roomUsers[roomId] || [];
}

function removeUserFromRooms(userId) {
	for (const roomId in roomUsers) {
		roomUsers[roomId] = roomUsers[roomId].filter(user => user.id !== userId);
		io.to(roomId).emit('update-users', roomUsers[roomId]);
	}
}

function sanitizeUsername(name) {
	if (!name || typeof name !== 'string') return null;
	const trimmed = name.trim();
	const valid = /^[\w\-]{1,20}$/.test(trimmed);
	return valid ? trimmed : null;
}

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
