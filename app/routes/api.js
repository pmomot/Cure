// TODO CV decide where we need send email

var User = require('../models/user'),
    Claim = require('../models/claim'),
    config = require('../../config'),
    jsonWebToken = require('jsonwebtoken'),
    secretKey = config.secretKey,
    mailConfig = config.mail,
    serverAddress = 'http://' + config.ip + ':' + config.port,
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    nAsync = require('async'),
    userApiCalls = require('./user-api')();

/**
 * Helper for verifying user token
 * */
function verifyToken (req, res, next) {
    'use strict';

    var token = req.body.token || req.headers['x-access-token'] || req.params('token');

    if (token) {
        jsonWebToken.verify(token, secretKey, function (err, decoded) {
            if (err) {
                res.status(403).send({
                    success: false,
                    message: 'Failed to authenticate'
                });
            } else {
                User.findOne({_id: decoded.id}, function (error, user) {
                    if (user) {
                        req.decoded = decoded;
                        next();
                    } else {
                        res.status(403).send({
                            status: 403,
                            success: false,
                            message: 'User does not exist'
                        });
                    }
                });
            }
        });
    } else {
        res.status(403).send({
            success: false,
            message: 'No token provided'
        });
    }
}

/**
 * Helper for sending claim related email
 * @param {Object} mailParams - email properties
 * @param {Function} callback - will be called after sending email
 * */
function sendClaimEmail (mailParams, callback) {
    'use strict';
    // TODO CV save ip and port to globals

    var transporter = nodemailer.createTransport(smtpTransport(mailConfig)),
        html = '<h3>Hello, ' + mailParams.fullName + '.</h3>',
        o = mailParams.textOptions;

    switch (mailParams.type) {
        case 'new':
            html += '<p>Discussion: <a href="' + serverAddress + '/#/home/discussions/' + o.id + '">"' + o.title;
            html += '"</a> has been added.</p><p>Description: ' + o.description + '</p>';
            break;
        case 'change':
            html += '<p>Your <span style="text-transform: lowercase">' + o.type + '</span> claim: "' + o.title;
            html += '" has been ' + o.status + '.</p><p>Comment: ' + o.description + '</p>';
            break;
        case 'comment':
            html += '<p>Your claim: <a href="' + serverAddress + '/#/home/discussions/' + o.id + '">"' + o.title;
            html += '"</a> has a new comment: ' + o.description + '</p><p>From: ' + o.from + '.</p>';
            break;
    }

    transporter.sendMail({
        from: 'Malkos HRs',
        to: mailParams.recipient,
        subject: mailParams.subject,
        html: html
    }, callback);
}

module.exports = function (app, express) {
    'use strict';

    var api = new express.Router();

    // User section
    api.post('/signup', userApiCalls.signUp);
    api.post('/login', userApiCalls.logIn);
    api.post('/changePassword', userApiCalls.changePassword).use(verifyToken);
    api.get('/me', userApiCalls.getMe).use(verifyToken);
    api.get('/hrs', userApiCalls.getHRs).use(verifyToken);

    // api.use(verifyToken);

    // Claim section
    api.route('/addClaim')
        .post(function (req, res) {

            var claim = new Claim({
                creator: req.decoded.id,
                fullName: req.body.fullName,
                authorEmail: req.body.authorEmail,
                claimTitle: req.body.claimTitle,
                claimType: req.body.claimType,
                claimTag: req.body.claimTag,
                claimRecipient: req.body.claimRecipient,
                claimComment: req.body.claimComment,
                anonymous: req.body.anonymous,
                status: 'open'
            });

            claim.save(function (err) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json({message: 'New claim has been created', status: 'success'});
            });
        })

        .get(function (req, res) {
            Claim.find({claimType: req.query.claimType}, function (err, claims) {
                if (err) {
                    res.send(err);
                    return;
                }
                res.json(claims);
            });
        }
    );

    api.post('/resolveClaim', function (req, res) {
        Claim.findOne({
            _id: req.body._id
        }).exec(function (err, claim) {
            if (err) {
                throw err;
            }
            if (claim) {
                claim.status = req.body.status;
                claim.claimComment = req.body.claimComment;
                claim.save(function (error) {
                    if (error) {
                        res.send(error);
                    } else {
                        res.json({message: 'Successfully resolved a claim.', status: 'success'});
                    }
                });
            } else {
                res.send({message: 'Claim does not exist'});
            }
        });
    });


    api.post('/sendClaims', function (req, res) {
        var calls = [];

        req.body.claims.forEach(function (claim) {
            if (!claim.claimComment) {
                claim.claimComment = 'None.';
            }
            calls.push(function (callback) {
                sendClaimEmail({
                    recipient: claim.authorEmail,
                    subject: 'Your claim has been resolved',
                    fullName: claim.fullName,
                    type: 'change',
                    textOptions: {
                        type: claim.claimType,
                        title: claim.claimTitle,
                        status: claim.status,
                        description: claim.claimComment
                    }
                }, function (err1, info) {
                    if (!err1) {
                        Claim.findOne({_id: claim._id}).exec(function (err2, claim) {
                            if (!err2) {
                                claim.status = 'resolved';
                                claim.save(function (err3) {
                                    if (!err3) {
                                        callback();
                                    }
                                });
                            }
                        });
                    }
                });
            });
        });

        nAsync.parallel(calls, function (err, result) {
            if (err) {
                res.json(err);
                return console.log(err);
            } else {
                res.json({message: 'Successfully resolved all claims.', status: 'success'});
            }
        });
    });


    // Function is triggered when a discussion is added
    api.post('/sendOneClaim', function (req, res) {
        Claim.findOne({claimTitle: req.body.claim.claimTitle, claimType: 'Discussion', status: 'open'}, function (err, claim) {
            var resArr = [];

            if (err) {
                console.log(err);
                return;
            }

            if (!req.body.claim.claimComment) {
                req.body.claim.claimComment = 'None.';
            }

            nAsync.each(req.body.claim.claimRecipient, function (item, callback) {
                sendClaimEmail({
                    recipient: item.email,
                    subject: 'New claim notification.',
                    fullName: item.firstName + ' ' + item.lastName,
                    type: 'new',
                    textOptions: {
                        id: claim._id,
                        title: req.body.claim.claimTitle,
                        description: req.body.claim.claimComment
                    }
                }, function (err1, info) {
                    if (err1) {
                        resArr.push(err1);
                        callback(err1);
                    } else {
                        resArr.push({message: 'Successfully sent a claim to ' + item.firstName + ' ' + item.lastName, status: 'success'});
                        callback();
                    }
                });
            }, function (error) {
                if (error) {
                    console.log(error);
                } else {
                    res.json({response: resArr, status: 'success'});
                }
            });
        });
    });

    api.post('/addComment', function (req, res) {
        Claim.findByIdAndUpdate(req.body.claimId, {$push: {claimComments: req.body.comment}}, {safe: true, upsert: true}, function (err, model) {
            var resArr = [], fullName;

            if (!err) {
                nAsync.each(req.body.claimRecipient, function (item, callback) {
                    if (item.email === req.body.comment.author.email) {
                        callback();
                    } else {
                        fullName = item.firstName + ' ' + item.lastName;

                        sendClaimEmail({
                            recipient: item.email,
                            subject: 'A comment has been added to your discussion.',
                            fullName: fullName,
                            type: 'comment',
                            textOptions: {
                                id: req.body.claimId,
                                title: req.body.claimTitle,
                                description: req.body.comment.content,
                                from: req.body.comment.author.firstName + ' ' + req.body.comment.author.lastName
                            }
                        }, function (err1, info) {
                            if (err1) {
                                resArr.push(err1);
                                callback(err1);
                            } else {
                                resArr.push({message: 'Successfully sent a message to ' + fullName, status: 'success'});
                                callback();
                            }
                        });
                    }
                }, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.json({response: resArr, status: 'success'});
                    }
                });

            }
        });

    });

    return api;
};