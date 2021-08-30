const express = require('express');
const userController = require('../controllers/user.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/sign-up', userController.createUser);
router.post('/', userController.getUserData);
router.post('/login', userController.login);
router.get('/trainners', userController.getTrainners);
router.get('/employees', userController.getEmployees);

module.exports = router;