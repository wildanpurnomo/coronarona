const controller = require('./indexController');
const express = require('express');
const router = express.Router();

router.get('/', controller.indexHandler);

module.exports = router