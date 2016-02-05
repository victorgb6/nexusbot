var fireRef = require('./firebase');
var Q = require('q');
var users = require('./users');

var challenges = {

  get: function(id) {
    var usersRef = fireRef.child('users');

    return Q.Promise(function(resolve, reject) {
      users.findById(id).then(function(user) {
        if (user.val().challenge) {
          console.log('Found user->',user.val().challenge);
          resolve(user.val().challenge);
        } else {
          console.log('User: ' + id + ' has no challenges.');
          reject();
        }
      }, function() {
        console.log('Cannot find user:' + id + ' so it is not possible to get any challenge.');
        reject();
      });
    });
  },

  remove: function(id, matchKey) {
    var userRef = fireRef.child('users/' + id);

    return Q.Promise(function(resolve, reject) {
      var pending = matchKey || false;
      userRef.update({
        challenge: false,
        pendingMatch: pending
      }, function(error) {
        if (error) {
          console.log('Cannot remove challenge for user: ' + id + ' err:', error);
          reject();
        } else {
          console.log('Challenge at user: ' + id + ' has been removed.');
          resolve();
        }
      });
    });
  },

  save: function(userTo, challenge) {
    var userRef = fireRef.child('users/' + userTo);

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
};

module.exports = challenges;
