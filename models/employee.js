'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class employee extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  employee.init({
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    email: DataTypes.STRING,
    type: DataTypes.INTEGER,
    birthday: DataTypes.DATEONLY,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    salaryPerHour: DataTypes.DOUBLE,
    hoursWorked: DataTypes.INTEGER,
    cbu: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Employee',
  });
  return employee;
};