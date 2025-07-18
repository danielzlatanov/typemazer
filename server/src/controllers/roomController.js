const crypto = require('crypto');
const roomService = require('../services/roomService.js');
const raceService = require('../services/raceService.js');

async function createRoom(req, res) {
	let roomId;
	const MAX_ATTEMPTS = 3;
	let attempts = 0;

	do {
		roomId = crypto.randomBytes(8).toString('hex');
		attempts++;
	} while (roomService.roomUsers[roomId] && attempts < MAX_ATTEMPTS);

	if (roomService.roomUsers[roomId]) {
		return res.status(500).send({ error: 'Could not generate unique room ID' });
	}

	res.send({ roomId });
}

async function joinRoom(socket, io, data) {
	const { roomId, username } = data;

	if (!roomId || typeof roomId !== 'string' || roomId.trim() === '') {
		socket.emit('join-rejected', { reason: 'invalid-room-id' });
		return;
	}

	const cleanUsername = roomService.sanitizeUsername(username);
	if (!cleanUsername) {
		socket.emit('join-rejected', { reason: 'invalid-username' });
		return;
	}

	if (!roomService.roomUsers[roomId]) {
		roomService.roomUsers[roomId] = [];
		roomService.roomState[roomId] = { countdownTimerActive: false, countdownTimerFinished: false };
		roomService.roomRaceTime[roomId] = 20;
		roomService.usersFinishedByRoom[roomId] = new Set();

		try {
			const text = await raceService.fetchRaceText(50, 150);
			roomService.roomState[roomId].text = text;
		} catch (err) {
			roomService.roomState[roomId].text = 'Error fetching text, please try again.';
		}
	}

	if (roomService.roomState[roomId].countdownTimerFinished) {
		socket.emit('join-rejected', { reason: 'countdown-finished' });
		return;
	}

	if (roomService.roomUsers[roomId].length >= roomService.MAX_USERS_PER_ROOM) {
		socket.emit('join-rejected', { reason: 'room-full' });
		return;
	}

	const userData = { id: socket.id, username: cleanUsername };
	roomService.roomUsers[roomId].push(userData);
	socket.join(roomId);

	socket.emit('race-text', roomService.roomState[roomId].text);
	io.to(roomId).emit('update-users', roomService.getRoomUsers(roomId));

	roomService.handleRoomTimers(roomId, io);

	socket.on('user-stats-update', data => {
		roomService.handleUserStatsUpdate(socket, io, data);
	});
}

function disconnect(socket, io) {
	const roomId = roomService.findRoomIdByUserId(socket.id);
	roomService.removeUserFromRooms(socket.id, io);

	if (roomId && (!roomService.roomUsers[roomId] || roomService.roomUsers[roomId].length === 0)) {
		if (roomService.roomFillTimers[roomId]) {
			clearTimeout(roomService.roomFillTimers[roomId]);
			delete roomService.roomFillTimers[roomId];
		}

		delete roomService.roomRaceTime[roomId];
		delete roomService.roomState[roomId];
		delete roomService.roomUsers[roomId];
		delete roomService.usersFinishedByRoom[roomId];
	}
}

module.exports = { createRoom, joinRoom, disconnect };
