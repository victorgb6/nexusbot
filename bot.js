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

var checkIfChallengeExists = function(userFrom, userTo) {

};

var checkIfUserExists = function(userId) {
  return new Promise(function(resolve, reject) {
    var userRef = fireRef.child("users");
    usersRef.child(userId).once("value", function(snapshot) {
      var exists = (snapshot.val() !== null);
      resolve(exists);
    });
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
  var userTo = msg.text.split("/pinpon challenge ")[1];
  var usersRef = fireRef.child("users");
  var challengesRef = fireRef.child("challenges");
  //check if challenged user is registered
  checkIfUserExists(userFromId).then(function(data) {
   if (data) {
     console.log('From user exists.');
   }else{
     console.log('From user doesnt exists');
   }
  });
      /*//is registered
      var challenge = {userFrom: userFrom,
                       userFromId: userFromId,
                       userTo: userTo,
                       accepted: false};
      challengesRef.push(challenge, function(error) {
        if (error) {
          console.log("Data could not be saved." + error);
          bot.sendMessage(chatId, userTo+" has been already challenged!");
        } else {
          console.log("Data saved successfully.");
          bot.sendMessage(chatId, userTo+" you have been challenge by @"+userFrom+" type /pinpon accept or /pinpon decline to get started.");
        }
      });*/


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
