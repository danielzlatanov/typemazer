const config = require('../../config.js');
const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchRaceText(minLength = config.RACE_TEXT.MIN_LENGTH, maxLength = config.RACE_TEXT.MAX_LENGTH) {
	const params = {};
	if (minLength) params.minLength = minLength;
	if (maxLength) params.maxLength = maxLength;

	const response = await axios.get('https://api.quotable.io/random', {
		httpsAgent: agent,
		params,
	});

	return response.data.content;
}

module.exports = { fetchRaceText };
