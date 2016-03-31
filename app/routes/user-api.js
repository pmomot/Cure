/**
 * Created by petermomot on 3/10/16.
 */
'use strict';

var User = require('../models/user'),
    config = require('../../config'),
    secretKey = config.secretKey,
    jsonWebToken = require('jsonwebtoken');

/**
 * Generates token from user params
 * @param {Object} user - userInfo
 * */
function createToken (user) {
    return jsonWebToken.sign({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }, secretKey, {
        expiresInMinute: 1440
    });
}

module.exports = function () {

    /**
     * Sign Up in service
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function signUp (req, res) {
        var user = new User({
            userGroup: req.body.userGroup,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email
        });

        User.findOne({
            email: user.email
        })
            .then(function (u) {
                if (u) {
                    throw new Error('User with this email already exists');
                } else {
                    return user.save();
                }
            })
            .then(function () {
                res.send({
                    message: 'User has been created!',
                    success: true
                });
            })
            .catch(function (error) {
                res.send({
                    message: error.message,
                    success: false
                });
            });
    }

    /**
     * Log into system
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function logIn (req, res) {
        var token;

        User.findOne({
            email: req.body.email
        })
            .select('password').exec()
            .then(function (user) {
                var validPassword;

                if (user) {
                    validPassword = user.comparePassword(req.body.password);

                    if (validPassword) {
                        token = createToken(user);

                        return User.findOne({
                            email: req.body.email
                        }).lean().exec();

                    } else {
                        throw new Error('Invalid Password');
                    }
                } else {
                    throw new Error('User does not exist');
                }
            })
            .then(function (u) {
                res.send({
                    message: 'Successfully logged in',
                    success: true,
                    token: token,
                    user: u
                });
            })
            .catch(function (error) {
                res.status(401).send({
                    message: error.message,
                    success: false
                });
            });
    }

    /**
     * Change user password
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function changePassword (req, res) {
        var token;

        User.findOne({
            email: req.body.email
        })
            .select('password').exec()
            .then(function (user) {
                var validPassword;

                if (user) {
                    token = createToken(user);
                    validPassword = user.comparePassword(req.body.currentPass);

                    if (validPassword) {
                        user.password = req.body.newPass;

                        return user.save();
                    } else {
                        throw new Error('Invalid current password');
                    }
                } else {
                    throw new Error('User does not exist');
                }
            })
            .then(function () {
                res.send({
                    message: 'Password has been changed.',
                    success: true,
                    token: token
                });
            })
            .catch(function (error) {
                res.send({
                    message: error.message,
                    success: false,
                    token: token || ''
                });
            });
    }

    /**
     * Get current User info
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function getUser (req, res) {
        User.findOne({
            _id: req.decoded.id
        })
            .then(function (user) {
                res.send(user);
            })
            .catch(function (error) {
                res.send({
                    message: error.message,
                    success: false
                });
            });
    }

    /**
     * Get Users list by query
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function getUsers (req, res) {
        User
            .find(req.query)
            .then(function (users) {
                res.send(users);
            })
            .catch(function (error) {
                res.send({
                    message: error.message,
                    success: false
                });
            });
    }

    return {
        signUp: signUp,
        getUser: getUser,
        logIn: logIn,
        changePassword: changePassword,
        getUsers: getUsers
    };
};
