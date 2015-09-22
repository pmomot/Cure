var User = require('../models/user'),
    Claim = require('../models/claim'),
    config = require('../../config'),
    jsonwebtoken = require('jsonwebtoken'),
    secretKey = config.secretKey;

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

    api.route('/')
        .post(function(req, res){

            var claim = new Claim({
                creator: req.decoded.id,
                claimTitle: req.body.claimTitle,
                claimType: req.body.claimType,
                claimBody: req.body.claimBody,
                claimTags: req.body.claimTags,
                status: "open"
            });

            claim.save(function(err){
                if(err){
                    res.send(err);
                    return
                }
                res.json({message: 'New claim has been created'})
            });
        })

        .get(function(req, res){
            Claim.find({creator: req.decoded.id}, function(err, claims){
                if(err){
                    res.send(err);
                    return
                }
                res.json(claims)
            })
        });

    api.get('/me', function(req, res){
       res.json(req.decoded);
    });

    return api
};