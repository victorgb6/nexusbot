var bot = require('./index');
var users = require('../db/users');
var teams = require('../db/teams');

var acceptTeam = function(msg, match) {
  console.log('MSG acceptTeam->',msg);
  var chatId = msg.chat.id;
  var invitationID = '';

  users.getInvitation(chatId).then(function(invitationID){
    if (invitationID) {
      //I need the team name and the other userID
      teams.save(team, user1ID+'-'+user2ID).then(function() {
        bot.sendMessage(chatId, 'Your team has been registered. Go '+team.name+'!.');
      }, function() {
        bot.sendMessage(chatId, 'There was an error saving your team');
      });
    } else {

    }
  });
}

module.exports = acceptTeam;
