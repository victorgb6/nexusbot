var bot      = require('./index');
var Q        = require('q');
var register = require('../bot/register');
var request  = require('request');
var witURL   = 'https://api.wit.ai/message';



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
                console.log('Wit Success');
                resolve(body);
              });
    });
  },
  checkMsg: function(msg) {
    wit.processMsg(msg).then(function(body){
      console.log('WIT->', body);
      console.log('w->', body.outcomes);
      switch(body.outcomes[0].intent){
        case 'registerUser': console.log('wit register');register(msg); break;
      }
    });
  }
};

module.exports = wit;
