const express = require('express');
const appointmentController = require('../controllers/appointment.controller');
const checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.post('/new', appointmentController.createNewAppointments);
router.post('/get-trainner-clases', appointmentController.getTrainnerAvailableAppointments);
router.post('/get-trainner-today-clases', appointmentController.getTrainnerTodaysAppointmens);
router.get('/get-clases', appointmentController.getFutureClases);
router.post('/set', appointmentController.setAppointment);

module.exports = router;