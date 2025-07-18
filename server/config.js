module.exports = {
	PORT: process.env.PORT || 8000,

	CORS_ORIGINS: ['http://localhost:4200'],

	ROOM: {
		MAX_USERS: 10,
		FILL_TIMEOUT_SEC: 1, //! 20
		COUNTDOWN_START_SEC: 1, //! 5
		RACE_TIME_MIN_SEC: 20,
		RACE_TIME_MAX_SEC: 300,
		MAX_ID_ATTEMPTS: 3,
		MIN_USERS_TO_START: 2,
	},

	RACE_TEXT: {
		MIN_LENGTH: 50,
		MAX_LENGTH: 400,
		API_URL: 'https://api.quotable.io/random',
	},

	SOCKET_EVENTS: {
		JOIN_ROOM: 'join-room',
		JOIN_REJECTED: 'join-rejected',
		RACE_TEXT: 'race-text',
		UPDATE_USERS: 'update-users',
		USER_STATS_UPDATE: 'user-stats-update',
		USER_FINISHED: 'user-finished',
		COUNTDOWN_TIMER_STARTED: 'countdown-timer-started',
		COUNTDOWN_UPDATE: 'countdown-update',
		COUNTDOWN_TIMER_FINISHED: 'countdown-timer-finished',
		UPDATE_TOTAL_RACE_TIME: 'update-total-race-time',
		RACE_TIME_FINISHED: 'race-time-finished',
		UPDATE_USER_STATS: 'update-user-stats',
	},
};
