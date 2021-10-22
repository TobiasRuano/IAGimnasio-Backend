const express = require('express');
const financeController = require('../controllers/finance.controller');

const router = express.Router();

router.post('/pay-salary', financeController.calculatePayroll);
router.post('/new-subscription', financeController.createSubscription);
router.patch('/subscription', financeController.updateSubscription);
router.delete('/', financeController.deleteSubscriptions);
router.post('/set-subscription', financeController.setSubscription);
router.get('/get-subscriptions', financeController.getSubscriptions);
router.get('/get-user-subscription', financeController.getUserSubscription);

module.exports = router;