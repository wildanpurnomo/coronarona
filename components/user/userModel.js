const mongoose = require('mongoose');
const Schema = require('../schema/mongoSchema');

const UserSchema = new Schema({
    userID: {
        type: String,
        required: true,
        unique: true
    },
    wantsDailyNews: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', UserSchema);

module.exports = User;