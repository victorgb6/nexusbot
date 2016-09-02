var bot = require('./index');
var users = require('../db/users');

var declineTeam = function(msg, match) {
  console.log('MSG declineTeam->',msg);
  var chatId = msg.chat.id;
  var teamId = '';

  users.getInvitation(chatId).then(function(invitationID){
    console.log('GETINVITATION:', invitationID)
    if (invitationID) {
      teamId = invitationID.split('-')[1];
      users.removeInvitation(chatId, teamId).then(function(){
        bot.sendMessage(chatId, 'Your team invitation have been rejected.');
      });
    } else {
      bot.sendMessage(chatId, 'You don\'t have team invitations.');
    }
  }, function(){
    bot.sendMessage(chatId, 'You don\'t have team invitations. (Forever alone).');
  });
}

module.exports = declineTeam;
