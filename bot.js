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
  challengesRef.set(challenge, function(error) {
    if (error) {
      console.log("Data could not be saved." + error);
      bot.sendMessage(chatId, "Challenge cannot be saved");
    } else {
      console.log("Data saved successfully.");
      bot.sendMessage(userToId, "@"+userTo+" you have been challenge by @"+userFrom+" type /pinpon accept or /pinpon decline to get started.");
      bot.sendMessage(userFromId, "Your challenge has been sent to @"+userTo);
    }
  });
};

//Register user to firebase
bot.onText(/\/pinpon register/, function(msg) {
  var chatId = msg.chat.id;
  var usersRef = fireRef.child("users/"+msg.from.id);
  var user = {};
  if ( msg.from.username ) {
    user = {first_name: msg.from.first_name,
            last_name: msg.from.last_name || "",
            username: msg.from.username
          };
    usersRef.set(user, function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
        bot.sendMessage(chatId, "There was an error saving your user");
      } else {
        console.log("Data saved successfully.");
        bot.sendMessage(chatId, "You're all set. Challenge someone by typing /pinpon challenge [name]");
      }
    });
  } else {
    bot.sendMessage(chatId, "You must set yourself a Telegram alias, in your Telegram settings.");

  }
});

//challenge another user
bot.onText(/\/pinpon challenge/, function(msg) {
  console.log('MSG->',msg);
  var chatId = msg.chat.id;
  var userFromId = msg.from.id;
  var userFrom = msg.from.username;
  var userToId = null;
  var userTo = msg.text.split("/pinpon challenge ")[1];
  var usersRef = fireRef.child("users");

  usersRef.child(userFromId).once("value", function(snapshot) {
    if (snapshot.val() !== null) {
    //userFrom exists
    //check if challenged user is registered
    console.log('userTo->',userTo);
      usersRef.once("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();
          console.log('Snap Username->', childData.username);
          childData.username.toLowerCase() === userTo.toLowerCase() ? userToId = childSnapshot.key() : null;
        });
        console.log('userToId->',userToId);
        if (userToId) {
          saveChallenge(userFrom, userFromId, userTo, userToId);
          console.log('Saving Challenge');
        } else {
          console.log("Challenged user doesn't exists.");
          bot.sendMessage(chatId, userTo+" is not registered yet.");
        }
      });

    } else {
      console.log("User doesn't exists.");
      bot.sendMessage(chatId, userFromId+" is not registered yet.");
    }
  });
});

//accept a challenge
bot.onText(/\/pinpon accept/, function(msg) {
  console.log('MSG accept->',msg);
  var chatId = msg.chat.id;
  var userFromId = msg.from.id;
  var challengesRef = fireRef.child("challenges");
  var found = false;
  var challenge,
  match = {};
  challengesRef.once("value", function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      console.log('From->',userFromId.toString().'to->',childSnapshot.key().toString());
      if ( userFromId.toString().indexOf( childSnapshot.key().toString() ) !== -1) {
        found = true;
        challenge = childSnapshot;
      }
    });
    if (found) {
      var matchesRef = fireRef.child("matches");

      match.userFromId = challenge.userFromId;
      match.userFrom   = challenge.userFrom;
      match.userToId   = challenge.userToId;
      match.userTo     = challenge.userTo;
      challengesRef.child(userFromId+"-"+userToId).remove();
      matchesRef.push(match, function(error) {
        if (error) {
          console.log("Data could not be saved." + error);
          bot.sendMessage(chatId, "There was an error accepting the challenge.");
        } else {
          console.log("Data saved successfully.");
          bot.sendMessage(chatId, "Challenge accepted! Report your scores by typing /pinpon report [your score]:[their score].");
        }
      });
    } else {
      bot.sendMessage(chatId, "You don't have any challenge to accept.");
    }
  });

});

//Giphy command
bot.onText(/\/giphy/, function(msg) {
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
