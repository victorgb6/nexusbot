var utils = {
  clearUser: function(userName) {
    console.log('Clean user');
    return userName.split('@')[1];
  }
}

module.exports = utils;
