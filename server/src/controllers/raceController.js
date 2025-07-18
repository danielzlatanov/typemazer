const raceService = require('../services/raceService.js');

async function getRaceText(req, res) {
	const { minLength, maxLength } = req.query;
	try {
		const text = await raceService.fetchRaceText(minLength, maxLength);
		res.json({ content: text });
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch race text' });
	}
}

module.exports = { getRaceText };
