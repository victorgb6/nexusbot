// An example for OpenShift platform.
var TelegramBot = require('node-telegram-bot-api');

var token = '174209263:AAFz6nGIWjyMKjTWGe4ewy59qGr189DmtKw';
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain+':443/bot'+token);
console.log('webhook set!');
bot.on('message', function (msg) {
  var chatId = msg.chat.id;
  bot.sendMessage(chatId, "I'm alive!");
});
