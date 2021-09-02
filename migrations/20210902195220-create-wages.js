'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Wages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      employeeID: {
        type: Sequelize.INTEGER
      },
      jubilacion: {
        type: Sequelize.DOUBLE
      },
      obraSocial: {
        type: Sequelize.DOUBLE
      },
      pami: {
        type: Sequelize.DOUBLE
      },
      total: {
        type: Sequelize.DOUBLE
      },
      dateStart: {
        type: Sequelize.DATE
      },
      dateEnd: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Wages');
  }
};