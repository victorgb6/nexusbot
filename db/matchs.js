var fireRef = require('./firebase');
var Q = require('q');
var users = require('./users');

var matchs = {
  getPending: function(id) {
    var userRef = fireRef.child('users/' + id);

    return Q.Promise(function(resolve, reject) {
      userRef.once('value', function(snapshot) {
        var user = snapshot.val();

        if (user !== null && user.pendingMatch) {
          resolve(user.pendingMatch);
        } else {
          reject();
        }
      });
    });
  },

  findById: function(id) {
    var matchesRef = fireRef.child('matches/' + id);

    return Q.Promise(function(resolve, reject) {
      matchesRef.once('value', function(snapshot) {
        if (snapshot !== null) {
          resolve(snapshot.val());
        } else {
          console.log('Cannot find a match for that player');
          reject();
        }
      });
    });
  },

  save: function(match) {
    var matchesRef = fireRef.child('matches');

    return Q.Promise(function(resolve, reject) {
      var matchRef = matchesRef.push(match, function(error) {
        if (error) {
          console.log('Match could not be saved.' + error);
          reject(error);
        } else {
          console.log('Match saved successfully.');
          resolve(matchRef.key());
        }
      });
    });
  },

  updateResult: function(matchKey, match, result, loserId) {
    var matchRef = fireRef.child('matches/' + matchKey);

    return Q.Promise(function(resolve, reject) {
      var winnerId = (match.host === loserId ? match.visitor : match.host);

      matchRef.update({result: result, winner: winnerId}, function(error) {
        if (error) {
          console.log('Match result could not be saved.' + error);
          reject();
        } else {
          console.log('Match result saved successfully.');
        }
      });
      console.log('Updating users, winner:', winnerId, ' loser:', loserId);
      users.updateScores(winnerId, loserId);
      resolve(winnerId);
    });
  }
};

module.exports = matchs;
