var bot = require('./index');
var users = require('../db/users');
var challenges = require('../db/challenges');
var challengeTeam = require('./challengeTeam');

var challengeObj = {
  parseUser: function(text) {
    return text.split('/challenge @')[1]
  },

  doChallenge: function(msg, match, userTo) {
    console.log('MSG->',msg,'MATCH->',match);
    var chatId = msg.chat.id;
    var userFromId = msg.from.id;
    var userFrom = msg.from.username;
    var userToId = null;
    userTo = userTo || challengeObj.parseUser(msg.text);

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
                keyboard: [['/Accept', '/Decline']],
                resize_keyboard: true,
                one_time_keyboard: true,
                selective: true
              }
            }
          );
          bot.sendMessage(userFromId, 'Your challenge has been sent to @' + userTo);
        }, function() {
          bot.sendMessage(userFromId, 'Challenge cannot be saved');
        });
      }, function() {
        console.log('Challenged user doesn\'t exists. Looking if is a team.');
        doChallengeTeam(userTo);
      });
    }, function() {
      console.log('User doesn\'t exists.');
      bot.sendMessage(chatId, '@' + userFromId + ' is not registered yet.');
    });
  }
}

module.exports = challengeObj;
