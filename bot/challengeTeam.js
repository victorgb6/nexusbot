var teams = require('../db/teams');
var challengeTeams = require('../db/challengesTeam');
var bot = require('./index');


var challengeTeam = function(msg, match){
  console.log('MSG challengeTeam->',msg);
  teams.findByName(teamId).then(function(team){
    var challenge = {teamFromName: '',
                     teamFromId: ''};
    console.log('Found Team->', team);
  });
  //bot.sendMessage(chatId, 'Challenged user @' + userTo + ' is not registered yet.');
};


module.exports = challengeTeam;
