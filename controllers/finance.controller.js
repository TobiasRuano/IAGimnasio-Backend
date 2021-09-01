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

// TODO: Transaccions pago de la subscripcion
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
                            // TODO: esto deberia ser una transaccion con el pago dentro
                            paySubscription(req.body.metodoPago).then(reciptNumber => {
                                var start = getCurrentDate();
                                var end = moment(start, "YYYY-MM-DD").add(subscriptionInfo.length, 'days');

                                var tipo = "Efectivo";
                                if(req.body.metodoPago.tipo == 1) {
                                    tipo = "Tarjeta credito / debito";
                                }

                                const newUserSubscription = {
                                    subscriptionID: subscriptionInfo.id,
                                    userID: user.id,
                                    receiptNumber: reciptNumber,
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
                            }).catch(error => {
                                res.status(500).json({
                                    message: "Error al intenar abonar la subscripcion",
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
            if(employee.type == 1) {
                getHoursWorked(employee.id, req.body.fechaInicio, req.body.fechaFin).then(async hoursWorked => {
                    console.log("El valor de hoursWorked es: ")
                    console.log(hoursWorked);
                    paySalary(req, hoursWorked * employee.salaryPerHour, employee, res);
                });
            } else {
                paySalary(req, employee.hoursWorked * employee.salaryPerHour, employee, res);
            }
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

function paySalary(req, sueldoTotal, employee, res) {
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

    res.status(200).json({
        message: "Sueldo liquidado para el trabador!",
        sueldo: salario
    });
    /*
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
    });*/
}

function getHoursWorked(trainnerID, startDate, endDate) {
    const start = moment(startDate, "YYYY-MM-DD hh:mm:ss");
    const end = moment(endDate, "YYYY-MM-DD hh:mm:ss");

    models.Appointment.findAll({where:{trainnerID:trainnerID, dateTimeStart: { [Op.gt]: start , [Op.lt]: end}}}).then(result => {
        console.log(result.length)
        return result.length
    });
}


module.exports = {
    createSubscription: createSubscription,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll
} 
