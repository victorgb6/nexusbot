var bot = require('./index');
var users = require('../db/users');
var challenges = require('../db/challenges');

var decline = function(msg) {
  console.log('MSG decline->',msg);
  var chatId = msg.chat.id;

  challenges.get(chatId).then(function(challenge) {
    challenges.remove(chatId).then(function() {
      bot.sendMessage(chatId, 'Your challenge with @' + challenge.userFrom + ' has been rejected. There is a chicken at the office?');
      bot.sendMessage(challenge.userFromId, 'Your challenge to @' + msg.chat.username + ' has been rejected.');
    }, function() {
      console.log('Error removing declined challenge');
      bot.sendMessage(chatId, 'There was an error declining your challenge.');
    });
  }, function() {
    console.log('Error declining challenge');
    bot.sendMessage(chatId, 'You don\'t have any challenge to decline.');
  });
};

module.exports = decline;
