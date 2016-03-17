'use strict';
// TODO CV decide where we need send email

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
    api.post('/signup', userApiCalls.signUp);
    api.post('/login', userApiCalls.logIn);
    api.post('/changePassword', userApiCalls.changePassword).use(verifyToken);
    api.get('/me', userApiCalls.getMe).use(verifyToken);
    api.get('/hrs', userApiCalls.getHRs).use(verifyToken);

    api.use(verifyToken);
    // Claim section
    // TODO CV change route name
    api.route('/addClaim')
        .post(claimApiCalls.postClaim)
        .get(claimApiCalls.getClaim);

    api.post('/resolveClaim', claimApiCalls.resolveClaim);
    api.post('/sendClaims', claimApiCalls.sendClaims);
    api.post('/sendOneClaim', claimApiCalls.sendOneClaim);
    api.post('/addComment', claimApiCalls.addComment);

    return api;
};
