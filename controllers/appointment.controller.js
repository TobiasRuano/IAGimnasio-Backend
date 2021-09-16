const models = require('../models');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');

function createNewAppointments(req, res) {
    models.Appointment.findOne({where:{name:req.body.nombre}}).then(result => {
        if(result) {
            res.status(400).json({
                message: "Ya existe una clase con ese nombre!"
            });
        } else {
            const newAppointment = {
                name: req.body.nombre,
                trainnerID: req.body.profesor,
                description: req.body.descripcion,
                schedule: req.body.horarios
            }
            models.Appointment.create(newAppointment).then(result => {
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
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error
        });
    });
}

function deleteAppointment(req, res) {
    models.Appointment.destroy({where: {id: req.body.id}}).then(result => {
        if(result == true) {
            res.status(200).json({
                message: "Clase eliminada correctamente."
            });
        } else {
            res.status(404).json({
                message: "No existe la clase a eliminar."
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function getClasesByTrainnerID(req, res) {
    models.Appointment.findAll({where:{trainnerID:req.body.trainnerID}}).then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(404).json({
                message: "Ocurrio un error!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function getAllClases(req, res) {
    var sqlPath = path.join(__dirname, '..', 'queries', 'getAllAppointments.query.sql');
    var sqlString = fs.readFileSync(sqlPath, 'utf8');
    sequelize.sequelize.query(sqlString).then(([result, metadata]) =>{
        res.status(200).json({
            data: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function setAppointment(req, res) {
    models.Appointment.findOne({where:{id:req.body.claseID}}).then(result => {
        if(result) {
            const newUserAppointment = {
                appointmentID: req.body.claseID,
                userID: req.body.userID
            }
            models.UserAppointment.create(newUserAppointment).then(result => {
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
    deleteAppointment: deleteAppointment,
    getClasesByTrainnerID: getClasesByTrainnerID,
    setAppointment: setAppointment,
    getAllClases: getAllClases
} 