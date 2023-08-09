
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');


module.exports = (sequelize, Sequelize) => {
  
const User = sequelize.define('User', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  //,autoIncrement: true,
  },
  api_type: {
    type: Sequelize.STRING
    ,allowNull: false,
  },
  token: {
    type: Sequelize.STRING
    ,allowNull: false,
  },
  email: {
    type: Sequelize.STRING
    ,allowNull: false,
  },
  name: {
    type: Sequelize.STRING
    ,allowNull: false,
  },
  password: {
    type: Sequelize.STRING
  },
  
}
);
return User;
}