'use strict';
var TelegramBot = require('node-telegram-bot-api');
var Firebase    = require("firebase");
var db          = require("./lib/db.js");
var Player      = require("./models/Player.js");

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

var saveChallenge = function(userFrom, userFromId, userTo, userToId) {
  var challenge = {userFrom: userFrom,
                   userFromId: userFromId
                 };
  db.saveChallenge(userToId, challenge).then(function(){
    bot.sendMessage(userToId, "@"+userTo+" you have been challenge by @"+userFrom+" type /accept or /decline to get started.");
    bot.sendMessage(userFromId, "Your challenge has been sent to @"+userTo);
  }, function() {
    bot.sendMessage(userFromId, "Challenge cannot be saved");
  });
};

var saveMatch = function(chatId, challenge) {
  var match = {};
  match.host    = challenge.userFromId;
  match.visitor = chatId;
  match.result  = false;
  match.winner  = false;

  matchesRef.push(match, function(error) {
    if (error) {
      console.log("Data could not be saved." + error);
      bot.sendMessage(chatId, "There was an error accepting the challenge.");
    } else {
      console.log("Data saved successfully.");
      bot.sendMessage(chatId, "Challenge accepted! Report your scores by typing /report [your score]:[their score].");
      bot.sendMessage(challenge.userFromId, "Your challenged to @"+challenge.userTo+" has been accepted, let's play! Report your scores by typing /report [your score]:[their score].");
    }
  });
};

//Register user to firebase
bot.onText(/\/register/, function(msg, match) {
  console.log('MSG->',msg);
  var chatId = msg.chat.id;
  if ( msg.from.username ) {
    var user = {first_name: msg.from.first_name,
            last_name: msg.from.last_name || "",
            username: msg.from.username.toLowerCase(),
            challenge: false,
            wins: 0,
            loses: 0
          };
    db.saveUser(user, chatId).then(function(){
      bot.sendMessage(chatId, "You're all set. Challenge someone by typing /challenge [name]");
    }, function() {
      bot.sendMessage(chatId, "There was an error saving your user");
    })
  } else {
    bot.sendMessage(chatId, "You must set yourself a Telegram alias, in your Telegram settings.");
  }
});

//challenge another user
bot.onText(/\/challenge/, function(msg, match) {
  console.log('MSG->',msg,'MATCH->',match);
  var chatId = msg.chat.id,
  userFromId = msg.from.id,
  userFrom = msg.from.username,
  userToId = null,
  userTo = msg.text.split("/challenge @")[1];

  db.findUserById(userFromId).then(function(){
    db.findUserByName(userTo.toLowerCase()).then(function(user){
      saveChallenge(userFrom, userFromId, userTo, user.key());
      console.log('Saving Challenge');
    }, function(){
      console.log("Challenged user doesn't exists.");
      bot.sendMessage(chatId, "Challenged user @"+userTo+" is not registered yet.");
    });
  }, function() {
    console.log("User doesn't exists.");
    bot.sendMessage(chatId, "@"+userFromId+" is not registered yet.");
  });
});

//accept a challenge
bot.onText(/\/accept/, function(msg) {
  console.log('MSG accept->',msg);
  var chatId = msg.chat.id;
  db.hasPendingMatch(chatId).then(function(hasPendingMatch){
    if (!hasPendingMatch) {
      db.getChallenge(chatId).then(function(challenge){
        console.log('Accept challenge:', challenge);
        var match = {};
        match.host    = challenge.userFromId;
        match.visitor = chatId;
        match.result  = false;
        match.winner  = false;
        db.saveMatch(match).then(function(matchKey){
          db.removeChallenge(chatId, matchKey);
          bot.sendMessage(chatId, "Challenge accepted. Let's Play.");
          bot.sendMessage(challenge.userFromId, "Your challenge to @"+msg.chat.username+" has been accepted. Get ready!");
        }, function() {
          console.log('Error saving the match.');
          bot.sendMessage(chatId, "There was an error creating your match.");
        });
      }, function(){
        console.log('Error accepting challenge');
        bot.sendMessage(chatId, "You don't have any challenge to accept.");
      });
    } else {
      bot.sendMessage(chatId, "You cannot accept a challenge because you have an unfinished match. Report the result or resign the match and try again.");
    }
  }, function() {
    console.log('Error checking if hasPendingMatch');
  });

});

//decline a challenge
bot.onText(/\/decline/, function(msg) {
  console.log('MSG decline->',msg);
  var chatId = msg.chat.id;

  db.getChallenge(chatId).then(function(challenge){
    db.removeChallenge(chatId).then(function(){
      bot.sendMessage(chatId, "Your challenge with @"+challenge.userFrom+" has been rejected. There is a chicken at the office?");
      bot.sendMessage(challenge.userFromId, "Your challenge to @"+msg.chat.username+" has been rejected.");
    }, function(){
      console.log('Error removing declined challenge');
      bot.sendMessage(chatId, "There was an error declining your challenge.");
    });
  }, function() {
    console.log('Error declining challenge');
    bot.sendMessage(chatId, "You don't have any challenge to decline.");
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
        db.updateMatchResult(pendingMatchKey, match, sets, loserId);
      }, function() {
        console.log('Error checking if the player has match without result');
        bot.sendMessage(chatId, "You don't have any match to report.");
      });
    } else {
      console.log('Player does not have a match without result.');
      bot.sendMessage(chatId, "You don't have any pending match to report.");
    }
  }, function() {
    console.log('Error checking if hasPendingMatch');
  });

});
