'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Claim = new Schema({
        creator: {type: Schema.Types.ObjectId, ref: 'User', require: true},
        fullName: String,
        authorEmail: String,
        claimComment: String,
        claimComments: [{created: Date, content: String, author: Object}],
        claimRecipient: Object,
        claimTitle: {type: String, require: true},
        created: {type: Date, default: Date.now},
        claimType: {type: String, require: true},
        claimTag: String,
        status: String,
        anonymous: Boolean
    });

module.exports = mongoose.model('Claim', Claim);
