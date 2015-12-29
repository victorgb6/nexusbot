'use strict';
var TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var Firebase = require("firebase");

var token = '174209263:AAFz6nGIWjyMKjTWGe4ewy59qGr189DmtKw';
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var fireRef = new Firebase("https://nexus-bot.firebaseio.com/");

var bot = new TelegramBot(token, {webHook: {port: port, host: host}});
// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain+':443/bot'+token);
console.log('webhook set!');

bot.onText(/\/pinpon register/, function(msg) {
  var chatId = msg.chat.id;
  var usersRef = fireRef.child("users");
  console.log('Msg->',msg);
  // var obj = {};
  // obj[msg.user.id]['first_name'] = msg.user.first_name;
  // usersRef.set({
  //   alanisawesome: {
  //     date_of_birth: "June 23, 1912",
  //     full_name: "Alan Turing"
  //   }
  // });
});

//Giphy command
bot.onText(/\/giphy/, function(msg) {
  console.log('Msg->',msg);
  var chatId = msg.chat.id;
  var search = msg.text.split("/giphy ")[1];
  if (search) {
    request('http://api.giphy.com/v1/gifs/translate?s='+search+'&api_key=dc6zaTOxFJmzC', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        body = JSON.parse(body);
         var photo = request(body.data.images.original.url);
        bot.sendDocument(chatId, photo);
      }
    });
  }
});
