const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DonasiSchema = new Schema({
    issuerID: {
        type: String,
        required: true
    },
    name : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    url: {
        type: String,
        default: ""
    },
    adminApproval: {
        type: Boolean,
        default: false
    }
});

const Donasi = mongoose.model('donasi', DonasiSchema);

module.exports = Donasi;