var User = require('../models/user'),
    Claim = require('../models/claim'),
    config = require('../../config'),
    jsonwebtoken = require('jsonwebtoken'),
    secretKey = config.secretKey,
    nodemailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    nAsync = require('async');
    _ = require('underscore');

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

    api.get('/currentUser', function(req, res){
        User.findOne({email: req.body.email}, function(err, user){
            if (user) return true;
            return false;
        })
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

    api.post('/delete', function(req, res){
        //console.log(req.body)
        //User.remove({
        //    email: req.body.email
        //}, function(err, user){
        //    if(err){
        //        res.send(err);
        //        return;
        //    }
        //    res.json(user);
        //});
        //Claim.remove({
        //}, function(err, user){
        //    if(err){
        //        res.send(err);
        //        return;
        //    }
        //    res.json(user);
        //});
        User.findOneAndUpdate({ email: 'kdrobvyazko@corevalue.net' }, function(err, user) {
            if (err) throw err;

            user['userGroup'] = "HR";

            // we have the updated user returned to us
            console.log(user);
        });

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
                    User.findOne({_id: decoded.id}, function(err, user){
                        if (user){
                            req.decoded = decoded;
                            next();
                        }else{
                            res.status(403).send({
                                status: 403,
                                success: false,
                                message: 'User does not exist'
                            })
                        }
                    })
                }
            })
        } else {
            res.status(403).send({
                success: false,
                message: 'No token provided'
            })
        }
    });

    api.post('/changePass', function(req, res){
        User.findOne({
            email: req.body.email
        }).select('password').exec(function(err, user){
            if(err) throw err;
            if(!user) {
                res.send({message: 'User does not exist'})
            } else if(user){
                var token = createToken(user);
                var validPassword = user.comparePassword(req.body.currentPass);
                if(!validPassword){
                    res.send({
                        success: false,
                        message: 'Invalid current password',
                        token: token
                    })
                } else {
                    user.password = req.body.newPass;
                    user.save(function(err){
                        if(err){
                            res.send(err);
                            return;
                        }
                        res.json({
                            success: true,
                            message: "Password has been changed.",
                            token: token
                        });
                    });
                }
            }
        })
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
                anonymous: req.body.anonymous,
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
            if(!claim.claimComment){claim.claimComment = 'None.'}
            calls.push(function(callback){
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: "cvcured@gmail.com",
                        pass: "curedcv!"
                    }
                }));

                transporter.sendMail({
                    from: 'Malkos HRs',
                    to: claim.authorEmail,
                    subject: 'Your claim has been resolved',
                    html: '<h3>Hello, ' + claim.fullName +'.</h3>' +
                          '<p>Your <span style="text-transform: lowercase">'+claim.claimType+'</span> claim: "' + claim.claimTitle + '" has been ' + claim.status + '.</p>' +
                          '<p>Comment: '+claim.claimComment+'</p>'
                }, function(err1, info){
                    if(err1){
                    } else {
                        Claim.findOne({_id: claim._id}).exec(function(err2, claim){
                                if(err2){
                                }else{
                                    claim.status = 'resolved';
                                    claim.save(function(err3){
                                        if(err3) {
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
            }
        });
    });


    // Function is triggered when a discussion is added
    api.post('/sendOneClaim', function(req, res){

       var currentClaimId;
        Claim.findOne({claimTitle: req.body.claim.claimTitle, claimType:'Discussion', status: 'open'}, function(err, claim){
            if(err){
                console.log(err);
                return
            }
            currentClaimId = claim._id;
            console.log(currentClaimId);
            var transporter = nodemailer.createTransport(smtpTransport({
                service: 'Gmail',
                auth: {
                    user: "cvcured@gmail.com",
                    pass: "curedcv!"
                }
            }));
            if(!req.body.claim.claimComment){req.body.claim.claimComment = 'None.'}

            var resArr = [];
            nAsync.each(req.body.claim.claimRecipient, function(item, callback){
                    transporter.sendMail({
                        from: 'Malkos HRs',
                        to: item.email,
                        subject: 'New claim notification.',
                        html: '<h3>Hello, ' + item.firstName + ' ' + item.lastName + '.</h3>' +
                        '<p>Discussion: <a href="http://194.44.136.82:3000/#/home/discussions/' + currentClaimId + '">"' + req.body.claim.claimTitle + '"</a> has been added.</p>'+
                        //'<p>Discussion: <a href="http://localhost:4000/#/home/discussions/' + currentClaimId + '">"' + req.body.claim.claimTitle + '"</a> has been added.</p>'+
                        '<p>Description: '+req.body.claim.claimComment+'</p>'
                    }, function(err1, info){
                        if(err1){
                            resArr.push(err1);
                            callback(err1);
                        } else {
                            resArr.push({message: 'Successfully sent a claim to ' + item.firstName + ' ' + item.lastName, status: 'success'});
                            callback();
                        }
                    })
                }, function(err){
                    if(err) {
                        console.log(err);
                    } else {
                        res.json({response: resArr, status: 'success'})
                    }
                }
            );
        });




    });

    api.post('/addComment', function(req, res){
        Claim.findByIdAndUpdate(req.body.claimId, {$push: {claimComments: req.body.comment}}, {safe: true, upsert: true}, function(err, model) {
            if(err){
            }else{
                var resArr = [];
                var transporter = nodemailer.createTransport(smtpTransport({
                    service: 'Gmail',
                    auth: {
                        user: "cvcured@gmail.com",
                        pass: "curedcv!"
                    }
                }));
                nAsync.each(req.body.claimRecipient, function(item, callback){
                    if(item.email != req.body.comment.author.email){
                        transporter.sendMail({
                            from: 'Malkos HRs',
                            to: item.email,
                            subject: 'A comment has been added to your discussion.',
                            html: '<h3>Hello, ' + item.firstName + ' ' + item.lastName + '.</h3>' +
                            '<p>Your claim: <a href="http://194.44.136.82:3/000/#/home/discussions/' + req.body.claimId + '">"' + req.body.claimTitle + '"</a> has a new comment: '+ req.body.comment.content+'</p>' +
                            '<p>From: '+ req.body.comment.author.firstName + ' ' + req.body.comment.author.lastName + '.</p>'
                        }, function(err1, info){
                            if(err1){
                                resArr.push(err1);
                                callback(err1);
                            } else {
                                resArr.push({message: 'Successfully sent a message to ' + item.firstName + ' ' + item.lastName, status: 'success'});
                                callback();
                            }
                        })
                    }else{
                        callback()
                    }
                }, function(err){
                    if(err) {
                        console.log(err);
                    } else {
                        res.json({response: resArr, status: 'success'})
                    }
                })

            }
        })

    });

    return api
};