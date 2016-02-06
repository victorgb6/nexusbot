var bot         = require('./bot/index');
var register    = require('./bot/register');
var challenge   = require('./bot/challenge');
var accept      = require('./bot/accept');
var decline     = require('./bot/decline');
var resign      = require('./bot/resign');
var lost        = require('./bot/lost');

//Register user to firebase
bot.onText(/\/register/, register);

//challenge another user
bot.onText(/\/challenge/, challenge);

//accept a challenge
bot.onText(/\/accept/, accept);

//decline a challenge
bot.onText(/\/decline/, decline);

//resign a match
bot.onText(/\/resign/, resign);

//Report a match
bot.onText(/\/lost/, lost);
