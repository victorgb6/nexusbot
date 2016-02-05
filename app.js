'use strict';
var TelegramBot = require('node-telegram-bot-api');
var register    = require('./bot/register');
var challenge   = require('./bot/challenge');
var accept      = require('./bot/accept');
var decline     = require('./bot/decline');
var resign      = require('./bot/resign');
var lost        = require('./bot/lost');

var token = process.env.telegram_token;
// See https://developers.openshift.com/en/node-js-environment-variables.html
var port = process.env.OPENSHIFT_NODEJS_PORT;
var host = process.env.OPENSHIFT_NODEJS_IP;
var domain = process.env.OPENSHIFT_APP_DNS;

var bot = new TelegramBot(token, {
  webHook: {
    port: port,
    host: host
  }
});

// OpenShift enroutes :443 request to OPENSHIFT_NODEJS_PORT
bot.setWebHook(domain + ':443/bot' + token);
console.log('webhook set!');

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
