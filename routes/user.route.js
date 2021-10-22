const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post('/sign-up', userController.createUser);
router.post('/escuelas', userController.newUsersFromSchool);
router.delete('/', userController.deleteUser);
router.patch('/', userController.updateUser);
router.patch('/employee', userController.updateEmployee);
router.delete('/employee', userController.deleteEmployee);
router.get('/get-users', userController.getAllUsers);
router.get('/trainners', userController.getTrainners);
router.get('/employees', userController.getEmployees);
router.post('/set-health-record', userController.setHealthRecord);

module.exports = router;