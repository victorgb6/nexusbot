var bot       = require('./index');
var Q         = require('q');
var register  = require('../bot/register');
var challenge = require('../bot/challenge');
var request   = require('request');
var witURL    = 'https://api.wit.ai/message';



var wit = {
  processMsg: function(msg) {
    var query = msg.text;
    return Q.Promise(function(resolve, reject) {
      request({url: witURL, qs: {'q': msg.text, 'access_token': process.env.WIT_TOKEN}},
               function(err, response, body) {
                if(err) {
                  console.log('Wit error:', err);
                  reject();
                }
                console.log('Wit Success:', body);
                resolve(JSON.parse(body));
              });
    });
  },
  checkMsg: function(msg) {
    wit.processMsg(msg).then(function(body){
      if (body.outcomes[0].confidence > 0.5) {
        switch(body.outcomes[0].intent) {
          case 'registerUser': register(msg); break;
          case 'challenge': challenge.doChallenge(msg,'', body.outcomes[0].entities.contact[0].value); break;
        }
      }
    });
  }
};

module.exports = wit;
