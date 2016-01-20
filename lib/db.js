// Firebase Database custom methods
var Firebase = require("firebase");

var db = function() {
  this.fireRef = new Firebase("https://nexus-bot.firebaseio.com/");
};

db.prototype.findUserByName = function(username) {
  var usersRef = db.fireRef.child("users");
  var username = username.toLowerCase();

  return usersRef.orderByChild('username')
          .startAt(username)
          .endAt(username)
          .limitToFirst(1)
          .once("value", function(snapshot) {
            if (snapshot.val() !== null) {
              return snapshot.child(Object.keys(snapshot.val())[0]).val();
            } else {
              return null;
            }
          });
};

db.prototype.findUserById = function(id) {
  var usersRef = db.fireRef.child("users");

  return usersRef.child(id)
          .once("value", function(snapshot) {
            if (snapshot.val() !== null) {
              return snapshot.val();
            } else {
              return null;
            }
          });
};

db.prototype.saveUser = function(data) {
  var userRef = db.fireRef.child("users/"+data.id);

  return userRef.update(data, function(error) {
    return error;
  });
};

db.prototype.findChallenge = function() {

};

db.prototype.saveChallenge = function(data) {

};



db.prototype.saveMatch = function() {

};

module.exports = new db();
