var bot   = require('./index');
var utils = require('../utils/utils');
var users = require('../db/users');

var rank = function(msg, match) {
  console.log('Rank MSG->',msg);
  var chatId   = msg.chat.id;
  var user = msg.text.split('@').slice(1)[0] || msg.from.username;

  console.log('Rank getting: ', user);
  users.findByName(user).then(function(u){
    console.log('rank u:', u.val());
    u = u.val();
    var res = u.username + ': wins ' + u.wins + ' , loses ' + u.loses;
    bot.sendMessage(chatId, res);
  }, function(){
    bot.sendMessage(chatId, 'Something went wrong getting your rank.');
  });

};

module.exports = rank;
