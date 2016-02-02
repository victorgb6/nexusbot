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

db.prototype.removeChallenge = function(id) {
  var userRef = this.fireRef.child("users/"+id);
  return Q.Promise(function(resolve, reject) {
    console.log('Removing challenge->', userRef);
    userRef.update({challenge: false, pendingMatch: true}, function(error) {
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

db.prototype.hasPendingMatch = function(id) {
  var userRef = this.fireRef.child("users/"+id);
  return Q.Promise(function(resolve, reject) {
    userRef.once("value", function(snapshot) {
      var user = snapshot.val();
      if (user !== null) {
        if (user.pendingMatch) {
          resolve(true);
        } else {
          resolve(false);
        }
      } else {
        reject();
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

db.prototype.findMatchByPlayerId = function(id) {
  var matchesRef = this.fireRef.child("matches");
  return Q.Promise(function(resolve, reject) {
    matchesRef.orderByChild('host')
              .startAt(id)
              .endAt(id)
              .limitToFirst(1)
              .once("value", function(snapshot) {
                if (snapshot.val() !== null) {
                  resolve(Object.keys(snapshot.val())[0]);
                } else {
                  matchesRef.orderByChild('visitor')
                            .startAt(id)
                            .endAt(id)
                            .limitToFirst(1)
                            .once("value", function(snapshot) {
                              if (snapshot.val() !== null) {
                                resolve(Object.keys(snapshot.val())[0]);
                              } else {
                                console.log('Cannot find a match for that player');
                                reject();
                              }
                            });
                }
              });
  });
};

db.prototype.findMatchWithoutResultByPlayerId = function(id) {
  var matchesRef = this.fireRef.child("matches");
  var self = this;
  return Q.Promise(function(resolve, reject) {
    self.findMatchByPlayerId(id).then(function(matchKey){
      matchesRef.child(matchKey).once("value", function(snapshot) {
        var match = snapshot.val();
        if ( snapshot != null && !match.result ) {
          console.log('Match found->', match);
          resolve({matchKey: matchKey, match: match});
        } else {
          console.log('Cannot find a pending match with that key');
          reject();
        }
      });
    }, function() {
      console.log('Cannot find a match for that player id');
      reject();
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
      } else {
        console.log("Match result saved successfully.");
      }
    });
    self.updateUsersScores(winnerId, loserId);
  });
};

db.prototype.updateUsersScores = function(winnerId, loserId) {
  var usersRef = this.fireRef.child("users");
    usersRef.child(winnerId).child(wins).transaction(function(currentWins) {
      return currentWins+1;
    });
    usersRef.child(loserId).child(loses).transaction(function(currentLoses) {
      return currentLoses+1;
    });
};

db.prototype.saveMatch = function(match) {
  var matchesRef = this.fireRef.child("matches");
  return Q.Promise(function(resolve, reject) {
    matchesRef.push(match, function(error){
      if (error) {
        console.log("Match could not be saved." + error);
        reject(error);
      } else {
        console.log("Match saved successfully.");
        resolve();
      }
    });
  });
};

module.exports = new db();
