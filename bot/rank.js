var bot   = require('./index');
var utils = require('../utils/utils');
var users = require('../db/users');

var rank = function(msg, match) {
  console.log('Rank MSG->',msg);
  var chatId   = msg.chat.id;
  var usersArr = msg.text.split('@').slice(1);

  if (usersArr.length == 0) {
    usersArr.push(msg.from.username);
  }
  var queue = Q.defer();
  var ranks = [];
  usersArr.map(function(name){
    queue = queue.then(function(u){
      u = u.val();
      ranks.push()
      return users.findByName(name)
    });
    /*console.log('Rank getting: ', name);
    users.findByName(name).then(function(u){
      console.log('rank u:', u.val());
      u = u.val();
      var res = u.username + ': wins ' + u.wins + ' , loses ' + u.loses;
      bot.sendMessage(chatId, res);
    }, function(){
      bot.sendMessage(chatId, 'Something went wrong getting your rank.');
    });*/
  });
  queue.then(function(){
    ranks.map(function(u){
      var res = u.username + ': wins ' + u.wins + ' , loses ' + u.loses;
      bot.sendMessage(chatId, res);
    })
  })
};

module.exports = rank;
