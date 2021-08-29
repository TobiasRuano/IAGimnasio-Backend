const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');
const { start } = require('repl');

function getCurrentDate() {
    var date = moment().tz("America/Buenos_Aires").format('YYYY-MM-DD');;
    return date;
}

// creacion de abonos
function createSubscription(req, res) {
    models.Subscription.findOne({where:{length:req.body.length}}).then(result => {
        if(result) {
            res.status(500).json({
                message: "Ya existe un abono con la duracion deseada."
            });
        } else {
            const abono = {
                type: req.body.type,
                length: parseInt(req.body.length),
                price: parseFloat(req.body.price)
            }

            models.Subscription.create(abono).then(result2 => {
                res.status(201).json({
                    message: "Abono creado correctamente!",
                    data: result2
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Ocurrio un error al crear el abono!",
                    error: error
                });
            });
        }
    }). catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

// TODO: implementar pago de la subscripcion
function setSubscription(req, res) {
    models.User.findOne({where:{dni:req.body.dni}}).then(user => {
        if(user) {
            var sqlPath = path.join(__dirname, '..', 'queries', 'getUserActiveSubscription.query.sql');
            var sqlString = fs.readFileSync(sqlPath, 'utf8');
            sequelize.sequelize.query(sqlString, {replacements: {id: user.id, today: getCurrentDate()}}).then(([userSubscription, metadata]) =>{
                if(userSubscription.length != 0) {
                    res.status(500).json({
                        message: "El usuario ya posee una subscripcion activa."
                    });
                } else {
                    models.Subscription.findOne({where:{id:req.body.subscriptionID}}).then(subscriptionInfo => {
                        if(subscriptionInfo) {
                            var start = getCurrentDate();
                            var end = moment(start, "YYYY-MM-DD").add(subscriptionInfo.length, 'days');;
                            const newUserSubscription = {
                                subscriptionID: subscriptionInfo.id,
                                userID: user.id,
                                startDate: start,
                                endDate: end
                            }
                            
                            models.UserSubscription.create(newUserSubscription).then(result => {
                                res.status(201).json({
                                    message: "Abono creado correctamente!",
                                    data: result
                                });
                            }).catch(error => {
                                res.status(500).json({
                                    message: "Error al crear el abono",
                                    error: error
                                });
                            });
                        }
                    }).catch(error => {
                        res.status(500).json({
                            message: "Error al Obtener la informacion de abono deseado",
                            error: error
                        });
                    });
                }
            }).catch(error => {
                res.status(500).json({
                    message: "Error al intentar obtener las subscripciones del usuario",
                    error: error
                });
            });
        } else {
            res.status(404).json({
                message: "No existe el usuario!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error al intentar obtener el usuario!",
            error: error
        });
    });
}

function calculatePayroll(req, res) {
    models.employee.findOne({where:{dni:req.body.dni}}).then(employee => {
        if(employee) {
            const sueldoTotal = employee.hoursWorked * employee.salaryPerHour;
            const jubilacion = sueldoTotal * 0.11;
            const obraSocial = sueldoTotal * 0.03;
            const pami = sueldoTotal * 0.03;

            const salario = {
                date: getCurrentDate(),
                period: req.body.periodo,
                employeeID: employee.id,
                jubilacion: jubilacion,
                obraSocial: obraSocial,
                pami: pami,
                total: (sueldoTotal - jubilacion - obraSocial - pami)
            }

            models.Wages.create(salario).then(result => {
                res.status(200).json({
                    message: "Sueldo liquidado para el trabador!",
                    sueldo: result
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Hubo un error al liquidar el sueldo.",
                    error: error
                });
            });
        } else {
            res.status(404).json({
                message: "No existe un empleado para ese ID."
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
    createSubscription: createSubscription,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll
} 
