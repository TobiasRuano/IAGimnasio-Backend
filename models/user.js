'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    name: DataTypes.STRING,
    surname: DataTypes.STRING,
    dni: DataTypes.INTEGER,
    email: DataTypes.STRING,
    type: DataTypes.INTEGER,
    birthday: DataTypes.DATEONLY,
    address: DataTypes.STRING,
    phone: DataTypes.STRING,
    discount: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};