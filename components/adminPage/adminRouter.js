const express = require('express');
const router = express.Router();
const controller = require('./adminController');

router.use(express.json());

router.use(express.urlencoded({ extended: true }));

router.get('/', controller.getLoginPage);

router.get('/login', controller.getLoginPage);

router.get('/main', controller.getIndexPage);

router.post('/add', controller.createNew)

router.put('/detail/:id', controller.changeApproval);

module.exports = router;