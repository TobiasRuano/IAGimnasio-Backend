const express = require('express');
const appointmentController = require('../controllers/appointment.controller');

const router = express.Router();

router.post('/new', appointmentController.createNewAppointments);
router.delete('/', appointmentController.deleteAppointment);
router.patch('/', appointmentController.updateAppointment);
router.get('/clases-by-trainner', appointmentController.getClasesByTrainnerID);
router.get('/', appointmentController.getAllClases);
router.post('/set', appointmentController.setAppointment);

module.exports = router;