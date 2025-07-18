require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: ['http://localhost:4200'],
		methods: ['GET', 'POST'],
	},
});

const indexRoutes = require('./src/routes/index.js');
const raceRoutes = require('./src/routes/raceRoutes.js');
const roomRoutes = require('./src/routes/roomRoutes.js');
const socketHandler = require('./src/sockets/socketHandler.js');

app.use(cors());
app.use(express.json());

app.use('/', indexRoutes);
app.use('/', raceRoutes);
app.use('/', roomRoutes);

socketHandler(io);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
