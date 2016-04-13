var bot = require('./index');
var utils = require('../utils/utils');
var users = require('../db/users');
var teams = require('../db/teams');

var registerTeam = function(msg, match) {
  console.log('registerTeam MSG->',msg);
  var chatId    = msg.chat.id;
  var args      = msg.text.split('/registerTeam ')[1];
  var user1     = utils.clearUser(args.split(' ')[0]);
  var user1ID   = ''
  var user2     = msg.from.username;
  var user2ID   = msg.from.id;;
  var teamName  = args.split(' ')[1];


  if ( user1 !== '' && user2 !== '' && teamName !== '' ) {
    var team = {
      member1: user1,
      member2: user2,
      name: teamName.toLowerCase(),
      challenge: false,
      wins: 0,
      loses: 0
    };
    console.log('Team: ', team);
    users.findByName(user1).then(function(user){
      user1ID = user.key();
      console.log('Found User: ',user1ID);
      bot.sendMessage(
        user1ID,
        '@'+user2+' wants you to join in the team '+teamName+'. What do you think?',
        {
          reply_markup: {
            inline_keyboard: [[{text: '/AcceptTeam'},
                               {text: '/DeclineTeam'}]]
          }
        }
      );
      // teams.save(team, user1ID+'-'+user2ID).then(function() {
      //   bot.sendMessage(chatId, 'Your team has been registered. Go '+team.name+'!.');
      // }, function() {
      //   bot.sendMessage(chatId, 'There was an error saving your team');
      // });
    }, function(){
      console.log('User not found: ',user1ID);
    });
  } else {
    console.log('Error registerTeam: undefined users.');
    bot.sendMessage(chatId, 'Please use this syntax: /registerTeam <@teamMate> <teamName>');
  }
};

module.exports = registerTeam;
