var bot = require('./index');
var matchs = require('../db/matchs');
var challenges = require('../db/challenges');

var accept = function(msg) {
  console.log('MSG accept->',msg);
  var chatId = msg.chat.id;
  matchs.getPending(chatId).then(function() {
    console.log('Error checking if hasPendingMatch');
  }, function() {
    challenges.get(chatId).then(function(challenge) {
      console.log('Accept challenge:', challenge);
      var match = {
        host: challenge.userFromId,
        visitor: chatId,
        result: false,
        winner: false
      };

      matchs.save(match).then(function(matchKey) {
        challenges.remove(chatId, matchKey);
        challenges.remove(challenge.userFromId, matchKey);
        bot.sendMessage(chatId, 'Challenge accepted. Let\'s Play.');
        bot.sendMessage(challenge.userFromId, 'Your challenge to @' + msg.chat.username + ' has been accepted. Get ready!');
      }, function() {
        console.log('Error saving the match.');
        bot.sendMessage(chatId, 'There was an error creating your match.');
      });
    }, function() {
      console.log('Error accepting challenge');
      bot.sendMessage(chatId, 'You don\'t have any challenge to accept.');
    });
  });

};

module.exports = accept;
