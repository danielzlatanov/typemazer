const config = require('../../config.js');
const crypto = require('crypto');
const roomService = require('../services/roomService.js');
const raceService = require('../services/raceService.js');

async function createRoom(req, res) {
	let roomId;
	const MAX_ATTEMPTS = config.ROOM.MAX_ID_ATTEMPTS;
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
		socket.emit(config.SOCKET_EVENTS.JOIN_REJECTED, { reason: 'invalid-room-id' });
		return;
	}

	const cleanUsername = roomService.sanitizeUsername(username);
	if (!cleanUsername) {
		socket.emit(config.SOCKET_EVENTS.JOIN_REJECTED, { reason: 'invalid-username' });
		return;
	}

	if (!roomService.roomUsers[roomId]) {
		roomService.roomUsers[roomId] = [];
		roomService.roomState[roomId] = { countdownTimerActive: false, countdownTimerFinished: false };
		roomService.usersFinishedByRoom[roomId] = new Set();

		try {
			const text = await raceService.fetchRaceText(config.RACE_TEXT.MIN_LENGTH, config.RACE_TEXT.MAX_LENGTH);
			roomService.roomState[roomId].text = text;

			const textLength = text.length;

			const baseMinutes = textLength / 250;
			const bufferFactor = 1.3; //! ~30% more time than the bare minimum
			let raceTimeSeconds = Math.ceil(baseMinutes * bufferFactor * 60);

			raceTimeSeconds = Math.max(
				config.ROOM.RACE_TIME_MIN_SEC,
				Math.min(raceTimeSeconds, config.ROOM.RACE_TIME_MAX_SEC)
			);

			roomService.roomRaceTime[roomId] = raceTimeSeconds;
		} catch (err) {
			roomService.roomState[roomId].text = 'Error fetching text, please try again.';
			roomService.roomRaceTime[roomId] = config.ROOM.RACE_TIME_MIN_SEC;
		}
	}

	if (roomService.roomState[roomId].countdownTimerFinished) {
		socket.emit(config.SOCKET_EVENTS.JOIN_REJECTED, { reason: 'countdown-finished' });
		return;
	}

	if (roomService.roomUsers[roomId].length >= config.ROOM.MAX_USERS) {
		socket.emit(config.SOCKET_EVENTS.JOIN_REJECTED, { reason: 'room-full' });
		return;
	}

	const userData = { id: socket.id, username: cleanUsername };
	roomService.roomUsers[roomId].push(userData);
	socket.join(roomId);

	socket.emit(config.SOCKET_EVENTS.RACE_TEXT, roomService.roomState[roomId].text);
	io.to(roomId).emit(config.SOCKET_EVENTS.UPDATE_USERS, roomService.getRoomUsers(roomId));

	roomService.handleRoomTimers(roomId, io);

	socket.on(config.SOCKET_EVENTS.USER_STATS_UPDATE, data => {
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
