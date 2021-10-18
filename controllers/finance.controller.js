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

function createSubscription(req, res) {
    models.Subscription.findOne({where:{length:req.body.length}}).then(result => {
        if(result) {
            res.status(401).json({
                message: "Ya existe un abono con la duracion deseada."
            });
        } else {
            console.log(req.body);
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
                res.status(501).json({
                    message: "Ocurrio un error al crear el abono!",
                    error: error
                });
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function updateSubscription(req, res) {
    models.Subscription.findOne({where:{id:req.body.id}}).then(result => {
        if(result) {
            const newSubscription = {
                price: req.body.price != null ? req.body.price : result.price
            }
            models.Subscription.update(newSubscription, {where: {id: result.id}}).then(result => {
                res.status(200).json({
                    message: "Abono actualizado correctamente!"
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Ocurrio un error!",
                    error: error
                });
            });
        } else {
            res.status(404).json({
                message: "No se encontro el abono solicitado"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error. Pusiste bien los datos en el body?",
            error: error
        });
    });
}

function deleteSubscriptions(req, res) {
    models.Subscription.destroy({where: {id: req.body.id}}).then(result => {
        if(result == true) {
            res.status(200).json({
                message: "Abono eliminado correctamente!"
            });
        } else {
            res.status(404).json({
                message: "No existe el abono deseado"
            });
        }
    }).catch(error => {
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
                            if(req.body.tipo == 1) {
                                tipo = "Tarjeta credito / debito";
                                comprobante = req.body.comprobante;
                            }
                            const newUserSubscription = {
                                subscriptionType: subscriptionInfo.type,
                                userID: user.id,
                                receiptNumber: comprobante,
                                paymentMethod: tipo,
                                price: subscriptionInfo.price,
                                startDate: start,
                                endDate: end
                            }
                            
                            models.UserSubscription.create(newUserSubscription).then(result => {
                                res.status(201).json({
                                    message: "Usuario subscripto correctamente!",
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
            res.status(200).json({
                data: userSubscription
            });
        } else {
            res.status(404).json({
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
async function calculatePayroll(req, res) {
    const start = moment(req.body.fechaInicio, "YYYY-MM-DD hh:mm:ss");
    var end = moment(start, "YYYY-MM-DD").add(30, 'days');

    models.Employee.findAll().then( employees => {
        return sequelize.sequelize.transaction(async (t) => {
            for(let i = 0; i < employees.length; i++) {
                const employee = employees[i];
                await models.Employee.findOne({where:{id:employee.id}}, { transaction: t }).then(async emp => {
                    var error1;
                    try {
                        if(emp) {
                            await models.Wages.findOne({where:{employeeID:emp.id, dateStart: { [Op.gte]: start }, dateEnd: { [Op.lte]: end}}}, { transaction: t }).then( async result => {
                                if(!result) {
                                    var total = 0;
                                    var a;
                                    if(emp.type == 1) {
                                        total = 160 * emp.salaryPerHour;
                                        a = await paySalary(total, emp, start, end, { transaction: t });
                                    } else {
                                        total = emp.hoursWorked * emp.salaryPerHour;
                                        a = await paySalary(total, emp, start, end, { transaction: t });
                                    }
                                    return a
                                } else {
                                    const m = "El empleado: " + emp.id + " ya tenia un sueldo liquidado.";
                                    throw new Error(m);
                                }
                            }).catch( error => {
                                error1 = error;
                                throw error;
                            });
                        } else {
                            if(error1) {
                                throw new Error(error1);
                            } else {
                                error1 = "No existe el empleado: " + employee.id;
                                throw new Error(error1);
                            }
                        }
                    } catch {
                        throw new Error(error1);
                    }
                });
            }
        }).then(result => {
            res.status(200).json({
                message: "Todos los sueldos fueron liquidados!"
            });
        }).catch(error => {
            res.status(500).json({
                message: "Error al intentar liquidar los sueldos.",
                more: "Posiblemente esten mal los ID's de los empleados, o algun empleado ya tuvo su sueldo liquidado."
            });
        });
    }).catch(error => {
        res.status(500).json({
            message: "Error al intentar liquidar los sueldos.",
            more: "No se pudieron obtener los empleados.",
            error: error
        });
    });
}

function paySalary(sueldoTotal, employee, start, end, transaction) {
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

    return models.Wages.create(salario, transaction).catch(error => {
        console.log("Error al intentar liquidar el sueldo del id: " + employee.id);
        throw new Error();
    });
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
    updateSubscription: updateSubscription,
    deleteSubscriptions: deleteSubscriptions,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll,
    getSubscriptions: getSubscriptions,
    getUserSubscription: getUserSubscription
} 
