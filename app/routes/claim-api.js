/**
 * Created by petermomot on 3/11/16.
 */
'use strict';

var Claim = require('../models/claim'),
    config = require('../../config'),
    mailConfig = config.mail,
    serverAddress = 'http://' + config.ip + ':' + config.port,
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    Promise = require('promise');

/**
 * Helper for sending claim related email
 * @param {Object} mailParams - email properties
 * */
function sendClaimEmail (mailParams) {
    var transporter = nodemailer.createTransport(smtpTransport(mailConfig)),
        html = '<h3>Hello, ' + mailParams.fullName + '.</h3>',
        o = mailParams.textOptions;

    switch (mailParams.type) {
        case 'new':
            html += '<p>Discussion: <a href="' + serverAddress + '/#/claims/discussions?discussion-id=' + o.id + '">"' + o.title;
            html += '"</a> has been added.</p><p>Description: ' + o.description + '</p>';
            break;
        case 'change':
            html += '<p>Your <span style="text-transform: lowercase">' + o.type + '</span> claim: "' + o.title;
            html += '" has been ' + o.status + '.</p>';
            if (o.type !== 'Discussion') {
                html += '<p>Comment: ' + o.description + '</p>';
            }
            break;
        case 'comment':
            html += '<p>Your claim: <a href="' + serverAddress + '/#/claims/discussions?discussion-id=' + o.id + '">"' + o.title;
            html += '"</a> has a new comment: ' + o.description + '</p><p>From: ' + o.from + '.</p>';
            break;
    }

    return transporter.sendMail({
        from: 'CoreValue HRs',
        to: mailParams.recipient,
        subject: mailParams.subject,
        html: html
    }, function () {});
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

        claim
            .save()
            .then(function (createdClaim) {

                if (createdClaim.claimType === 'Discussion') {
                    if (!createdClaim.claimComment) {
                        createdClaim.claimComment = 'None.';
                    }
                    return Promise.all(createdClaim.claimRecipient.map(function (item) {
                        sendClaimEmail({
                            recipient: item.email,
                            subject: 'New claim notification.',
                            fullName: item.firstName + ' ' + item.lastName,
                            type: 'new',
                            textOptions: {
                                id: claim._id,
                                title: createdClaim.claimTitle,
                                description: createdClaim.claimComment
                            }
                        });
                    }));
                }
            })
            .then(function () {
                res.send({
                    message: 'New claim has been created',
                    success: true
                });
            })
            .catch(function (err) {
                res.send({
                    message: err.message,
                    success: false
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
            status = req.query.status,
            todayDate = new Date(), weekDate = new Date(), x;

        x = new Date(weekDate.setTime(todayDate.getTime() - (30 * 24 * 3600000)));

        q.status = {
            $in: q.status
        };
        if (status !== 'open') {
            q.created = {
                $gt: x.toISOString()
            };
        }

        Claim.find(q).sort({created: -1}).limit(15)
            .exec()
            .then(function (claims) {
                res.json(claims);
            })
            .catch(function (error) {
                res.send(error);
            });
    }

    /**
    * Resolve claim
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function resolveClaim (req, res) {
        var savedClaim;

        Claim
            .findOne({
                _id: req.body._id
            })
            .exec()
            .then(function (claim) {
                if (!claim) {
                    throw new Error('Claim does not exist');
                }
                claim.status = req.body.status;
                claim.claimComment = req.body.claimComment;

                return claim.save();
            })
            .then(function (claim) {
                if (!claim.claimComment) {
                    claim.claimComment = 'None.';
                }

                savedClaim = claim;

                return sendClaimEmail({
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
                });
            })
            .then(function () {
                res.send({
                    message: 'Claim <i>' + savedClaim.claimTitle + '</i> has been ' + savedClaim.status,
                    success: true
                });
            })
            .catch(function (err) {
                res.send({
                    message: err.message,
                    success: false
                });
            });
    }

    /**
    * Add new comment to discussion
    * @param {Object} req - request
    * @param {Object} res - response
    * */
    function postComment (req, res) {
        var q = {
                $push: {
                    claimComments: req.body.comment
                }
            },
            options = {safe: true, upsert: true};

        Claim
            .findByIdAndUpdate(req.body.claimId, q, options)
            .then(function (claim) {
                var fullName;

                return Promise.all(claim.claimRecipient.map(function (item) {
                    if (item.email !== req.body.comment.author.email) {
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
                        });
                    }
                }));
            })
            .then(function () {
                res.send({
                    message: 'Comment has been added',
                    success: true
                });
            })
            .catch(function (err) {
                res.send({
                    message: err.message,
                    success: false
                });
            });
    }

    return {
        postClaim: postClaim,
        getClaims: getClaims,
        resolveClaim: resolveClaim,
        postComment: postComment
    };
};
