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

        user.save(function (err) {
            if (err) {
                res.send(err);
                return;
            }
            res.json({message: 'User has been created!', success: true});
        });
    }

    /**
     * Log into system
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function logIn (req, res) {
        User.findOne({
            email: req.body.email
        }).select('password').exec(function (err, user) {
            var token, validPassword;

            if (err) {
                throw err;
            }
            if (!user) {
                res.send({message: 'User does not exist'});
            } else if (user) {
                validPassword = user.comparePassword(req.body.password);

                if (validPassword) {
                    token = createToken(user);
                    res.json({
                        success: true,
                        message: 'Successfully logged in',
                        token: token
                    });
                } else {
                    res.send({message: 'Invalid Password'});
                }
            }
        });
    }

    /**
     * Change user password
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function changePassword (req, res) {
        User.findOne({
            email: req.body.email
        }).select('password').exec(function (err, user) {
            var token, validPassword;

            if (err) {
                throw err;
            }
            if (!user) {
                res.send({message: 'User does not exist'});
            } else if (user) {
                token = createToken(user);
                validPassword = user.comparePassword(req.body.currentPass);

                if (validPassword) {
                    user.password = req.body.newPass;
                    user.save(function (error) {
                        if (error) {
                            res.send(error);
                            return;
                        }
                        res.json({
                            success: true,
                            message: 'Password has been changed.',
                            token: token
                        });
                    });
                } else {
                    res.send({
                        success: false,
                        message: 'Invalid current password',
                        token: token
                    });
                }
            }
        });
    }

    /**
     * Get current User info
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function getMe (req, res) { // TODO CV rewrite this
        User.findOne({
            _id: req.decoded.id
        }, function (err, user) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(user);
        });
    }

    /**
     * Get HRs list
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function getHRs (req, res) {
        User.find({userGroup: 'HR'}, function (err, users) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(users);
        });
    }

    return {
        signUp: signUp,
        logIn: logIn,
        changePassword: changePassword,
        getMe: getMe,
        getHRs: getHRs
    };
};
