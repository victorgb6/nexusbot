'use strict';
var assert   = require('assert');
var register = require('./bot/register');

describe('/register', function() {
  it('should register a new user without error', function(done) {
    var sample = { chat: {id: 0},
                   from: {first_name: 'Sample',
                          last_name: 'User',
                          username: 'username'}
                };
    var err = register(sample);
    if (err) throw err;
  });
});
