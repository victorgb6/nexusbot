'use strict';
var TelegramBot = require('node-telegram-bot-api');
var Firebase    = require('firebase');
var db          = require('./lib/db');
var register    = require('./bot/register');
var challenge   = require('./bot/challenge');
var accept      = require('./bot/accept');

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
bot.onText(/\/decline/, function(msg) {
  console.log('MSG decline->',msg);
  var chatId = msg.chat.id;
  db.getChallenge(chatId).then(function(challenge){
    db.removeChallenge(chatId).then(function(){
      bot.sendMessage(chatId, 'Your challenge with @'+challenge.userFrom+' has been rejected. There is a chicken at the office?');
      bot.sendMessage(challenge.userFromId, 'Your challenge to @'+msg.chat.username+' has been rejected.');
    }, function(){
      console.log('Error removing declined challenge');
      bot.sendMessage(chatId, 'There was an error declining your challenge.');
    });
  }, function() {
    console.log('Error declining challenge');
    bot.sendMessage(chatId, 'You don\'t have any challenge to decline.');
  });
});

//resign a match
bot.onText(/\/resign/, function(msg) {
  console.log('MSG resign->',msg);
  var chatId = msg.chat.id;
  db.findUserById(chatId).then(function(snapshot) {
    var user = snapshot.val();
  }, function() {

  });
});

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
