// An example for OpenShift platform.
var TelegramBot = require('node-telegram-bot-api');
var request = require('request');

var token = '174209263:AAFz6nGIWjyMKjTWGe4ewy59qGr189DmtKw';
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain+':443/bot'+token);
console.log('webhook set!');
// bot.on('message', function (msg) {
//   console.log('Msg received->', msg);
//   var chatId = msg.chat.id;
//   bot.sendMessage(chatId, "I'm alive!");
// });

//Giphy
bot.onText(/\/giphy/, function(msg) {
  var chatId = msg.chat.id;
  var search = msg.text.split("/giphy ")[1];
  if (search) {
    request('http://api.giphy.com/v1/gifs/translate?s='+search+'&api_key=dc6zaTOxFJmzC', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
         var photo = request(body.data.images.original.url);
        bot.sendPhoto(chatId, photo);
      }
    });
  }
});

// Matches /love
bot.onText(/\/love/, function (msg) {
  var chatId = msg.chat.id;
  var opts = {
      reply_to_message_id: msg.message_id,
      reply_markup: JSON.stringify({
        keyboard: [
          ['Yes, you are the bot of my life ❤'],
          ['No, sorry there is another one...']]
      })
    };
    bot.sendMessage(chatId, 'Do you love me?', opts);
});
