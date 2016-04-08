var fireRef = require('./firebase');
var Q = require('q');

var teams = {

  save: function(data, id) {
    var teamsRef = fireRef.child('teams/' + id);
    return Q.Promise(function(resolve, reject) {
      teamsRef.update(data, function(error) {
        if (error) {
          console.log('Team could not be saved.' + error);
          reject(error);
        } else {
          console.log('Team saved successfully.');
          resolve();
        }
      });
    });
  },

};

module.exports = teams;
