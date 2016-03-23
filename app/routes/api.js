'use strict';
// TODO CV decide where we need send email
// TODO CV move methods to models

var User = require('../models/user'),
    config = require('../../config'),
    jsonWebToken = require('jsonwebtoken'),
    secretKey = config.secretKey,
    userApiCalls = require('./user-api')(),
    claimApiCalls = require('./claim-api')();

/**
 * Helper for verifying user token
 * */
function verifyToken (req, res, next) {
    var token = req.body.token || req.headers['x-access-token'];

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

module.exports = function (app, express) {
    var api = new express.Router();

    // User section
    api.post('/user', userApiCalls.signUp);
    api.post('/user/log-in', userApiCalls.logIn);

    api.use(verifyToken);

    api.get('/user', userApiCalls.getUser);
    api.post('/user/change-pass', userApiCalls.changePassword);
    api.get('/hrs', userApiCalls.getHRs);


    // Claim section
    // TODO CV change routes names
    api.route('/claims')
        .post(claimApiCalls.postClaim)
        .get(claimApiCalls.getClaims);

    api.post('/resolveClaim', claimApiCalls.resolveClaim);
    api.post('/sendOneClaim', claimApiCalls.sendOneClaim);
    api.post('/addComment', claimApiCalls.addComment);

    return api;
};
