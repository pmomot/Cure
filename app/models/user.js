var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema,
    UserSchema = new Schema({
        userGroup: {type: String, default: 'HR'},
        firstName: String,
        lastName: String,
        password: {type: String, required: true, select: false},
        email: {type: String, required: true}
    });

UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) {
        return next();
    }
    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});

UserSchema.methods.comparePassword = function(password){
    var user = this;

    return bcrypt.compareSync(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);