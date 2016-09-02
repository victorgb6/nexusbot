var Firebase = require('firebase');
var fireRef = new Firebase('https://nexus-bot.firebaseio.com/');

fireRef.authWithCustomToken(process.env.FIREBASE_SECRET, function(error, authData) {
  if (error) {
    console.log("Firebase: Authentication Failed!", error);
  } else {
    console.log("Firebase: Authenticated successfully with payload:", authData);
  }
});

module.exports = fireRef;
