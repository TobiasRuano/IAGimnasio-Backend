const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/new', appointmentController.createNewAppointments);
router.post('/set-appointment', appointmentController.setAppointment);
router.post('/get-available-trainner', appointmentController.getTrainnerAvailableAppointments);
router.get('/get-clases', appointmentController.getFutureClases);
router.post('/set', appointmentController.setAppointment);

module.exports = router;