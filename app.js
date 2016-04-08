var bot           = require('./bot/index');
var register      = require('./bot/register');
var challenge     = require('./bot/challenge');
var accept        = require('./bot/accept');
var decline       = require('./bot/decline');
var resign        = require('./bot/resign');
var lost          = require('./bot/lost');
var createTeam  = require('./bot/createTeam');

//Register user to firebase
bot.onText(/\/register/i, register);

//challenge another user
bot.onText(/\/challenge/i, challenge);

//accept a challenge
bot.onText(/\/accept/i, accept);

//decline a challenge
bot.onText(/\/decline/i, decline);

//resign a match
bot.onText(/\/resign/i, resign);

//Report a match
bot.onText(/\/lost/i, lost);

//Register a team to firebase
bot.onText(/\/registerTeam/i, registerTeam);
