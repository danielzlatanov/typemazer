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

io.on('connection', socket => {
	console.log('A user connected');

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
