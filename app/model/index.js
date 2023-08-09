const config = require("../config/db.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  'facebook_user',
  'postgres',
  'admin',
  {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Rest of the code remains unchanged...


db.user = require("../model/User.js")(sequelize, Sequelize);
db.role = require("../model/role.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
  through: "user_roles"
});
db.user.belongsToMany(db.role, {
  through: "user_roles"
});

db.ROLES = ["Etudiant", "Formateur", "Admin"];

module.exports = db;
