var bot = require('./index');
var matchs = require('../db/matchs');

var lost = function(msg) {
  console.log('MSG lost->',msg);
  var chatId = msg.chat.id;
  var loserId = msg.from.id;
  var arg = msg.text.split('/lost ')[1];
  var sets = arg.split(' ');

  matchs.getPending(chatId).then(function(pendingMatchKey) {
    if (pendingMatchKey) {
      matchs.findById(pendingMatchKey).then(function(match) {
        console.log('Updating match->', pendingMatchKey, match, sets, loserId);
        matchs.updateResult(pendingMatchKey, match, sets, loserId).then(function(winnerId) {
          bot.sendMessage(chatId, 'Your result was saved correctly.');
          bot.sendMessage(winnerId, 'Congratz! Your win against @' + msg.from.username + ' was saved correctly.');
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

};

module.exports = lost;
