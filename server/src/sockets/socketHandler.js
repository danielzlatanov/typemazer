const config = require('../../config.js');
const roomController = require('../controllers/roomController.js');

function socketHandler(io) {
	io.on('connection', socket => {
		console.log('A user connected, user ID:', socket.id);

		socket.on(config.SOCKET_EVENTS.JOIN_ROOM, data => {
			roomController.joinRoom(socket, io, data);
		});

		socket.on('disconnect', () => {
			roomController.disconnect(socket, io);
			console.log('User disconnected, user ID:', socket.id);
		});
	});
}

module.exports = socketHandler;
