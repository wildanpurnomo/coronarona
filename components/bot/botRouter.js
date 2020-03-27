const controller = require('./botController');
const line = require('@line/bot-sdk');
const express = require('express');
const router = express.Router();
const Config = require('./botConfig');

router.post('/callback', line.middleware(Config), controller.callback);

module.exports = router;