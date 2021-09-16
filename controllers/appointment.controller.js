const models = require('../models');

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
    models.Appointment.findAll().then(result => {
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
    getClasesByTrainnerID: getClasesByTrainnerID,
    setAppointment: setAppointment,
    getAllClases: getAllClases
} 