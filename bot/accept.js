var db = require('../db/index.js');

var accept = function(msg) {
  console.log('MSG accept->',msg);
  var chatId = msg.chat.id;
  db.getPendingMatch(chatId).then(function(){
    console.log('Error checking if hasPendingMatch');
  }, function() {
    db.getChallenge(chatId).then(function(challenge){
      console.log('Accept challenge:', challenge);
      var match = {};
      match.host    = challenge.userFromId;
      match.visitor = chatId;
      match.result  = false;
      match.winner  = false;
      db.saveMatch(match).then(function(matchKey){
        db.removeChallenge(chatId, matchKey);
        db.removeChallenge(challenge.userFromId, matchKey);
        bot.sendMessage(chatId, 'Challenge accepted. Let\'s Play.');
        bot.sendMessage(challenge.userFromId, 'Your challenge to @' + msg.chat.username + ' has been accepted. Get ready!');
      }, function() {
        console.log('Error saving the match.');
        bot.sendMessage(chatId, 'There was an error creating your match.');
      });
    }, function(){
      console.log('Error accepting challenge');
      bot.sendMessage(chatId, 'You don\'t have any challenge to accept.');
    });
  });

};

module.exports = accept;
