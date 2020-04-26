const controller = require('./webChatbotController');
const express = require('express');
const router = express.Router();

router.get('/', controller.getIndexPage);

module.exports = router;