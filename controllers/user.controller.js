const models = require('../models');
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
            var date = moment(req.body.birthday).tz("America/Buenos_Aires");
            const user = {
                dni: req.body.dni,
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                birthday: date,
                address: req.body.address,
                phone: req.body.phone,
                discount: 0
            }
            if(req.body.type == 0) {
                user.type = 0
                saveNewUser(models.User, user, res, "Usuario creado exitosamente!");
            } else if (req.body.type == 1) {
                user.cbu = req.body.cbu
                user.salaryPerHour = 100
                user.hoursWorked = 0
                user.type = 1
                saveNewUser(models.Employee, user, res, "Entrenador creado exitosamente!");
            } else if (req.body.type == 2){
                user.cbu = req.body.cbu
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
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

async function newUsersFromSchool(req, res){
    const users = [];
    if(req.body.estudiantes.length == null) {
        users.push(req.body.estudiantes);
    } else {
        for(let i = 0; i < req.body.estudiantes.length; i++) {
            users.push(req.body.estudiantes[i]);
        }
    }
    var students = [];
    return sequelize.sequelize.transaction(async (t) => {
        for (let i = 0; i < users.length; i++) {
            const dni = parseInt(users[i].dni);
            await models.User.findOne({where:{dni:dni}}, {transaction: t}).then(async result => {
                if(!result){
                    var date = moment(users[i].nacimiento).tz("America/Buenos_Aires");
                    const user = {
                        dni: users[i].dni,
                        name: dni,
                        surname: users[i].apellido,
                        email: users[i].mail,
                        birthday: date,
                        address: users[i].direccion,
                        phone: users[i].telefono,
                        discount: 20,
                        type: 0
                    }
                    const a = await saveNewSchoolUser(models.User, user, {transaction: t});
                    students.push(a);
                }
            }).catch(error => {
                throw error;
            });
        }
    }).then(result => {
        res.status(201).json({
            mensaje: "Exito! Todos los alumnos fueron dados de alta correctamente."
        });
    }).catch(error => {
        res.status(500).json({
            mensaje: "Hubo un error al intentar crear las cuentas de los alumnos. No se dio de alta a ningun usuario.",
            error: error.message
        });
    });
}

function dniIsValid(dni) {
    if(dni == null) {
        console.log("No hay dni " + dni);
        return false;
    }

    if(dni.charAt(0) == '0') {
        console.log("Empieza con cero " + dni);
        return false;
    } else if(dni.length != 8) {
        console.log("No es 8 " + dni);
        return false;
    } else {
        console.log("Todo ok " + dni);
        return true;
    }
}

function saveNewSchoolUser(model, user, t) {
    return model.create(user, t).catch(error => {
        throw new error;
    });
}

function saveNewUser(model, user, res, mes) {
    model.create(user).then(result => {
        res.status(201).json({
            message: mes,
            data: result
        });
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!",
            error: error
        });
    });
}

// actualizar usuario
function updateAccount(req, res) {
    const value = parseInt(req.body.type);
    switch (value) {
        case 0:
            update(models.User, req, res);
            break;
        case 1:
            update(models.Employee, req, res);
            break;
        case 2:
            update(models.Employee, req, res);
            break;
        default:
            res.status(500).json({
                message: "Chequea que el type de la cuenta sea correcto"
            });
    }
}

function update(model, req , res) {
    model.findOne({where:{id:req.body.id}}).then(result => {
        if(result) {
            const account = {
                name: req.body.name != null ? req.body.name : result.name,
                surname: req.body.surname != null ? req.body.surname : result.surname,
                email: req.body.email != null ? req.body.email : result.email,
                address: req.body.address != null ? req.body.address : result.address,
                phone: req.body.phone != null ? req.body.phone : result.phone
            }
            model.update(account, {where: {id: result.id}}).then(result2 => {
                res.status(200).json({
                    message: "Cuenta actualizado correctamente!"
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Ocurrio un error!",
                    error: error
                });
            });
        } else {
            res.status(404).json({
                message: "No se encontro la cuenta deseada"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error. Pusiste bien los datos en el body?",
            error: error
        });
    });
}

function updateUser(req, res) {
    models.User.findOne({where:{id:req.body.id}}).then(result => {
        if(result) {
            const user = {
                name: req.body.name != null ? req.body.name : result.name,
                surname: req.body.surname != null ? req.body.surname : result.surname,
                email: req.body.email != null ? req.body.email : result.email,
                address: req.body.address != null ? req.body.address : result.address,
                phone: req.body.phone != null ? req.body.phone : result.phone,
                discount: (req.body.discount != null && req.body.discount >= 0 && req.body.discount <= 100) ? req.body.discount : result.discount,
            }
            models.User.update(user, {where: {id: result.id}}).then(result => {
                res.status(200).json({
                    message: "Usuario actualizado correctamente!"
                });
            }).catch(error => {
                res.status(500).json({
                   message: "Ocurrio un error!",
                   error: error
               });
            });
        } else {
            res.status(404).json({
                message: "No se encontro el usuario deseado"
            });
        }
    }).catch(error => {
       res.status(500).json({
           message: "Ocurrio un error. Pusiste bien los datos en el body?",
           error: error
       });
   });
}

function updateEmployee(req, res) {
    models.Employee.findOne({where:{id:req.body.id}}).then(result => {
        if(result) {
            const employee = {
                name: req.body.name != null ? req.body.name : result.name,
                surname: req.body.surname != null ? req.body.surname : result.surname,
                email: req.body.email != null ? req.body.email : result.email,
                address: req.body.address != null ? req.body.address : result.address,
                phone: req.body.phone != null ? req.body.phone : result.phone,
                cbu: req.body.cbu != null ? req.body.cbu : result.cbu,
                }
            models.Employee.update(employee, {where: {id: result.id}}).then(result => {
                res.status(200).json({
                    message: "Empleado actualizado correctamente!"
                });
            }).catch(error => {
                res.status(500).json({
                    message: "Ocurrio un error!",
                    error: error
                });
            });
        } else {
            res.status(404).json({
                message: "No se encontro el empleado deseado!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error. Pusiste bien los datos en el body?",
            error: error
        });
    });
}

function deleteUser(req, res) {
    models.User.destroy({where: {id: req.body.id}}).then(result => {
        if(result == true) {
            res.status(200).json({
                message: "Usuario eliminado correctamente!"
            });
        } else {
            res.status(404).json({
                message: "No existe el usuario deseado"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function deleteEmployee(req, res) {
    models.Appointment.findOne({where: {trainnerID: req.body.id}}).then(result1 => {
        if(result1){
            models.Appointment.destroy({where: {trainnerID: req.body.id}}).then(result => {
                if(result == true) {
                    removeEmployee(req.body.id, res);
                } else {
                    res.status(400).json({
                        message: "No se pudo eliminar el empleado, ya que no se pudo eliminar las clases que posee."
                    });
                }
            }).catch(error => {
                res.status(500).json({
                    message: "Something went wrong!",
                    error: error
                });
            });
        } else {
            removeEmployee(req.body.id, res);
        }
    }).catch(error => {
        res.status(500).json({
            message: "Something went wrong!",
            error: error
        });
    });
}

function removeEmployee(id, res){
    models.Employee.destroy({where: {id: id}}).then(result => {
        if(result == true) {
            res.status(200).json({
                message: "Empleado eliminado correctamente!"
            });
        } else {
            res.status(404).json({
                message: "No existe el empleado deseado"
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
    var sqlPath = path.join(__dirname, '..', 'queries', 'getAllUsers.query.sql');
    var sqlString = fs.readFileSync(sqlPath, 'utf8');
    sequelize.sequelize.query(sqlString, {replacements: {today: getCurrentDate()}}).then(([users, metadata]) =>{
        if(users.length != 0) {
            var sqlPath = path.join(__dirname, '..', 'queries', 'getClases.query.sql');
            var sqlString = fs.readFileSync(sqlPath, 'utf8');
            sequelize.sequelize.query(sqlString, {}).then(([clases, metadata]) =>{
                if(clases) {
                    for(let i=0; i<users.length; i++) {
                        users[i].clases = [];
                        for(let j=0; j<clases.length; j++) {
                            if(users[i].id == clases[j].userID) {
                                users[i].clases.push(clases[j].name);
                            }
                        }
                    }
                    res.status(200).json({
                        data: users
                    });
                } else {
                    res.status(404).json({
                        message: "Hubo un error al consultar la base de datos. Fallo la obtencion de clases."
                    });
                }
            });
        } else {
            res.status(500).json({
                message: "Ocurrio un error!"
            });
        }
    }).catch(error => {
        res.status(500).json({
            message: "Ocurrio un error!"
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
                        res.status(200).json({
                            message: "Informacion medica actualizada!",
                            data: result2
                        });
                    }).catch(error => {
                        res.status(500).json({
                            message: "Ocurrio un error!",
                            error: error
                        });
                    });
                } else {
                    models.HealthRecords.create(record).then(result3 => {
                        res.status(200).json({
                            message: "Informacion medica actualizada!",
                            data: result3
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

function getTrainners(req, res) {
    models.Employee.findAll({where:{type:1}}).then(result => {
        if(result) {
            res.status(200).json({
                data: result
            });
        } else {
            res.status(500).json({
                message: "Ocurrio un error!",
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
                message: "Ocurrio un error"
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
    newUsersFromSchool: newUsersFromSchool,
    deleteUser: deleteUser,
    updateAccount: updateAccount,
    updateUser: updateUser,
    updateEmployee: updateEmployee,
    deleteEmployee: deleteEmployee,
    getAllUsers: getAllUsers,
    getTrainners: getTrainners,
    getEmployees: getEmployees,
    setHealthRecord: setHealthRecord
} 
