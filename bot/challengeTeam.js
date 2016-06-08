var teams = require('../db/teams');
var bot = require('./index');


var challengeTeam = function(msg, match){
  console.log('MSG challengeTeam->',msg);
  var chatId       = msg.chat.id;
  var userFromId   = msg.chat.id;
  var team         = msg.text.split('/challengeTeam ')[1];
  teams.findByName(teamId).then(function(team){
    var challenge = {teamFromName: '',
                     teamFromId: ''};
    console.log('Found Team->', team);
  });
  //bot.sendMessage(chatId, 'Challenged user @' + userTo + ' is not registered yet.');
};

module.exports = challengeTeam;
