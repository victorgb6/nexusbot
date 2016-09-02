var bot = require('./index');
var users = require('../db/users');

var declineTeam = function(msg, match) {
  console.log('MSG declineTeam->',msg);
  var chatId  = msg.chat.id;

  users.getInvitation(chatId).then(function(invitationID){
    console.log('GETINVITATION:', invitationID)
    if (invitationID) {
      users.removeInvitation(chatId).then(function(){
        bot.sendMessage(chatId, 'Your team invitation have been rejected.');
      });
    } else {
      bot.sendMessage(chatId, 'You don\'t have team invitations. (Forever alone).');
    }
  });
}

module.exports = declineTeam;
