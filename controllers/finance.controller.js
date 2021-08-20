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

// liquidacion de sueldos
function calculatePayroll(req, res) {

}


module.exports = {
    createSubscription: createSubscription,
    setSubscription: setSubscription,
    calculatePayroll: calculatePayroll
} 
