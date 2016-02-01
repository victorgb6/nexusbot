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
                resolve(snapshot.val());
              } else {
                reject();
              }
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
  return Q.Promise(function(resolve, reject) {
    db.findUserById(id).then(function(user) {
      if (user.challenge) {
        resolve(user.challenge);
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

db.prototype.saveMatch = function(match) {
  var matchesRef = this.fireRef.child("matches");
  return Q.Promise(function(resolve, reject) {
    matchesRef.push(match), function(error){
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

module.exports = new db();