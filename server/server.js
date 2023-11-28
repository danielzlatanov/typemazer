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

io.on('connection', socket => {
	console.log('A user connected, socketId: ' + socket.id);

	socket.on('join-room', roomId => {
		socket.join(roomId);
		console.log(`User joined room ${roomId}`);
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
