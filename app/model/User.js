
const { sequelize } = require('../config/db');
const bcrypt = require('bcrypt');
const { DataTypes } = require('sequelize');


module.exports = (sequelize, Sequelize) => {
  
const User = sequelize.define('User', {
  id: {
    type: Sequelize.UUID,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4
   ,allowNull: false,
  //,autoIncrement: true,
  },
  api_type: {
    type: Sequelize.STRING,
    defaultValue: "JWT Based Authentication & Authorisation" // Replace "defaultApiType" with whatever default value you want.
    //,allowNull: true,
  },
  token: {
    type: Sequelize.STRING,
    defaultValue: "defaultTokenValue" // Replace with an appropriate default value.
    //,allowNull: false,
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