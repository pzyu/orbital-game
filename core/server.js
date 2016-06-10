var express = require('express')
	, app = express(app)
	, server = require('http').createServer(app);

app.use(express.static(__dirname));

// Get EurecaServer class
var Eureca = require('eureca.io');

// Create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setID', 'spawnEnemy', 'kill', 'updateState', 'getChar']});
var clients = {};
var selectedChar = "test";

// Attach eureca.io to our http server
eurecaServer.attach(server);

// Detect client connection
eurecaServer.onConnect(function(conn) {
	console.log('New client id=%s ', conn.id, conn.remoteAddress);

	var remote = eurecaServer.getClient(conn.id);
	clients[conn.id] = {id:conn.id, remote:remote};

	remote.getChar().onReady(function(result) {
	 	//console.log("before "+ selectedChar);
	 	//selectedChar = result;
	 	//console.log("after "+ selectedChar);
	 	//console.log(clients[cc].id);

	});
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
		var test = clients[c];
		for (var cc in clients) {
			var x = 0;
			var y = 0;
			if (clients[cc].lastState != null) {
				x = clients[cc].lastState.x;
				y = clients[cc].lastState.y;
			}
			clients[cc].remote.getChar().onReady(function(result) {
				//console.log(test);
				//console.log(clients[cc]);
				//console.log(clients[cc].id + " selected " + result);
				//console.log('remote ' + test.id + " other " + clients[cc].id);
				//clients[c].remote.spawnEnemy(clients[cc].id, x, y, result);
				//console.log(remote);
			});
			//console.log(clients[cc].remote.getChar().then());

			//console.log('remote ' + test.id + " other " + clients[cc].id);
			//console.log("selected "  + selectedChar);
			//console.log('remote ' + clients[c].id + " other " + clients[cc].id);
			remote.spawnEnemy(clients[cc].id, x, y, "player_trooper");
		}
	}
}

eurecaServer.exports.handleKeys = function(keys) {
	//console.log('handling');
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	for (var c in clients) {
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);

		clients[c].lastState = keys;
	}
}

server.listen(8000);