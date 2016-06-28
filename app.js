var bot             = require('./bot/index');
var register        = require('./bot/register');
var challenge       = require('./bot/challenge');
var accept          = require('./bot/accept');
var decline         = require('./bot/decline');
var resign          = require('./bot/resign');
var lost            = require('./bot/lost');
var registerTeam    = require('./bot/registerTeam');
var acceptTeam      = require('./bot/acceptTeam');
var declineTeam     = require('./bot/declineTeam');
var challengeTeam   = require('./bot/challengeTeam');
var request         = require('request');

//Register user to firebase
bot.onText(/\/\bregister\b/i, register);

//challenge another user
bot.onText(/\/\bchallenge\b/i, challenge);

//accept a challenge
bot.onText(/\/\baccept\b/i, accept);

//decline a challenge
bot.onText(/\/\bdecline\b/i, decline);

//resign a match
bot.onText(/\/\bresign\b/i, resign);

//Report a match
bot.onText(/\/\blost\b/i, lost);

//Register a team to firebase
bot.onText(/\/\bregisterTeam\b/i, registerTeam);

//Accept team invitation
bot.onText(/\/\bacceptTeam\b/i, acceptTeam);

//Decline team invitation
bot.onText(/\/\bdeclineTeam\b/i, declineTeam);

//Challenge another team
bot.onText(/\/\bchallengeTeam\b/i, challengeTeam);

//Global message call to wit.ai
bot.on('message', function(msg){
  //console.log('GLOBAL->', msg);
  request({url:'https://api.wit.ai/message',
           qs:{'q': msg.text,
               'access_token' : process.env.WIT_TOKEN}},
           function(err, response, body) {
            if(err) { console.log(err); return; }
            console.log("WIT: " + body);
            switch(body.intent){
              case: ''
            }

          });
});
