var bot           = require('./bot/index');
var register      = require('./bot/register');
var challenge     = require('./bot/challenge');
var accept        = require('./bot/accept');
var decline       = require('./bot/decline');
var resign        = require('./bot/resign');
var lost          = require('./bot/lost');
var createTeam  = require('./bot/createTeam');

//Register user to firebase
bot.onText(/\bregister\b/i, register);

//challenge another user
bot.onText(/\bchallenge\b/i, challenge);

//accept a challenge
bot.onText(/\baccept\b/i, accept);

//decline a challenge
bot.onText(/\bdecline\b/i, decline);

//resign a match
bot.onText(/\bresign\b/i, resign);

//Report a match
bot.onText(/\blost\b/i, lost);

//Register a team to firebase
bot.onText(/\bcreateTeam\b/i, registerTeam);
