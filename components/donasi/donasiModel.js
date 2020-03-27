const Schema = require('../schema/mongoSchema');

const DonasiSchema = new Schema({

});

const Donasi = mongoose.model('donasi', DonasiSchema);

module.exports = Donasi;