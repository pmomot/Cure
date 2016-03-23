// TODO CV add proper error handlers
// TODO CV add email sending timeout handler
/**
 * Created by petermomot on 3/11/16.
 */
'use strict';

var Claim = require('../models/claim'),
    nAsync = require('async'),
    config = require('../../config'),
    mailConfig = config.mail,
    serverAddress = 'http://' + config.ip + ':' + config.port,
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport');

/**
 * Helper for sending claim related email
 * @param {Object} mailParams - email properties
 * @param {Function} callback - will be called after sending email
 * */
function sendClaimEmail (mailParams, callback) {
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
        from: 'CoreValue HRs',
        to: mailParams.recipient,
        subject: mailParams.subject,
        html: html
    }, callback);
}

module.exports = function () {

    /**
     * Create new claim
     * @param {Object} req - request
     * @param {Object} res - response
     * */
    function postClaim (req, res) {
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

        claim.save(function (err, createdClaim) {
            if (err) {
                res.send(err);
                return;
            }

            res.json({
                message: 'New claim has been created',
                createdClaim: createdClaim,
                success: true
            });
        });
    }

    /**
    * Get claims by type
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function getClaims (req, res) {
        var q = req.query,
            todayDate = new Date(), weekDate = new Date(), x;

        x = new Date(weekDate.setTime(todayDate.getTime() - (30 * 24 * 3600000)));

        q.status = {
            $in: q.status
        };
        q.created = {
            $gt: x.toISOString()
        };

        Claim.find(q).sort({created: -1}).limit(15).exec(function (err, claims) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(claims);
        });
    }

    /**
    * Resolve claim
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function resolveClaim (req, res) {
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
                        if (!claim.claimComment) {
                            claim.claimComment = 'None.';
                        }
                        sendClaimEmail({
                            recipient: claim.authorEmail,
                            subject: 'Your claim has been ' + claim.status,
                            fullName: claim.fullName,
                            type: 'change',
                            textOptions: {
                                type: claim.claimType,
                                title: claim.claimTitle,
                                status: claim.status,
                                description: claim.claimComment
                            }
                        }, function (sendError) {
                            if (sendError) {
                                res.send(error);
                            } else {
                                res.json({
                                    message: 'Claim has been ' + claim.status,
                                    success: true
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({message: 'Claim does not exist', success: false});
            }
        });
    }

    /**
    * Function is triggered when a discussion is added
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function sendOneClaim (req, res) {
        Claim.findOne({claimTitle: req.body.claim.claimTitle, claimType: 'Discussion', status: 'open'}, function (err, claim) {
            var resArr = [];

            if (err) {
                res.json(err);
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
                }, function (err1) {
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
                    // console.log(error);
                } else {
                    res.json({response: resArr, status: 'success'});
                }
            });
        });
    }

    /**
    * Add new comment to discussion
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function addComment (req, res) {
        Claim.findByIdAndUpdate(req.body.claimId, {$push: {claimComments: req.body.comment}}, {safe: true, upsert: true}, function (err) {
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
                        }, function (err1) {
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
                    if (!error) {
                        res.json({response: resArr, status: 'success'});
                    }
                });
            }
        });
    }

    return {
        postClaim: postClaim,
        getClaims: getClaims,
        resolveClaim: resolveClaim,
        sendOneClaim: sendOneClaim,
        addComment: addComment
    };
};
