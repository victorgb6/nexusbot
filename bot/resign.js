var bot = require('./index');
var users = require('../db/users');

var resign = function(msg) {
  console.log('MSG resign->',msg);
  var chatId = msg.chat.id;

  users.findById(chatId).then(function(snapshot) {
    var user = snapshot.val();
  }, function() {

  });
};

module.exports = resign;
