const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');

// crear turnos para profesor / maquinas (acceso general) horario de la proxima semana solo
function createNewAppointment(req, res) {
    
}

// obtencion de todos los turnos disponibles para un profesor en especifico. Solo de la semana actual
function getTrainnerAvailableAppointments(req, res) {

}

// seleccion de turno para el usuario maquinas y profesor.
function setAppointment(req, res) {

}

module.exports = {
    createNewAppointment: createNewAppointment,
    getTrainnerAvailableAppointments: getTrainnerAvailableAppointments,
    setAppointment: setAppointment
} 