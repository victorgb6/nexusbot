var TelegramBot = require('node-telegram-bot-api');

var token = process.env.TELEGRAM_TOKEN;

var bot = new TelegramBot(token, {
  webHook: {
    port: 3000,
    host: '127.0.0.1'
  }
});

// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook('https://victorgil.me' + '/bot' + token);
console.log('webhook set!');


module.exports = bot;
