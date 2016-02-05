'use strict';
var TelegramBot = require('node-telegram-bot-api');
var Firebase    = require('firebase');
var db          = require('./lib/db');
var register    = require('./bot/register');
var challenge   = require('./bot/challenge');
var accept      = require('./bot/accept');
var decline     = require('./bot/decline');
var resign      = require('./bot/resign');

var token = process.env.telegram_token;
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var fireRef = new Firebase('https://nexus-bot.firebaseio.com/');

var bot = new TelegramBot(token, {
  webHook: {
    port: port,
    host: host
  }
});

// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain + ':443/bot' + token);
console.log('webhook set!');

//Register user to firebase
bot.onText(/\/register/, register);

//challenge another user
bot.onText(/\/challenge/, challenge);

//accept a challenge
bot.onText(/\/accept/, accept);

//decline a challenge
bot.onText(/\/decline/, decline);

//resign a match
bot.onText(/\/resign/, resign);

//Report a match
bot.onText(/\/lost/, function(msg) {
  console.log('MSG lost->',msg);
  var chatId = msg.chat.id,
  loserId = msg.from.id,
  arg = msg.text.split('/lost ')[1],
  sets = arg.split(' ');

  db.getPendingMatch(chatId).then(function(pendingMatchKey){
    if (pendingMatchKey) {
      db.findMatchById(pendingMatchKey).then(function(match) {
        console.log('Updating match->', pendingMatchKey, match, sets, loserId);
        db.updateMatchResult(pendingMatchKey, match, sets, loserId).then( function(winnerId) {
          bot.sendMessage(chatId, 'Your result was saved correctly.');
          bot.sendMessage(winnerId, 'Congratz! Your win against @'+msg.from.username+' was saved correctly.');
        }, function() {
          bot.sendMessage(chatId, 'There was an error saving your result.');
        });
      }, function() {
        console.log('Error checking if the player has match without result');
        bot.sendMessage(chatId, 'You don\'t have any match to report.');
      });
    } else {
      console.log('Player does not have a match without result.');
      bot.sendMessage(chatId, 'You don\'t have any pending match to report.');
    }
  }, function() {
    console.log('Error checking if hasPendingMatch');
    bot.sendMessage(chatId, 'You don\'t have any pending match to report.');
  });

});
