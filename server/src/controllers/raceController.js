const config = require('../../config.js');
const raceService = require('../services/raceService.js');

async function getRaceText(req, res) {
	const minLength = parseInt(req.query.minLength) || config.RACE_TEXT.MIN_LENGTH;
	const maxLength = parseInt(req.query.maxLength) || config.RACE_TEXT.MAX_LENGTH;

	try {
		const text = await raceService.fetchRaceText(minLength, maxLength);
		res.json({ content: text });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch race text' });
	}
}

module.exports = { getRaceText };
