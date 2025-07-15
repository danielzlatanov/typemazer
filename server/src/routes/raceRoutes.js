const express = require('express');
const router = express.Router();
const raceController = require('../raceController');

router.get('/race-text', raceController.getRaceText);

module.exports = router;
