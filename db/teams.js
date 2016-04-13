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
  findByName: function(name) {
    var usersRef = fireRef.child('teams');
    var name = name.toLowerCase();

    return Q.Promise(function(resolve, reject) {
      usersRef.orderByChild('name')
              .startAt(name)
              .endAt(name)
              .limitToFirst(1)
              .once('value', function(snapshot) {
                if (snapshot.val() !== null) {
                  resolve(snapshot.child(Object.keys(snapshot.val())[0]));
                } else {
                  reject();
                }
              });
    });
  }

};

module.exports = teams;
