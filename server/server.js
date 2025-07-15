require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const crypto = require('crypto');
const axios = require('axios');
const https = require('https');

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
	res.send('Server is running');
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

io.on('connection', socket => {
	console.log('A user connected, user ID: ' + socket.id);

	socket.on('join-room', data => {
		const { roomId, username } = data;

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
		}

		if (roomState[roomId].countdownTimerFinished) {
			console.log(`${username} with id: '${socket.id}' rejected to join room ${roomId}, ctdown finished`);
			socket.emit('join-rejected', { reason: 'countdown-finished' });
			return;
		}

		const userData = {
			id: socket.id,
			username: username,
		};

		roomUsers[roomId].push(userData);

		socket.join(roomId);
		io.to(roomId).emit('update-users', getRoomUsers(roomId));

		if (roomUsers[roomId].length === 2 && !roomState[roomId].countdownTimerActive) {
			startCountdownTimer(roomId);
			roomState[roomId].countdownTimerActive = true;
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
