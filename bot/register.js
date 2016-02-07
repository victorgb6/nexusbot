var bot = require('./index');
var users = require('../db/users');

var register = function(msg) {
  console.log('MSG->',msg);
  var chatId = msg.chat.id;

  if ( msg.from.username ) {
    var user = {
      first_name: msg.from.first_name,
      last_name: msg.from.last_name || '',
      username: msg.from.username.toLowerCase(),
      challenge: false,
      wins: 0,
      loses: 0
    };

    users.save(user, chatId).then(function() {
      bot.sendMessage(chatId, 'You\'re all set. Challenge someone by typing /challenge [name]');
      return true;
    }, function() {
      bot.sendMessage(chatId, 'There was an error saving your user');
      return false;
    });
  } else {
    bot.sendMessage(chatId, 'You must set yourself a Telegram alias, in your Telegram settings.');
    return 'alias';
  }
};

module.exports = register;
