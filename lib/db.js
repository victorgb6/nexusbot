// Firebase Database custom methods
'use strict';
var Firebase = require("firebase");
var Q = require("q")

var db = function() {
  console.log('Pong Start');
  this.fireRef = new Firebase("https://nexus-bot.firebaseio.com/");
};

db.prototype.findUserByName = function(username) {
  var usersRef = this.fireRef.child("users");
  var username = username.toLowerCase();
  return Q.Promise(function(resolve, reject) {
    usersRef.orderByChild('username')
            .startAt(username)
            .endAt(username)
            .limitToFirst(1)
            .once("value", function(snapshot) {
              if (snapshot.val() !== null) {
                resolve(snapshot.child(Object.keys(snapshot.val())[0]));
              } else {
                reject();
              }
            });
  });
};

db.prototype.findUserById = function(id) {
  var usersRef = this.fireRef.child("users");
  return Q.Promise(function(resolve, reject) {
    usersRef.child(id)
            .once("value", function(snapshot) {
              if (snapshot.val() !== null) {
                console.log('User:'+id+' found by Id->', snapshot.val());
                resolve(snapshot);
              } else {
                console.log('User:'+id+' cannot be found');
                reject();
              }
            }, function(error) {
              console.log('There was an error finding user: '+id);
              reject();
            });
  });
};

db.prototype.saveUser = function(data, id) {
  var userRef = this.fireRef.child("users/"+id);
  return Q.Promise(function(resolve, reject) {
    userRef.update(data, function(error) {
      if (error) {
        console.log("Data could not be saved." + error);
        reject(error);
      } else {
        console.log("Data saved successfully.");
        resolve();
      }
    });
  });
};

db.prototype.getChallenge = function(id) {
  var self = this;
  var usersRef = this.fireRef.child("users");
  return Q.Promise(function(resolve, reject) {
    self.findUserById(id).then(function(user) {
      if (user.val().challenge) {
        console.log('Found user->',user.val().challenge);
        resolve(user.val().challenge);
      } else {
        console.log('User: '+id+' has no challenges.');
        reject();
      }
    }, function() {
      console.log('Cannot find user:'+id+' so it is not possible to get any challenge.');
      reject();
    })
  });
};

db.prototype.removeChallenge = function(id, matchKey) {
  var userRef = this.fireRef.child("users/"+id);
  return Q.Promise(function(resolve, reject) {
    var pending = matchKey || false;
    userRef.update({challenge: false, pendingMatch: pending}, function(error) {
      if (error) {
        console.log('Cannot remove challenge for user: '+id+' err:', error);
        reject();
      } else {
        console.log('Challenge at user: '+id+' has been removed.');
        resolve();
      }
    });
  });
};

db.prototype.saveChallenge = function(userTo, challenge) {
  var userRef = this.fireRef.child("users/"+userTo);
  return Q.Promise(function(resolve, reject) {
    userRef.update({ challenge: challenge }, function(error){
      if (error) {
        console.log("Data could not be saved." + error);
        reject(error);
      } else {
        console.log("Data saved successfully.");
        resolve();
      }
    });
  });
};

db.prototype.getPendingMatch = function(id) {
  var userRef = this.fireRef.child("users/"+id);
  return Q.Promise(function(resolve, reject) {
    userRef.once("value", function(snapshot) {
      var user = snapshot.val();
      if (user !== null && user.pendingMatch) {
        resolve(user.pendingMatch);
      } else {
        reject();
      }
    });
  });
};

db.prototype.findMatchById = function(id) {
  var matchesRef = this.fireRef.child("matches/"+id);
  var self = this;
  return Q.Promise(function(resolve, reject) {
    matchesRef.once("value", function(snapshot) {
      if( snapshot !== null ) {
        resolve(snapshot.val());
      } else {
        console.log('Cannot find a match for that player');
        reject();
      }
    });
  });
};

db.prototype.updateMatchResult = function(matchKey, match, result, loserId) {
  var matchRef = this.fireRef.child("matches/"+matchKey);
  var winnerId = '';
  var self = this;
  return Q.Promise(function(resolve, reject) {
    match.host === loserId ? winnerId = match.visitor : winnerId = match.host;
    matchRef.update({result: result, winner: winnerId}, function(error){
      if (error) {
        console.log("Match result could not be saved." + error);
        reject();
      } else {
        console.log("Match result saved successfully.");
      }
    });
    console.log('Updating users, winner:', winnerId, ' loser:', loserId);
    self.updateUsersScores(winnerId, loserId);
    resolve(winnerId);
  });
};

db.prototype.updateUsersScores = function(winnerId, loserId) {
  var usersRef = this.fireRef.child("users");
  var winnerRef = usersRef.child(winnerId);
  var loserRef = usersRef.child(loserId);
  winnerRef.update({pendingMatch: false}, function() {
    winnerRef.child('wins').transaction(function(currentWins) {
      return currentWins+1;
    }, function(error) {
      if (error) {
        console.log('Error updating winner:',winnerId,'e: ', error);
      }
    });
  });
  loserRef.update({pendingMatch: false}, function() {
    loserRef.child('loses').transaction(function(currentLoses) {
      return currentLoses+1;
    }, function(error) {
      if (error) {
        console.log('Error updating loser:',winnerId,'e: ', error);
      }
    });
  });
};

db.prototype.saveMatch = function(match) {
  var matchesRef = this.fireRef.child("matches");
  return Q.Promise(function(resolve, reject) {
    var matchRef = matchesRef.push(match, function(error){
      if (error) {
        console.log("Match could not be saved." + error);
        reject(error);
      } else {
        console.log("Match saved successfully.");
        resolve(matchRef.key());
      }
    });
  });
};

module.exports = new db();
