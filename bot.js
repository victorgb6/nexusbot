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

var saveChallenge = function(userFrom, userFromId, userTo, userToId) {
  var challenge = {userFrom: userFrom,
                   userFromId: userFromId,
                   userTo: userTo,
                   userToId: userToId,
                   accepted: false
                 };
  var challengesRef = fireRef.child("challenges/"+userFromId+"-"+userToId);
  challengesRef.update(challenge, function(error) {
    if (error) {
      console.log("Data could not be saved." + error);
      bot.sendMessage(chatId, "Challenge cannot be saved");
    } else {
      console.log("Data saved successfully.");
      bot.sendMessage(userToId, "@"+userTo+" you have been challenge by @"+userFrom+" type /accept [@user] or /decline [@user] to get started.");
      bot.sendMessage(userFromId, "Your challenge has been sent to @"+userTo);
    }
  });
};

var saveMatch = function(chatId, challenge) {
  var matchesRef = fireRef.child("matches"),
  challengesRef = fireRef.child("challenges"),
  match = {};
  console.log('Challenge->',challenge);
  match.userFromId = challenge.userFromId;
  match.userFrom   = challenge.userFrom;
  match.userToId   = challenge.userToId;
  match.userTo     = challenge.userTo;
  match.result     = false;
  console.log('Removing challenge->', challenge.userFromId+"-"+challenge.userToId);
  challengesRef.child(challenge.userFromId+"-"+challenge.userToId).remove(function(error) {
    if (error) {
      console.log('Remove challenge fail');
    }
  });
  matchesRef.push(match, function(error) {
    if (error) {
      console.log("Data could not be saved." + error);
      bot.sendMessage(chatId, "There was an error accepting the challenge.");
    } else {
      console.log("Data saved successfully.");
      bot.sendMessage(chatId, "Challenge accepted! Report your scores by typing /report [your score]:[their score].");
      bot.sendMessage(userFromId, "Your challenged to @"+userTo+" has been accepted, let's play! Report your scores by typing /report [your score]:[their score].");
    }
  });
};

//Register user to firebase
bot.onText(/\/register/, function(msg, match) {
  console.log('MSG->',msg,'MATCH->',match);
  var chatId = msg.chat.id,
  usersRef = fireRef.child("users/"+msg.from.id),
  user = {};
  if ( msg.from.username ) {
    user = {first_name: msg.from.first_name,
            last_name: msg.from.last_name || "",
            username: msg.from.username.toLowerCase()
          };
    usersRef.update(user, function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
        bot.sendMessage(chatId, "There was an error saving your user");
      } else {
        console.log("Data saved successfully.");
        bot.sendMessage(chatId, "You're all set. Challenge someone by typing /challenge [name]");
      }
    });
  } else {
    bot.sendMessage(chatId, "You must set yourself a Telegram alias, in your Telegram settings.");
  }
  usersRef.orderByChild("username");
});

//challenge another user
bot.onText(/\/challenge/, function(msg, match) {
  console.log('MSG->',msg,'MATCH->',match);
  var chatId = msg.chat.id,
  userFromId = msg.from.id,
  userFrom = msg.from.username,
  userToId = null,
  userTo = msg.text.split("/challenge @")[1],
  usersRef = fireRef.child("users");

  usersRef.child(userFromId).once("value", function(snapshot) {
    if (snapshot.val() !== null) {
    //userFrom is registered
    //check if challenged user is registered
    console.log('userTo->',userTo);
      usersRef.orderByChild('username')
              .startAt(userTo.toLowerCase())
              .endAt(userTo.toLowerCase())
              .once("value", function(snapshot) {
                if (snapshot.val() !== null) {
                  saveChallenge(userFrom, userFromId, userTo, Object.keys(snapshot.val())[0]);
                  console.log('Saving Challenge');
                } else {
                  console.log("Challenged user doesn't exists.");
                  bot.sendMessage(chatId, "Challenged user @"+userTo+" is not registered yet.");
                }
              });
    } else {
      console.log("User doesn't exists.");
      bot.sendMessage(chatId, "@"+userFromId+" is not registered yet.");
    }
  });
});

//accept a challenge
bot.onText(/\/accept/, function(msg) {
  console.log('MSG accept->',msg);
  var chatId = msg.chat.id,
  challengedId = msg.from.id,
  challenger = msg.text.split("/accept @")[1],
  challengerId = '',
  challengesRef = fireRef.child("challenges"),
  challenge = {};
  console.log('challenger->',challenger);
  fireRef.child("users").orderByChild('username')
          .startAt(challenger.toLowerCase())
          .endAt(challenger.toLowerCase())
          .once("value", function(snapshot) {
            challengerId = Object.keys(snapshot.val())[0];
            console.log('challengerId->', challengerId);
            console.log('Ref->',challengerId+'-'+challengedId);
            challengesRef
            .child(challengerId+'-'+challengedId)
            .once("value", function(snapshot) {
              if (snapshot.val() !== null) {
                challenge = snapshot.child(Object.keys(snapshot.val())[0]).val();
                console.log('Accept Challenge->', challenge);
                //check if I got that challenge with that challenger.
                if (challenge.userToId == challengedId) {
                  console.log('snapVal->', challenge);
                  //Creates the match
                  saveMatch(chatId, challenge);
                }
              } else {
                console.log('Challenger not found');
                bot.sendMessage(chatId, "You don't have any challenge from @"+challenger);
              }
            });
          });
});

//decline a challenge
bot.onText(/\/decline/, function(msg) {
  console.log('MSG decline->',msg);
  var chatId = msg.chat.id,
  challengedId = msg.from.id,
  challenger = msg.text.split("/decline @")[1],
  challengesRef = fireRef.child("challenges"),
  found = false,
  challenge = {},
  match = {};
  console.log('challenger->',challenger);
  challengesRef
  .orderByChild('userFrom')
  .startAt(challenger.toLowerCase())
  .endAt(challenger.toLowerCase())
  .once("value", function(snapshot) {
    if (snapshot.val() !== null) {
      challenge = snapshot.child(Object.keys(snapshot.val())[0]).val();
      console.log('challenge->',challenge);
      //check if I got that challenge with that challenger.
      if (challenge.userToId == challengedId) {
        //Creates the match
        challengesRef.child(Object.keys(snapshot.val())[0]).remove(function(error) {
          if (error) {
            console.log('Remove challenge fail');
          } else {
            bot.sendMessage(chatId, "Your challenge with @"+challenger+" has been decline.");
            bot.sendMessage(challenge.userFromId, "Your challenge to @"+challenge.userTo+" has been decline.");
          }
        });
      } else {
        console.log('Challenged to not found');
        bot.sendMessage(chatId, "You don't have any challenge from @"+challenger);
      }
    } else {
      console.log('Challenger not found');
      bot.sendMessage(chatId, "You don't have any challenge from @"+challenger);
    }
  });
});

//Report a match
bot.onText(/\/report/, function(msg) {
  console.log('MSG report->',msg);
  var chatId = msg.chat.id,
  userFromId = msg.from.id,
  arg = msg.text.split('/report ')[1],
  args = arg.split(' '),
  userTo = args[0].split('@')[1],
  score = args[1],
  sets = score.split(","),
  matchesRef = fireRef.child("matches");

  console.log('userTo->',userTo, 'score->',score);
});
