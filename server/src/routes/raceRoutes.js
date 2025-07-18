const express = require('express');
const router = express.Router();
const raceController = require('../controllers/raceController.js');

router.get('/race-text', raceController.getRaceText);

module.exports = router;
