const models = require('../models');
const moment = require('moment');
const sequelize = require('../models/index.js');
const fs = require('fs');
var path = require('path');


// creacion de abonos
function createSubscription(req, res) {

}

// subscribir un usuario
function setSubscription(req, res) {

}

function calculatePayroll(req, res) {
    models.employee.findOne({where:{dni:req.body.dni}}).then(employee => {
        if(employee) {
            if(employee.type == 2) {
                employee.hoursWorked = 160
            }

            //liquidar sueldo
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
