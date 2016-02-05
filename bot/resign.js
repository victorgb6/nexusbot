var resign = function(msg) {
  console.log('MSG resign->',msg);
  var chatId = msg.chat.id;
  db.findUserById(chatId).then(function(snapshot) {
    var user = snapshot.val();
  }, function() {

  });
};

module.exports = resign;
