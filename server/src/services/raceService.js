const axios = require('axios');
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

async function fetchRaceText(minLength = 50, maxLength = 150) {
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
