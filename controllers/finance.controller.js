const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');


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

// subscribir un usuario a un abono especifico
function setSubscription(req, res) {

}

//TODO: liquidar sueldo
function calculatePayroll(req, res) {
    models.employee.findOne({where:{dni:req.body.dni}}).then(employee => {
        if(employee) {
            if(employee.type == 2) {
                employee.hoursWorked = 160
            }

            //TODO: liquidar sueldo

            const sueldo = employee.hoursWorked * employee.salaryPerHour
            res.status(200).json({
                message: "Sueldo liquidado para el trabador!",
                sueldo: sueldo
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
    createSubscription: createSubscription,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll
} 
