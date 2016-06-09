var express = require('express')
	, app = express(app)
	, server = require('http').createServer(app);

app.use(express.static(__dirname));

// Get EurecaServer class
var Eureca = require('eureca.io');

// Create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setID', 'spawnEnemy', 'kill', 'updateState']});
var clients = {};

// Attach eureca.io to our http server
eurecaServer.attach(server);

// Detect client connection
eurecaServer.onConnect(function(conn) {
	console.log('New client id=%s ', conn.id, conn.remoteAddress);

	var remote = eurecaServer.getClient(conn.id);
	clients[conn.id] = {id:conn.id, remote:remote};

	// setID method in client side
	remote.setID(conn.id);
});

// Detect client disconnection
eurecaServer.onDisconnect(function(conn) {
	console.log('Client disconnected ', conn.id);

	var removeID = clients[conn.id].id;

	delete clients[conn.id];

	for (var c in clients) {
		var remote = clients[c].remote;

		// Kill method in client side
		remote.kill(conn.id);
	}
});

eurecaServer.exports.handshake = function() {
	console.log('handshaking');
	for (var c in clients) {
		var remote = clients[c].remote;
		for (var cc in clients) {
			var x = clients[cc].laststate ? clients[cc].laststate.x: 0;
			var y = clients[cc].laststate ? clients[cc].laststate.y: 0;
			
			remote.spawnEnemy(clients[cc].id, 0, 0);
		}
	}
}

eurecaServer.exports.handleKeys = function(keys) {
		console.log('handling');
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	for (var c in clients) {
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);

		clients[c].lastState = keys;
	}
}

server.listen(8000);