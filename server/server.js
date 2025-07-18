require('dotenv').config();
const config = require('./config.js');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const allowedOrigins = config.CORS_ORIGINS;

app.use(express.json());
app.use(
	cors({
		origin: allowedOrigins,
		methods: ['GET', 'POST'],
	})
);

const io = new Server(server, {
	cors: {
		origin: allowedOrigins,
		methods: ['GET', 'POST'],
	},
});

const indexRoutes = require('./src/routes/index.js');
const raceRoutes = require('./src/routes/raceRoutes.js');
const roomRoutes = require('./src/routes/roomRoutes.js');
const socketHandler = require('./src/sockets/socketHandler.js');

app.use('/', indexRoutes);
app.use('/', raceRoutes);
app.use('/', roomRoutes);

socketHandler(io);

server.listen(config.PORT, () => {
	console.log(`Server is running on port ${config.PORT}`);
});
