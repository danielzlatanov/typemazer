require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

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
	const roomId = Math.floor(Math.random() * 10000).toString();
	res.send({ roomId });
});

const roomUsers = {};
const roomState = {};
const roomRaceTime = {};

io.on('connection', socket => {
	console.log('A user connected, user ID: ' + socket.id);

	socket.on('join-room', data => {
		const { roomId, username } = data;

		if (!roomUsers[roomId]) {
			roomUsers[roomId] = [];
			roomState[roomId] = { countdownTimerActive: false, countdownTimerFinished: false };
			roomRaceTime[roomId] = 60; //! fixed initially
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
			console.log('Users in all rooms ', roomUsers);
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

	let countdown = 10;
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
			console.log(`Room ${roomId} TOTAL_RACE_TIME: ${roomRaceTime[roomId]}`);
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

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
