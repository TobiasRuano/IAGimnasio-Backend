'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Wages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Wages.init({
    date: DataTypes.DATE,
    employeeID: DataTypes.INTEGER,
    jubilacion: DataTypes.DOUBLE,
    obraSocial: DataTypes.DOUBLE,
    pami: DataTypes.DOUBLE,
    total: DataTypes.DOUBLE,
    dateStart: DataTypes.DATE,
    dateEnd: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Wages',
  });
  return Wages;
};