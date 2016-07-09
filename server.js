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
var eurecaServer = new Eureca.Server({allow:['setID', 
	'getNick', 
	'gameStart',
	'updateLobby',
	'loadPlayersLR',
	'spawnEnemy', 
	'kill', 
	'updateState', 
	'getChar', 
	'compensate', 
	'broadcast'
]});
// initialize server core data
var clients = {};
var connectedCount = 0;
var lobbylist = {};

// Initialize public lobby
eurecaServer.exports.initializeLobby = function() {
	// Initialize public lobby
	lobbylist['publicLobby1'] = {gameType:'Team Deathmatch', maxPlayers:4, status:'Open Host', password:'', clientInfo:{}, playerCount:0, host:''};
	lobbylist['publicLobby2'] = {gameType:'Team Deathmatch', maxPlayers:6, status:'Open Host', password:'', clientInfo:{}, playerCount:0, host:''};
	lobbylist['publicLobby3'] = {gameType:'Team Deathmatch', maxPlayers:8, status:'Open Host', password:'', clientInfo:{}, playerCount:0, host:''};
	lobbylist['publicLobby4'] = {gameType:'Team Deathmatch', maxPlayers:12, status:'Open Host', password:'', clientInfo:{}, playerCount:0, host:''};
}
eurecaServer.exports.initializeLobby();

//var selectedChar = "test";

// Attach eureca.io to our http server
eurecaServer.attach(server);

// Detect client connection
eurecaServer.onConnect(function(conn) {
	var remote = eurecaServer.getClient(conn.id);
	// Client contains id, remote, and selected character
	clients[conn.id] = {
		id:conn.id, 
		remote:remote, 
		lobbyID:'',
		team: null,
		ready:false
	};
	//clients[conn.id] = {id:conn.id, remote:remote, char:selectedChar};
	
	// Set client's nickname
	remote.getNick().onReady(function(result) {
		clients[conn.id].nick = result;
	});

	/*Separated for now. Affects multiplayer
	// Set client's selected character
	remote.getChar().onReady(function(result) {
		clients[conn.id].char = result;
		console.log(clients[conn.id].char);
	});*/
	
	// setID method in client side
	remote.setID(conn.id);			

	// test output
	connectedCount++;
	console.log('Client connected id=%s ', conn.id, conn.remoteAddress);
});

// Detect client disconnection
eurecaServer.onDisconnect(function(conn) {
	console.log('Client disconnected id=%s ', conn.id, conn.remoteAddress);
	connectedCount--;

	var removeID = clients[conn.id].id;

	// check if disconnected client is in a lobby
	if (clients[conn.id].lobbyID != '') {
		eurecaServer.exports.destroyRoomLink(clients[conn.id].lobbyID, conn.id);
	}

	delete clients[conn.id];

	for (var c in clients) {
		var remote = clients[c].remote;

		// Kill method in client side
		remote.kill(conn.id);
	}
});

// function to update player status in a lobby room
eurecaServer.exports.updateLobbyRoom = function(roomName) {
	// for every client in the lobby, update their lobby room info
	for (var id in lobbylist[roomName].clientInfo) { 
		var remote = lobbylist[roomName].clientInfo[id].remote;
		// Share clientinfo with all clients in the lobby
		remote.loadPlayersLR(
			lobbylist[roomName].clientInfo, 
			lobbylist[roomName].gameType, 
			lobbylist[roomName].maxPlayers, 
			lobbylist[roomName].host
		);
	}
}

// function to set client ready status on the server and to update the other clients in the room
eurecaServer.exports.setClientStatus = function(roomName, id) {
	clients[id].ready = !clients[id].ready;
	eurecaServer.exports.updateLobbyRoom(roomName);
}

// function to set client ready status on the server and to update the other clients in the room
eurecaServer.exports.setClientCharacter = function(id, character) {

	/* Separated for now. Affects multiplayer
	// Set client's selected character
	remote.getChar().onReady(function(result) {
		clients[conn.id].char = result;
		console.log(clients[conn.id].char);
	});*/
	clients[id].char = character;
}

// function to set client team value on the server and to update the other clients in the room
eurecaServer.exports.setClientTeam = function(roomName, id, team) {
	clients[id].team = team;
	eurecaServer.exports.updateLobbyRoom(roomName);
}

// function used for server side host determinination and correction
eurecaServer.exports.chooseHost = function(roomName) {
	var room = lobbylist[roomName];
	if (room.host == '') {
		// no host yet
		for (var user in room.clientInfo) {
			lobbylist[roomName].host = user;
		}
	} else {
		// correct room host
		if (room.clientInfo[room.host] == null) {
			// host id does not exist in room
			lobbylist[roomName].host = '';
			for (var user in room.clientInfo) {
				lobbylist[roomName].host = user;
			}
		}
	}
}

eurecaServer.exports.startGameTDM = function(roomName) {
	lobbylist[roomName].status = ' On-going'; // Update Lobby Status
	eurecaServer.exports.requestClientInfo(); // update all lobby clients
	// for every client in the lobby, start the game
	for (var id in lobbylist[roomName].clientInfo) { 
		var remote = lobbylist[roomName].clientInfo[id].remote;
		// initialize team deathmatch for all clients in lobby
		remote.gameStart();
	}
}

// function to add and update lobby information wtih connected player id
// REF: Each obj in clientInfo is a clients[conn.id]
eurecaServer.exports.establishRoomLink = function(roomName, id) {
	//console.log("Player: " + id + " connected to room " + roomName);
	clients[id].lobbyID = roomName; // update client lobby room status
	lobbylist[roomName].clientInfo[id] = clients[id]; // pass in the client object into clientInfo
	lobbylist[roomName].playerCount++;
	eurecaServer.exports.chooseHost(roomName);
	eurecaServer.exports.requestClientInfo(); // update all lobby clients
}

// function to remove and update lobby information wtih connected player id
eurecaServer.exports.destroyRoomLink = function(roomName, id) {
	//console.log("Player: " + id + " disconnected to room " + roomName);
	clients[id].lobbyID = ''; // update client lobby room status
	clients[id].team = null;
	clients[id].ready = false;
	delete lobbylist[roomName].clientInfo[id];
	lobbylist[roomName].playerCount--;
	eurecaServer.exports.chooseHost(roomName);
	eurecaServer.exports.requestClientInfo(); // update all lobby clients
}

// function to update public lobby status
eurecaServer.exports.requestClientInfo = function() {
	for (var c in clients) {
		var remote = clients[c].remote;
		remote.updateLobby(connectedCount, 
			lobbylist['publicLobby1'], 
			lobbylist['publicLobby2'], 
			lobbylist['publicLobby3'], 
			lobbylist['publicLobby4']
		);
	}
}

// function to validate if the client provided the correct credential
// to enter the lobby room
eurecaServer.exports.passwordCheck = function(name, pass) {
	if (lobbylist[name] != null) {
		if (lobbylist[name].password == pass) {
			return true;
		} else {
			return false;
		}
	} else {
		return false;
	}
}

eurecaServer.exports.handshake = function(room) {
	console.log('handshaking');
	for (var c in lobbylist[room].clientInfo) {
		var remote = lobbylist[room].clientInfo[c].remote;
		var test = lobbylist[room].clientInfo[c];
		for (var cc in lobbylist[room].clientInfo) {
			// Get starting position for every client
			var x = 0;
			var y = 0;
			if (lobbylist[room].clientInfo[cc].lastState != null) {
				x = lobbylist[room].clientInfo[cc].lastState.x;
				y = lobbylist[room].clientInfo[cc].lastState.y;
			}
			// Replicate enemy at position, along with selected character
			remote.spawnEnemy(lobbylist[room].clientInfo[cc].id, x, y, lobbylist[room].clientInfo[cc].char);
		}
	}
}

eurecaServer.exports.handleKeys = function(keys, room) {
	//console.log('handling');
	var conn = this.connection;
	var updatedClient = lobbylist[room].clientInfo[conn.id];

	// For each client, update last input
	for (var c in lobbylist[room].clientInfo) {
		// Update server side
		var remote = lobbylist[room].clientInfo[c].remote;
		remote.updateState(updatedClient.id, keys);

		// Key track of last state for spawning new players
		lobbylist[room].clientInfo[c].lastState = keys;
	}
}

eurecaServer.exports.compensate = function(keys, room) {
	// Compensate difference by interpolation
	var conn = this.connection;
	var updatedClient = lobbylist[room].clientInfo[conn.id];

	// For each client, update last input
	for (var c in lobbylist[room].clientInfo) {
		// Update server side
		var remote = lobbylist[room].clientInfo[c].remote;
		remote.compensate(updatedClient.id, keys);

		// Key track of last state for spawning new players
		lobbylist[room].clientInfo[c].lastState = keys;
	}
}

// Either listen to host port or 8000 if testing locally
server.listen(process.env.PORT || 8000);