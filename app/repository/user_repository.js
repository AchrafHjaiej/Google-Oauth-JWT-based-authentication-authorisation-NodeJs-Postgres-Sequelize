const User = require('../model/User');
//const { User } = require('../config/db');
const bcrypt = require('bcryptjs');

module.exports = {
  create: async (email, password) => {
    const hashedPassword = bcrypt.hashSync(password, 10);  // hash the password
    return User.create({ email, password: hashedPassword });
  },
  findByEmail: (email) => {
    return User.findOne({ where: { email } });
  },
};

var UserRepository = function () {};

UserRepository.prototype = {
  createUser: function (user, cb) { // Use the parameter name 'user' instead of 'userData'
    console.log('User object:', user);
    User.create(user) // Use the 'user' object passed as an argument
      .then((result) => {
        cb(null, result);
      })
      .catch((err) => {
        console.error('Error creating user:', err);
        cb(err, null);
      });
      
  },
  findOne: function (id, cb) {
    User.findOne({ where: { id } })
      .then((user) => {
        cb(null, user);
      })
      .catch((err) => {
        console.error('Error creating user:', err);
        cb(err, null);
      });
      
  },
};

module.exports = UserRepository;
