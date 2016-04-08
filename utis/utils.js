var utils = {
  clearUser: function(userName) {
    return userName.split('@')[1];
  }
}

module.exports = utils;
