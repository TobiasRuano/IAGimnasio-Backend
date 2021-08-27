const express = require('express');
const financeController = require('../controllers/finance.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/paySalary', financeController.calculatePayroll);

module.exports = router;