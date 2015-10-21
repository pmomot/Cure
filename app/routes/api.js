var User = require('../models/user'),
    Claim = require('../models/claim'),
    config = require('../../config'),
    jsonwebtoken = require('jsonwebtoken'),
    secretKey = config.secretKey,
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    nAsync = require('async');

function createToken(user){

    var token = jsonwebtoken.sign({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
    }, secretKey, {
        expiresInMinute: 1440
    });
    return token;
}

module.exports = function(app, express){

    var api = express.Router();
    api.post('/signup', function(req, res){

        var user = new User({
            userGroup: req.body.userGroup,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            password: req.body.password,
            email: req.body.email
        });
        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }
            res.json({message: 'User has been created!', success: true})
        });
    });

    api.get('/users', function(req, res){
       User.find({}, function(err, users){
           if(err){
               res.send(err);
               return;
           }
           res.json(users);
       })
    });

    api.post('/login', function(req, res){
        User.findOne({
            email: req.body.email
        }).select('password').exec(function(err, user){
            if(err) throw err;
            if(!user) {
                res.send({message: 'User does not exist'})
            } else if(user){
                var validPassword = user.comparePassword(req.body.password);
                if(!validPassword){
                    res.send({message: 'Invalid Password'})
                } else {
                    var token = createToken(user);
                    res.json({
                        success: true,
                        message: "Successfully logged in",
                        token: token
                    });
                }
            }
        })
    });

    api.use(function(req, res, next){

        console.log('somebody just came to our app!');

        var token = req.body.token || req.headers['x-access-token'] || req.param('token');

        if(token){
            jsonwebtoken.verify(token, secretKey, function(err, decoded){
                if(err){
                    res.status(403).send({
                        success: false,
                        message: 'Failed to authenticate'
                    })
                } else {
                    req.decoded = decoded;
                    next();
                }
            })
        } else {
            res.status(403).send({
                success: false,
                message: 'No token provided'
            })
        }
    });

    api.route('/addClaim')
        .post(function(req, res){

            var claim = new Claim({
                creator: req.decoded.id,
                fullName: req.body.fullName,
                authorEmail: req.body.authorEmail,
                claimTitle: req.body.claimTitle,
                claimType: req.body.claimType,
                claimTag: req.body.claimTag,
                claimRecipient: req.body.claimRecipient,
                claimComment: req.body.claimComment,
                status: "open"
            });

            claim.save(function(err){
                if(err){
                    res.send(err);
                    return
                }
                res.json({message: 'New claim has been created', status: 'success'})
            });
        })

        .get(function(req, res){
            console.log(req.query.claimType);
            Claim.find({claimType: req.query.claimType}, function(err, claims){
                if(err){
                    res.send(err);
                    return
                }
                res.json(claims)
            })
        }
    );

    api.post('/resolveClaim', function(req, res){
        Claim.findOne({
            _id: req.body._id
        }).exec(function(err, claim){
            if(err) throw err;
            if(!claim) {
                res.send({message: 'Claim does not exist'})
            }else{
                claim.status = req.body.status;
                claim.claimComment = req.body.claimComment;
                claim.save(function(err){
                    if(err){
                        res.send(err);
                        return
                    }else{
                        res.json({message: 'Successfully resolved a claim.', status: 'success'});
                    }
                });
            }
        })
    });

    api.get('/me', function(req, res){
        User.findOne({
            _id: req.decoded.id
        }, function(err, user){
            if(err){
                res.send(err);
                return;
            }
            res.json(user);
        });
    });

    api.get('/hrs', function(req, res){
        User.find({userGroup: 'HR'}, function(err, users){
            if(err){
                res.send(err);
                return;
            }
            res.json(users);
        })
    });

    api.post('/sendClaims', function(req, res){
        var calls = [];
        req.body.claims.forEach(function(claim){
            calls.push(function(callback){
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: "vyokhna@gmail.com",
                        pass: "radiohead88"
                    }
                }));

                transporter.sendMail({
                    from: req.body.currentUser.email,
                    to: claim.authorEmail,
                    subject: 'Your claim has been resolved',
                    text: 'Hello, ' + claim.fullName +'. Your claim: ' + claim.claimTitle + 'has been ' + claim.status + '.'
                }, function(err1, info){
                    if(err1){
                        console.log(err1);
                    } else {
                        Claim.findOne({_id: claim._id}).exec(function(err2, claim){
                                console.log(claim);
                                if(err2){
                                    console.log(err2);
                                }else{
                                    claim.status = 'resolved';
                                    claim.save(function(err3){
                                        if(err3) {
                                            console.log(err3)
                                        }else{
                                            callback();
                                        }
                                    })
                                }
                            }
                        );
                    }
                })
            });
        });

        nAsync.parallel(calls, function(err, result) {
            if (err){
                res.json(err);
                return console.log(err);
            } else {
                res.json({message: 'Successfully resolved all claims.', status: 'success'});
                console.log(result);
            }
        });
    });

    api.post('/sendOneClaim', function(req, res){

        var transporter = nodemailer.createTransport(smtpTransport({
                service: 'Gmail',
                auth: {
                    user: "vyokhna@gmail.com",
                    pass: "radiohead88"
                }
            }));

            transporter.sendMail({
                from: req.body.currentUser.email,
                to: req.body.claim.claimRecipient.email,
                subject: 'A new claim notification.',
                text: 'Hello, ' + req.body.claim.claimRecipient.firstName + ' ' + req.body.claim.claimRecipient.lastName + '. Your claim: ' + req.body.claim.claimTitle + 'has been ' + req.body.claim.status + '.'
            }, function(err1, info){
                if(err1){
                    console.log(err1);
                } else {
                    res.json({message: 'Successfully resolved all claims.', status: 'success'});
                    //Claim.findOne({_id: claim._id}).exec(function(err2, claim){
                    //        console.log(claim);
                    //        if(err2){
                    //            console.log(err2);
                    //        }else{
                    //            claim.status = 'resolved';
                    //            claim.save(function(err3){
                    //                if(err3) {
                    //                    console.log(err3)
                    //                }else{
                    //                    callback();
                    //                }
                    //            })
                    //        }
                    //    }
                    //);
                }
            })

    });

    api.post('/addComment', function(req, res){

        Claim.findByIdAndUpdate(req.body.claimId, {$push: {claimComments: req.body.comment}}, {safe: true, upsert: true}, function(err, model) {

            if(err){
                console.log(err);
            }else{
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: "vyokhna@gmail.com",
                        pass: "radiohead88"
                    }
                }));

                transporter.sendMail({
                    from: 'Malkos',
                    to: req.body.claimRecipient.email,
                    subject: 'A new claim notification.',
                    text: 'Hello, ' + req.body.claimRecipient.firstName + ' ' + req.body.claimRecipient.lastName + '. Your claim: ' + req.body.claimTitle + 'has a new comment: <br/>'
                }, function(err1, info){
                    if(err1){
                        console.log(err1);
                    } else {
                        res.json({message: 'Successfully added a comment', status: 'success'});
                    }
                })
            }
        })

    });

    return api
};