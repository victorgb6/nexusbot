var fireRef = require('./firebase');
var Q = require('q');
var teams = require('./teams');

var challengesTeam = {
  save: function(teamName, challenge) {
    var userRef = fireRef.child('teams/' + userTo);

    return Q.Promise(function(resolve, reject) {
      userRef.update({challenge: challenge}, function(error) {
        if (error) {
          console.log('Data could not be saved.' + error);
          reject(error);
        } else {
          console.log('Data saved successfully.');
          resolve();
        }
      });
    });
  }
}


module.exports = challengesTeam;
