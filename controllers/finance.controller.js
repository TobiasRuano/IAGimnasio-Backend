const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const { Op } = require("sequelize");
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
                            var end = moment(start, "YYYY-MM-DD").add(subscriptionInfo.length, 'days');
                            var tipo = "Efectivo";
                            var comprobante = "";
                            if(req.body.metodoPago.tipo == 1) {
                                tipo = "Tarjeta credito / debito";
                                comprobante = req.body.metodoPago.comprobante;
                            }
                            const newUserSubscription = {
                                subscriptionID: subscriptionInfo.id,
                                userID: user.id,
                                receiptNumber: comprobante,
                                paymentMethod: tipo,
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

function getUserSubscription(req, res) {
    var sqlPath = path.join(__dirname, '..', 'queries', 'getUserActiveSubscription.query.sql');
    var sqlString = fs.readFileSync(sqlPath, 'utf8');
    sequelize.sequelize.query(sqlString, {replacements: {id: req.body.userID, today: getCurrentDate()}}).then(([userSubscription, metadata]) =>{
        if(userSubscription.length != 0) {
            res.status(500).json({
                data: userSubscription
            });
        } else {
            res.status(500).json({
                message: "No posee una subscripcion activa"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error al intentar obtener el usuario!",
            error: error
        });
    });
}

async function paySubscription(metodo, res) {
    if(metodo.tipo == 0) {
        // efectivo
        return "388473984858403085" // numero de comprobante
    } else if(metodo.tipo == 1) {
        // tarjeta credito / debito
        return "473584720587910384" // numero de comprobante
    }
}

// periodo fecha de inicio y fecha de fin id
function calculatePayroll(req, res) {
    models.Employee.findOne({where:{id:req.body.id}}).then(employee => {
        if(employee) {

            const start = moment(req.body.fechaInicio, "YYYY-MM-DD hh:mm:ss");
            var end = moment(start, "YYYY-MM-DD").add(30, 'days');

            models.Wages.findOne({where:{employeeID:employee.id, dateStart: { [Op.gte]: start }, dateEnd: { [Op.lte]: end}}}).then( result => {
                if(!result) {
                    if(employee.type == 1) {
                        getHoursWorked(employee.id, start, end).then(async hoursWorked => {
                            paySalary(req, hoursWorked * employee.salaryPerHour, employee, start, end, res);
                        });
                    } else {
                        paySalary(req, employee.hoursWorked * employee.salaryPerHour, employee, start, end, res);
                    }
                } else {
                    res.status(500).json({
                        message: "Ya se liquido el sueldo para el trabajador en el periodo deseado."
                    });
                }
            }).catch(error => {
                res.status(500).json({
                    message: "Something went wrong!",
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

function paySalary(req, sueldoTotal, employee, start, end, res) {
    const jubilacion = sueldoTotal * 0.11;
    const obraSocial = sueldoTotal * 0.03;
    const pami = sueldoTotal * 0.03;

    const salario = {
        date: getCurrentDate(),
        dateStart: start,
        dateEnd: end,
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
}

function getHoursWorked(trainnerID, start, end) {
    return new Promise((resolve, reject) => {
        models.Appointment.findAll({where:{trainnerID:trainnerID}}).then(result => {
            resolve(result.length * 12); // promedio de 3 clases por semana * 4 semanas
        }).catch(error => {
            reject();
        });
    })
}

function getSubscriptions(req, res) {
    models.Subscription.findAll().then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(500).json({
                message: "No hay abonos creados!"
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
    createSubscription: createSubscription,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll,
    getSubscriptions: getSubscriptions,
    getUserSubscription: getUserSubscription
} 
