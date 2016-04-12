var bot           = require('./bot/index');
var register      = require('./bot/register');
var challenge     = require('./bot/challenge');
var accept        = require('./bot/accept');
var decline       = require('./bot/decline');
var resign        = require('./bot/resign');
var lost          = require('./bot/lost');
var registerTeam  = require('./bot/registerTeam');

//Register user to firebase
bot.onText(/\/\bregisterteam\b/i, register);

//challenge another user
bot.onText(/\/\bregisterteam\b/i, challenge);

//accept a challenge
bot.onText(/\/\bregisterteam\b/i, accept);

//decline a challenge
bot.onText(/\/\bregisterteam\b/i, decline);

//resign a match
bot.onText(/\/\bregisterteam\b/i, resign);

//Report a match
bot.onText(/\/\bregisterteam\b/i, lost);

//Register a team to firebase
bot.onText(/\/\bregisterteam\b/i, registerTeam);
