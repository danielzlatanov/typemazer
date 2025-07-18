const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController.js');

router.post('/create-room', roomController.createRoom);

module.exports = router;
