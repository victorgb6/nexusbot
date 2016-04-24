var bot   = require('./index');
var users = require('../db/users');
var teams = require('../db/teams');

var acceptTeam = function(msg, match) {
  console.log('MSG acceptTeam->',msg);
  var chatId  = msg.chat.id;
  var user2ID = msg.chat.id;
  var invitationID = '';

  users.getInvitation(chatId).then(function(invitationID){
    console.log('Got invitation: ', invitationID);
    if (invitationID) {
      var user1ID  = invitationID.split('-')[0];
      var teamName = invitationID.split('-')[1];
      var team = {
        member1: user1ID,
        member2: user2ID,
        name: teamName.toLowerCase(),
        challenge: false,
        wins: 0,
        loses: 0
      };
      console.log('Team:', team);
      users.removeInvitation(user2ID).then(function(){
        teams.save(team, user1ID+'-'+user2ID).then(function() {
          bot.sendMessage(chatId, 'Your team has been registered. Go '+team.name+'!.');
        }, function() {
          bot.sendMessage(chatId, 'There was an error saving your team');
        });
      });
    } else {
      bot.sendMessage(chatId, 'You don\'t have team invitations. (Forever alone).');
    }
  });
}

module.exports = acceptTeam;
