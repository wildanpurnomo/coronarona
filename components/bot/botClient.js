const line = require('@line/bot-sdk');
const Config = require('./botConfig');

const Client = new line.Client(Config);

module.exports = Client;