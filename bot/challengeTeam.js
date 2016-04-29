var teams = require('../db/teams');
var challengeTeams = require('../db/challengesTeam');
var bot = require('./index');


var doChallengeTeam = function(teamName){
  teams.findByName(teamId).then(function(team){
    var challenge = {teamFromName: '',
                     teamFromId: ''};
    challengeTeams.save();
  });
  //bot.sendMessage(chatId, 'Challenged user @' + userTo + ' is not registered yet.');
};


module.exports = doChallengeTeam;
