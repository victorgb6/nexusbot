var fireRef = require('./firebase');
var Q = require('q');

var users = {
  findByName: function(name) {
    var usersRef = fireRef.child('users');
    var username = name.toLowerCase();

    return Q.Promise(function(resolve, reject) {
      usersRef.orderByChild('username')
              .startAt(username)
              .endAt(username)
              .limitToFirst(1)
              .once('value', function(snapshot) {
                if (snapshot.val() !== null) {
                  resolve(snapshot.child(Object.keys(snapshot.val())[0]));
                } else {
                  reject();
                }
              });
    });
  },

  findById: function(id) {
    var usersRef = fireRef.child('users');

    return Q.Promise(function(resolve, reject) {
      usersRef.child(id)
              .once('value', function(snapshot) {
                if (snapshot.val() !== null) {
                  console.log('User:' + id + ' found by Id->', snapshot.val());
                  resolve(snapshot);
                } else {
                  console.log('User:' + id + ' cannot be found');
                  reject();
                }
              }, function(error) {
                console.log('There was an error finding user: ' + id);
                reject();
              });
    });
  },

  save: function(data, id) {
    var userRef = fireRef.child('users/' + id);

    return Q.Promise(function(resolve, reject) {
      userRef.update(data, function(error) {
        if (error) {
          console.log('Data could not be saved.' + error);
          reject(error);
        } else {
          console.log('Data saved successfully.');
          resolve();
        }
      });
    });
  },

  updateScores: function(winnerId, loserId) {
    var usersRef = fireRef.child('users');
    var winnerRef = usersRef.child(winnerId);
    var loserRef = usersRef.child(loserId);

    winnerRef.update({pendingMatch: false}, function() {
      winnerRef.child('wins').transaction(function(currentWins) {
        return currentWins + 1;
      }, function(error) {
        if (error) {
          console.log('Error updating winner:',winnerId,'e: ', error);
        }
      });
    });

    loserRef.update({pendingMatch: false}, function() {
      loserRef.child('loses').transaction(function(currentLoses) {
        return currentLoses + 1;
      }, function(error) {
        if (error) {
          console.log('Error updating loser:',winnerId,'e: ', error);
        }
      });
    });
  }
};

module.exports = users;