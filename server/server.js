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

io.on('connection', socket => {
	console.log('A user connected, user ID: ' + socket.id);

	socket.on('join-room', data => {
		const { roomId, username } = data;

		if (!roomUsers[roomId]) {
			roomUsers[roomId] = [];
			roomState[roomId] = { countdownTimerActive: false };
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

		console.log(`User joined room ${roomId}, user ID: ${socket.id}`);
		console.log('Users in all rooms', roomUsers);
		console.log('Room state in all rooms', roomState);
	});

	socket.on('disconnect', () => {
		removeUserFromRooms(socket.id);
		console.log(`User disconnected, user ID: ${socket.id}`);
	});
});

setInterval(cleanUpEmptyRooms, 1800000);

function cleanUpEmptyRooms() {
	for (const roomId in roomUsers) {
		if (roomUsers[roomId].length === 0) {
			delete roomUsers[roomId];
			console.log(`Room '${roomId}' removed due to inactivity.`);
			console.log('Users in all rooms ', roomUsers);
		}
	}
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
