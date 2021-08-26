const express = require('express');
const userController = require('../controllers/user.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/sign-up', userController.createUser);
router.post('/', userController.getUserData);
router.post('/login', userController.login);

module.exports = router;