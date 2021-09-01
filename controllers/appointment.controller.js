const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const { Op } = require("sequelize");
const fs = require('fs');
var path = require('path');

function getCurrentDate() {
    var date = moment().tz("America/Buenos_Aires").format('YYYY-MM-DD HH:mm:ss');
    return date;
}

// TODO: chequear profesor una solo clase por hora
// TODO: iterar cantidad de veces a repetir
function createNewAppointments(req, res) {
    const appointmentSchedule = req.body.horarios;
    return sequelize.sequelize.transaction(t => {

        const promises = []
          
        for (let i = 0; i < appointmentSchedule.length; i++) {
            var start = moment(appointmentSchedule[i], "YYYY-MM-DD hh:mm:ss");
            var end = moment(start, "YYYY-MM-DD hh:mm:ss").add(1, 'hours');
            const ind = req.body.cupos == 1 ? true : false;
            const newAppointment = {
                name: req.body.nombre,
                dateTimeStart: start,
                dateTimeEnd: end,
                availableSlots: req.body.cupos,
                trainnerID: req.body.profesor,
                isIndividual: ind
            }
            const promise = models.Appointment.create(newAppointment, { transaction: t })
            promises.push(promise)
        }
        return Promise.all(promises)
      
    }).then(result => {
        res.status(201).json({
            message: "Clases creadas correctamente!",
            data: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

// obtencion de todos los turnos disponibles para un profesor en especifico.
function getTrainnerAvailableAppointments(req, res) {
    models.Appointment.findAll({where:{trainnerID:req.body.trainnerID, dateTimeStart: { [Op.gt]: getCurrentDate() }}}).then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(404).json({
                message: "El entrenador no posee clases!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function getTrainnerTodaysAppointmens(req, res) {
    const startDate = moment().startOf('day')
    const endDate = moment(startDate, "YYYY-MM-DD hh:mm:ss").add(1, 'day');

    models.Appointment.findAll({where:{trainnerID:req.body.trainnerID, dateTimeStart: { [Op.gt]: startDate , [Op.lt]: endDate}}}).then(result => {
        if(result.length != 0) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(404).json({
                message: "El entrenador no posee clases para el dia de la fecha!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function getFutureClases(req, res) {
    models.Appointment.findAll({where:{isIndividual:false, dateTimeStart: { [Op.gt]: getCurrentDate() }}}).then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(404).json({
                message: "No hay clases!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

// seleccion de turno para el usuario. Maquinas y profesor.
function setAppointment(req, res) {
    models.Appointment.findOne({where:{id:req.body.claseID}}).then(result => {
        if(result) {
            if(result.availableSlots > 0) {

                return sequelize.sequelize.transaction(t => {
                    const promises = []

                    const newUserAppointment = {
                        appointmentID: req.body.claseID,
                        userID: req.body.userID
                    }
                    const promise1 = models.UserAppointment.create(newUserAppointment, { transaction: t })
                    promises.push(promise1)

                    const availableSlots = result.availableSlots - 1;
                    const promise2 = models.Appointment.update({availableSlots: availableSlots}, {where:{id:result.id}}, { transaction: t })
                    promises.push(promise2)
                      
                    return Promise.all(promises)
                }).then(result => {
                    res.status(201).json({
                        message: "Clases asignada correctamente!",
                        data: result
                    });
                }).catch(error => {
                    res.status(500).json({
                        message: "No se pudo asignar la clase.",
                        error: error
                    });
                });
            } else {
                res.status(400).json({
                    message: "No hay mas cupos para la clase seleccionada."
                });
            }
        } else {
            res.status(404).json({
                message: "No existe una clase con el ID dado."
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

module.exports = {
    createNewAppointments: createNewAppointments,
    getTrainnerAvailableAppointments: getTrainnerAvailableAppointments,
    getTrainnerTodaysAppointmens: getTrainnerTodaysAppointmens,
    setAppointment: setAppointment,
    getFutureClases: getFutureClases
} 