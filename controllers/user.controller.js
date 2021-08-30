const models = require('../models');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');

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
                        Surname: req.body.surname,
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

// juntar con descripcion medica
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
    getTrainners: getTrainners,
    getEmployees: getEmployees
} 