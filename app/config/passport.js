const db = require("../model");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const sequelize = require('../config/db');
var TwiterStrategy = require('passport-twitter').Strategy;

var UserRepository = require('../repository/user_repository');
var configAuth = require('../config/auth');

function passportConfig(passport) {
    passport.use(new GoogleStrategy({
        clientID: configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL: configAuth.googleAuth.callbackURL
    }, function(token, refreshToken, profile, done) {
        console.log('profile pic ' + profile.photos[0].value);
        User.findOrCreate({
            where: { id: profile.id.toString() },
            defaults: {
                api_type: 'GOOGLE',
                token: token,
                email: profile.emails[0].value,
                name: profile.displayName
            }
        }).then(([user, created]) => {
            if (created) {
                profile = user;
                console.log('Created new user: ' + user.name);
                // Now profile should be a copy of the user, and you can access its properties
                console.log("this is id in profile  : ", profile.id);
                console.log("this is api_type in profile  : ", profile.api_type);
                console.log("this is token in profile  : ", profile.token);
                console.log("this is email in profile  : ", profile.email);
                console.log("this is name in profile  : ", profile.name);
            } else {
                console.log('Found existing user: ' + user.name);
            }
            done(null, user.dataValues);
        }).catch((err) => {
            done(err);
        });
    }));

    passport.serializeUser((user, done) => {
        console.log("this is user in serializeUser: ", JSON.stringify(user));
        try {
            done(null, user.id);
        } catch(err) {
            done(err);
            console.error('Error when trying to serialize user:', err);
        }
    });

    passport.deserializeUser(function(id, done) {
        User.findByPk(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                console.error('Error when trying to deserialize user:', err);
                done(err);
            });
    });
}

function signup(req, res) {
    User.create({
        name: req.body.name,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    })
    .then(user => {
        if (req.body.roles) {
            Role.findAll({
                where: {
                    name: {
                        [Op.or]: req.body.roles
                    }
                }
            }).then(roles => {
                user.setRoles(roles).then(() => {
                    res.send({ message: "User registered successfully!" });
                });
            });
        } else {
            user.setRoles([1]).then(() => {
                res.send({ message: "User registered successfully!" });
            });
        }
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
}

function signin(req, res) {
    User.findOne({
        where: {
            name: req.body.name
        }
    })
    .then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }

        var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        const token = jwt.sign({ id: user.id },
                                config.secret, {
                                    algorithm: 'HS256',
                                    allowInsecureKeySizes: true,
                                    expiresIn: 86400,
                                });

        var authorities = [];
        user.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
                authorities.push("ROLE_" + roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user.id,
                name: user.name,
                email: user.email,
                roles: authorities,
                accessToken: token
            });
        });
    })
    .catch(err => {
        res.status(500).send({ message: err.message });
    });
}

module.exports = {
    passportConfig,
    signup,
    signin
};
