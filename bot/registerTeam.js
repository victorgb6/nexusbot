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
    users.findByName(user1).then(function(user){
      user1ID = user.key();
      console.log('Found User: ',user1ID);
      users.addInvitation(user1ID, user2ID+'-'+team.name).then(function(){
        bot.sendMessage(
          user1ID,
          '@'+user2+' wants you to join in the team '+teamName+'. What do you think?',
          {
            reply_markup: {
              keyboard: [[{text: '/AcceptTeam'},
                          {text: '/DeclineTeam'}]],
              one_time_keyboard: true
            }
          }
        );
      });
    }, function(){
      console.log('User not found: ',user1ID);
    });
  } else {
    console.log('Error registerTeam: undefined users.');
    bot.sendMessage(chatId, 'Please use this syntax: /registerTeam <@teamMate> <teamName>');
  }
};

module.exports = registerTeam;
