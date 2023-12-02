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

io.on('connection', socket => {
	console.log('A user connected, user ID: ' + socket.id);

	socket.on('join-room', roomId => {
		if (!roomUsers[roomId]) {
			roomUsers[roomId] = [];
		}

		const userData = {
			id: socket.id,
		};

		roomUsers[roomId].push(userData);

		socket.join(roomId);
		io.to(roomId).emit('update-users', getRoomUsers(roomId));

		console.log(`User joined room ${roomId}, user ID: ${socket.id}`);
		console.log('Users in all rooms', roomUsers);
	});

	socket.on('disconnect', () => {
		removeUserFromRooms(socket.id);
		console.log(`User disconnected, user ID: ${socket.id}`);
	});
});

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
