const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('facebook_user', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = {
  sequelize, // Export the sequelize instance
  dialect: 'postgres', // Export other configuration properties if needed
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
