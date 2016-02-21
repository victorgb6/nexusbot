'use strict';

var PORT = 45000;

var FirebaseServer = require('firebase-server');
var Firebase;
var mockery = require('mockery');
var originalWebsocket = require('faye-websocket');
var _ = require('lodash');
var assert = require('assert');

var users = require('../../db/users');

// Firebase has strict requirements about the hostname format. So we provide a dummy
// hostname and then change the URL to localhost inside the faye-websocket's Client
// constructor.
var websocketMock = _.defaults({
	Client: function (url) {
		url = url.replace(/dummy\d+\.firebaseio\.test/i, 'localhost').replace('wss://', 'ws://');
		return new originalWebsocket.Client(url);
	}
}, originalWebsocket);
mockery.registerMock('faye-websocket', websocketMock);

describe('Users firebase', function () {
	var server;
	var sequentialConnectionId = 0;

	beforeEach(function () {
		mockery.enable({
			warnOnUnregistered: false
		});

		Firebase = require('firebase');
	});

	afterEach(function() {
		if (server) {
			server.close();
			server = null;
		}
	});

	function newServerUrl() {
		return 'ws://dummy' + (sequentialConnectionId++) + '.firebaseio.test:' + PORT;
	}

  it('should find a user by his username', function (done) {
		server = new FirebaseServer(PORT, 'localhost:' + PORT);
		var client = new Firebase(newServerUrl());
		client.once('value', function (snap) {
			assert.equal(snap.val(), null);
			done();
		});
	});

});
