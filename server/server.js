require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
	res.send('Server is running');
});

io.on('connection', socket => {
	console.log('A user connected');
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
