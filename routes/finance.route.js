const express = require('express');
const financeController = require('../controllers/finance.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/pay-salary', financeController.calculatePayroll);
router.post('/new-subscription', financeController.createSubscription);
router.post('/set-subscription', financeController.setSubscription);
router.get('/get-subscriptions', financeController.getSubscriptions);

module.exports = router;