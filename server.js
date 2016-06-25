var express = require('express')
	, app = express(app)
	, server = require('http').createServer(app);

app.use(express.static(__dirname));

//For avoidong Heroku $PORT error
app.get('/', function(request, response) {
    var result = 'App is running'
    response.send(result);
}).listen(app.get('port'), function() {
    console.log('App is running, server is listening on port ', app.get('port'));
});

// Get EurecaServer class
var Eureca = require('eureca.io');

// Create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setID', 'spawnEnemy', 'kill', 'updateState', 'getChar', 'compensate']});
var clients = {};
var selectedChar = "test";

// Attach eureca.io to our http server
eurecaServer.attach(server);

// Detect client connection
eurecaServer.onConnect(function(conn) {
	console.log('New client id=%s ', conn.id, conn.remoteAddress);

	var remote = eurecaServer.getClient(conn.id);
	// Client contains id, remote, and selected character
	clients[conn.id] = {id:conn.id, remote:remote, char:selectedChar};

	// Set client's selected character
	remote.getChar().onReady(function(result) {
		clients[conn.id].char = result;
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
			// Get starting position for every client
			var x = 0;
			var y = 0;
			if (clients[cc].lastState != null) {
				x = clients[cc].lastState.x;
				y = clients[cc].lastState.y;
			}
			// Replicate enemy at position, along with selected character
			remote.spawnEnemy(clients[cc].id, x, y, clients[cc].char);
		}
	}
}

eurecaServer.exports.handleKeys = function(keys) {
	//console.log('handling');
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	// For each client, update last input
	for (var c in clients) {
		// Update server side
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);

		// Key track of last state for spawning new players
		clients[c].lastState = keys;
	}
}

eurecaServer.exports.compensate = function(keys) {
	// Compensate difference by interpolation
	var conn = this.connection;
	var updatedClient = clients[conn.id];

	// For each client, update last input
	for (var c in clients) {
		// Update server side
		var remote = clients[c].remote;
		remote.compensate(updatedClient.id, keys);

		// Key track of last state for spawning new players
		clients[c].lastState = keys;
	}
}

// Either listen to host port or 8000 if testing locally
server.listen(process.env.PORT || 8000);