const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');

function getCurrentDate() {
    var date = moment().tz("America/Buenos_Aires").format('YYYY-MM-DD');;
    return date;
}

function createUser(req, res){
    models.User.findOne({where:{dni:req.body.dni}}).then(result => {
        if(result){
            res.status(400).json({
                message: "El DNI ya existe en la base de datos!",
            });
        } else {
            bcryptjs.genSalt(10, function(err, salt){
                bcryptjs.hash(req.body.password, salt, function(err, hash){
                    var date = moment(req.body.birthday).tz("America/Buenos_Aires");
                    const user = {
                        dni: req.body.dni,
                        name: req.body.name,
                        surname: req.body.surname,
                        email: req.body.email,
                        birthday: date,
                        address: req.body.address,
                        phone: req.body.phone,
                        password: hash
                    }

                    if(req.body.type == 0) {
                        user.subscriptionID = null
                        user.AppointmentID = null
                        user.healthDataID = null
                        user.type = 0

                        saveNewUser(models.User, user, res, "Usuario creado exitosamente!");

                    } else if (req.body.type == 1) {
                        user.salaryPerHour = 100
                        user.hoursWorked = 0
                        user.type = 1

                        saveNewUser(models.Employee, user, res, "Entrenador creado exitosamente!");

                    } else if (req.body.type == 2){
                        user.salaryPerHour = 120
                        user.type = 2
                        user.hoursWorked = 160

                        saveNewUser(models.Employee, user, res, "Administrador creado exitosamente!");

                    } else {
                        res.status(500).json({
                            message: "Ocurrio un error!",
                            error: "El tipo de usuario a crear no fue dado. 0 para usuario normal, 1 para entrenador, 2 para admin."
                        });
                    }
                });
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function saveNewUser(model, user, res, mes) {
    model.create(user).then(result => {
        res.status(201).json({
            message: mes,
            data: user
        });
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function login(req, res){
    models.User.findOne({where:{mail: req.body.mail}}).then(user => {
        if(user === null){
            res.status(404).json({
                message: "Usuario no encontrado",
            });
        } else {
            bcryptjs.compare(req.body.password, user.password, function(err, result){
                if(result){
                    const token = jwt.sign({
                        email: user.mail,
                        userId: user.id
                    }, process.env.JWT_KEY, function(err, token){
                        res.status(200).json({
                            message: "Exito!",
                            token: token,
                            data: user
                        });
                    });
                } else {
                    res.status(401).json({
                        message: "Credenciales invalidas",
                    });
                }
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
        });
    });
}

// TODO: juntar con descripcion medica
function getUserData(req, res) {
    models.User.findOne({where:{dni:req.body.dni}}).then(user => {
        if(user) {
            res.status(200).json({
                data: user
            });
        } else {
            res.status(500).json({
                message: "Something went wrong!",
                error: error
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function getAllUsers(req, res) {
    models.User.findAll().then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(500).json({
                message: "No users!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function setHealthRecord(req, res) {
    models.User.findOne({where:{id:req.body.userID}}).then(user => {
        if(user) {
            var date = null;
            if(req.body.medicalDischarge == true) {
                date = getCurrentDate();
            }
            const record = {
                userID: user.id,
                data: req.body.data,
                medicalDischarge: req.body.medicalDischarge,
                medicalDischargeDate: date
            }

            models.HealthRecords.findOne({where:{userID:user.id}}).then(result => {
                if(result) {
                    models.HealthRecords.update(record, {where:{id:result.id}}).then(result2 => {
                        updateHealthRecordIDUserModel(result, user, res);
                    }).catch(error => {
                        res.status(500).json({
                            message: "Ocurrio un error!",
                            error: error
                        });
                    });
                } else {
                    models.HealthRecords.create(record).then(result3 => {
                        updateHealthRecordIDUserModel(result3, user, res);
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
                    error: error
                });
            });
        } else {
            res.status(500).json({
                message: "No existe un usuario con el ID dado"
            });
        }
    }).catch(error =>{
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

function updateHealthRecordIDUserModel(result, user, res) {
    models.User.update({healthDataID:result.id}, {where:{id:user.id}}).then(result4 => {
        res.status(200).json({
            message: "Informacion medica actualizada!",
            data: result4
        });
    }).catch(error => {
        res.status(200).json({
            message: "Hubo un error al actualizar la informacion!",
            error: error
        });
    });
}

function getTrainners(req, res) {
    models.Employee.findAll({where:{type:1}}).then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(500).json({
                message: "Something went wrong!",
                error: error
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function getEmployees(req, res) {
    models.Employee.findAll().then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(500).json({
                message: "Something went wrong!",
                error: error
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

module.exports = {
    createUser: createUser,
    login: login,
    getUserData: getUserData,
    getAllUsers: getAllUsers,
    getTrainners: getTrainners,
    getEmployees: getEmployees,
    setHealthRecord: setHealthRecord
} 