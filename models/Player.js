'use strict';

var Player = function(first_name, last_name, alias, wins, loses, challenge) {
  this.first_name = first_name;
  this.last_name  = last_name;
  this.alias      = alias.toLowerCase() || '';
  this.wins       = wins;
  this.loses      = loses;
  this.challenge  = challenge;
};

Player.prototype = {
  first_name: String,
  last_name: String,
  alias: String,
  wins: 0,
  loses: 0,
  challenge: {
    fromId: Number,
    time: 0
  },
  get : function() {
    var data = {};
    data.first_name = this.first_name;
    data.last_name  = this.last_name;
    data.alias      = this.alias;
    data.wins       = this.wins;
    data.loses      = this.loses;
    data.challenge  = this.challenge;

    return data;
  }
};

module.exports = Player;
