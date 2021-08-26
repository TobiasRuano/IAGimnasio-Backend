'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HealthRecords extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  HealthRecords.init({
    userID: DataTypes.INTEGER,
    data: DataTypes.STRING,
    medicalDischarge: DataTypes.BOOLEAN,
    medicalDischargeDate: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'HealthRecords',
  });
  return HealthRecords;
};