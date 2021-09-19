const express = require('express');
const userController = require('../controllers/user.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/sign-up', userController.createUser);
router.delete('/', userController.deleteUser);
router.patch('/', userController.updateUser);
router.patch('/employee', userController.updateEmployee);
router.delete('/employee', userController.deleteEmployee);
router.get('/', userController.getUserData);
router.get('/get-users', userController.getAllUsers);
router.post('/login', userController.login);
router.get('/trainners', userController.getTrainners);
router.get('/employees', userController.getEmployees);
router.post('/set-health-record', userController.setHealthRecord);

module.exports = router;