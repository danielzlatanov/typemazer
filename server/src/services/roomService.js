const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const MAX_USERS_PER_ROOM = 10;
const ROOM_FILL_TIMEOUT = 20;

const roomUsers = {};
const roomState = {};
const roomRaceTime = {};
const usersFinishedByRoom = {};
const roomFillTimers = {};

function sanitizeUsername(name) {
	if (!name || typeof name !== 'string') return null;
	const trimmed = name.trim();
	const valid = /^[\w\-]{1,20}$/.test(trimmed);
	return valid ? trimmed : null;
}

function findRoomIdByUserId(userId) {
	for (const roomId in roomUsers) {
		if (roomUsers[roomId].some(user => user.id === userId)) {
			return roomId;
		}
	}
	return null;
}

function getRoomUsers(roomId) {
	return roomUsers[roomId] || [];
}

function removeUserFromRooms(userId, io) {
	for (const roomId in roomUsers) {
		roomUsers[roomId] = roomUsers[roomId].filter(user => user.id !== userId);
		io.to(roomId).emit('update-users', roomUsers[roomId]);
	}
}

function startCountdownTimer(roomId, io) {
	io.to(roomId).emit('countdown-timer-started');

	let countdown = 3;
	const intervalId = setInterval(() => {
		io.to(roomId).emit('countdown-update', countdown);
		countdown--;

		if (countdown < 0) {
			clearInterval(intervalId);
			io.to(roomId).emit('countdown-timer-finished');
			roomState[roomId].countdownTimerActive = false;
			roomState[roomId].countdownTimerFinished = true;

			startTotalTimeAllowedTimer(roomId, io);
		}
	}, 1000);
}

function startTotalTimeAllowedTimer(roomId, io) {
	const intervalId = setInterval(() => {
		if (roomRaceTime[roomId] && roomRaceTime[roomId] > 0) {
			roomRaceTime[roomId]--;
			io.to(roomId).emit('update-total-race-time', roomRaceTime[roomId]);
		}

		if (!roomRaceTime[roomId] || roomRaceTime[roomId] <= 0) {
			clearInterval(intervalId);
			io.to(roomId).emit('race-time-finished');

			delete roomRaceTime[roomId];
			delete roomState[roomId];
			delete roomUsers[roomId];
			delete usersFinishedByRoom[roomId];
		}
	}, 1000);
}

function handleRoomTimers(roomId, io) {
	if (roomUsers[roomId].length === MAX_USERS_PER_ROOM) {
		if (roomFillTimers[roomId]) {
			clearTimeout(roomFillTimers[roomId]);
			delete roomFillTimers[roomId];
		}
		startCountdownTimer(roomId, io);
		roomState[roomId].countdownTimerActive = true;
	}

	if (
		roomUsers[roomId].length >= 2 &&
		roomUsers[roomId].length < MAX_USERS_PER_ROOM &&
		!roomFillTimers[roomId] &&
		!roomState[roomId].countdownTimerActive &&
		!roomState[roomId].countdownTimerFinished
	) {
		roomFillTimers[roomId] = setTimeout(() => {
			if (
				roomUsers[roomId] &&
				roomUsers[roomId].length >= 2 &&
				roomUsers[roomId].length <= MAX_USERS_PER_ROOM &&
				!roomState[roomId].countdownTimerActive &&
				!roomState[roomId].countdownTimerFinished
			) {
				startCountdownTimer(roomId, io);
				roomState[roomId].countdownTimerActive = true;
			}
			delete roomFillTimers[roomId];
		}, ROOM_FILL_TIMEOUT * 1000);
	}
}

function handleUserStatsUpdate(socket, io, data) {
	const { roomId, userStats } = data;

	if (roomState[roomId]) {
		roomState[roomId][socket.id] = userStats;

		if (
			userStats.hasFinished &&
			!Array.from(usersFinishedByRoom[roomId]).some(entry => entry.startsWith(`${socket.id}:`))
		) {
			const place = usersFinishedByRoom[roomId].size + 1;
			usersFinishedByRoom[roomId].add(`${socket.id}:${place}`);

			io.to(roomId).emit('user-finished', { userId: socket.id, place });
		}
	}
	io.to(roomId).emit('update-user-stats', roomState[roomId]);
}

module.exports = {
	MAX_USERS_PER_ROOM,
	roomUsers,
	roomState,
	roomRaceTime,
	usersFinishedByRoom,
	roomFillTimers,
	sanitizeUsername,
	findRoomIdByUserId,
	getRoomUsers,
	removeUserFromRooms,
	startCountdownTimer,
	startTotalTimeAllowedTimer,
	handleRoomTimers,
	handleUserStatsUpdate,
};
