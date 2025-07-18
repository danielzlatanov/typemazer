const config = require('../../config.js');
const MAX_USERS_PER_ROOM = config.ROOM.MAX_USERS;
const ROOM_FILL_TIMEOUT = config.ROOM.FILL_TIMEOUT_SEC;

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

function canStartCountdown(roomId) {
	return (
		roomUsers[roomId] &&
		roomUsers[roomId].length >= config.ROOM.MIN_USERS_TO_START &&
		roomUsers[roomId].length <= MAX_USERS_PER_ROOM &&
		!roomState[roomId].countdownTimerActive &&
		!roomState[roomId].countdownTimerFinished
	);
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
		io.to(roomId).emit(config.SOCKET_EVENTS.UPDATE_USERS, roomUsers[roomId]);
	}
}

function startCountdownTimer(roomId, io) {
	io.to(roomId).emit(config.SOCKET_EVENTS.COUNTDOWN_TIMER_STARTED);

	let countdown = config.ROOM.COUNTDOWN_START_SEC;
	const intervalId = setInterval(() => {
		io.to(roomId).emit(config.SOCKET_EVENTS.COUNTDOWN_UPDATE, countdown);
		countdown--;

		if (countdown < 0) {
			clearInterval(intervalId);
			io.to(roomId).emit(config.SOCKET_EVENTS.COUNTDOWN_TIMER_FINISHED);
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
			io.to(roomId).emit(config.SOCKET_EVENTS.UPDATE_TOTAL_RACE_TIME, roomRaceTime[roomId]);
		}

		if (!roomRaceTime[roomId] || roomRaceTime[roomId] <= 0) {
			clearInterval(intervalId);
			io.to(roomId).emit(config.SOCKET_EVENTS.RACE_TIME_FINISHED);

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

	if (canStartCountdown(roomId) && !roomFillTimers[roomId]) {
		roomFillTimers[roomId] = setTimeout(() => {
			if (canStartCountdown(roomId)) {
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

			io.to(roomId).emit(config.SOCKET_EVENTS.USER_FINISHED, { userId: socket.id, place });
		}
	}
	io.to(roomId).emit(config.SOCKET_EVENTS.UPDATE_USER_STATS, roomState[roomId]);
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
