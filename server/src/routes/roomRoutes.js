const express = require('express');
const router = express.Router();
const roomController = require('../roomController');

router.post('/create-room', roomController.createRoom);

module.exports = router;
