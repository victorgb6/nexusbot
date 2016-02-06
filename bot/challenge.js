var bot = require('./index');
var users = require('../db/users');
var challenges = require('../db/challenges');

var doChallenge = function(msg, match) {
  console.log('MSG->',msg,'MATCH->',match);
  var chatId = msg.chat.id;
  var userFromId = msg.from.id;
  var userFrom = msg.from.username;
  var userToId = null;
  var userTo = msg.text.split('/challenge @')[1];

  users.findById(userFromId).then(function() {
    users.findByName(userTo.toLowerCase()).then(function(user) {
      var challenge = {
        userFrom: userFrom,
        userFromId: userFromId
      };

      challenges.save(user.key(), challenge).then(function() {
        bot.sendMessage(
          user.key(),
          '@' + userTo + ' you have been challenge by @' + userFrom + ' type /accept or /decline to get started.',
          {
            reply_markup: {
              keyboard: [['Accept', 'Decline']]
            }
          }
        );
        bot.sendMessage(userFromId, 'Your challenge has been sent to @' + userTo);
      }, function() {
        bot.sendMessage(userFromId, 'Challenge cannot be saved');
      });
    }, function() {
      console.log('Challenged user doesn\'t exists.');
      bot.sendMessage(chatId, 'Challenged user @' + userTo + ' is not registered yet.');
    });
  }, function() {
    console.log('User doesn\'t exists.');
    bot.sendMessage(chatId, '@' + userFromId + ' is not registered yet.');
  });
};

module.exports = doChallenge;
