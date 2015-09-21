var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var Claim = new Schema({

    creator: {type: Schema.Types.ObjectId, ref: 'User', require: true},
    claimTitle: {type: String, require: true},
    created: {type: Date, default: Date.now},
    claimType: {type: String, require: true},
    claimBody: String,
    claimTags: [],
    status: String

});


module.exports = mongoose.model('Claim', Claim);