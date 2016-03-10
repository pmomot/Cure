var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    UserSchema = new mongoose.Schema({
        userGroup: {type: String, default: 'users'},
        firstName: String,
        lastName: String,
        password: {type: String, required: true, select: false},
        email: {type: String, required: true}
    });

UserSchema.pre('save', function (next) {
    'use strict';

    var self = this;

    if (!self.isModified('password')) {
        return next();
    }
    bcrypt.hash(self.password, null, null, function (err, hash) {
        if (err) {
            return next(err);
        }
        self.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password) {
    'use strict';

    var self = this;

    return bcrypt.compareSync(password, self.password);
};

module.exports = mongoose.model('User', UserSchema);