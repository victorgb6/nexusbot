var db = require('../db/index.js');

var challenge = function(msg, match) {
  console.log('MSG->',msg,'MATCH->',match);
  var chatId = msg.chat.id,
  userFromId = msg.from.id,
  userFrom = msg.from.username,
  userToId = null,
  userTo = msg.text.split('/challenge @')[1];

  db.findUserById(userFromId).then(function(){
    db.findUserByName(userTo.toLowerCase()).then(function(user){
      var challenge = {userFrom: userFrom,
                       userFromId: userFromId
                     };
      db.saveChallenge(user.key(), challenge).then(function(){
        bot.sendMessage(user.key(), '@'+userTo+' you have been challenge by @'+userFrom+' type /accept or /decline to get started.');
        bot.sendMessage(userFromId, 'Your challenge has been sent to @'+userTo);
      }, function() {
        bot.sendMessage(userFromId, 'Challenge cannot be saved');
      });
    }, function(){
      console.log('Challenged user doesn\'t exists.');
      bot.sendMessage(chatId, 'Challenged user @'+userTo+' is not registered yet.');
    });
  }, function() {
    console.log('User doesn\'t exists.');
    bot.sendMessage(chatId, '@' + userFromId + ' is not registered yet.');
  });
};

module.exports = challenge;
