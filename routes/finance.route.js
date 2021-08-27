const express = require('express');
const financeController = require('../controllers/finance.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/pay-salary', financeController.calculatePayroll);
router.post('/new-subscription', financeController.createSubscription);

module.exports = router;