var TelegramBot = require('node-telegram-bot-api');

var token = process.env.TELEGRAM_TOKEN;
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {
  webHook: {
    port: port,
    host: host
  }
});

// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain + ':443/bot' + token);
console.log('webhook set!');

module.exports = bot;
