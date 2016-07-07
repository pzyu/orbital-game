BasicGame.LobbyRoom = function (game) {
	this.roomID = '';
	this.PlayerText = [];
	this.headerTextDefault = {font: '25pt myfont', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
	this.subText = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,0)', strokeThickness: 2, fill: "white"};
	this.subTextCyan = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,0)', strokeThickness: 2, fill: "cyan"}; 
};

BasicGame.LobbyRoom.prototype = {
	init: function(roomName, pass) {
		var ref = this;
		// Validate Room credentials
		BasicGame.eurecaServer.passwordCheck(roomName, pass).onReady(function(result) {
			if (result) {
				// valid credentials, continue loading room info
				ref.roomID = roomName;

				// establish connection to the room
				BasicGame.eurecaServer.establishRoomLink(roomName, BasicGame.myID);
				// load basic layout of room
				ref.loadRoom();

				// retrieve room info
				BasicGame.eurecaServer.updateLobbyRoom(roomName);
			} else {
				// wrong credentials, kick to lobby
				ref.game.state.start("LobbyMulti", true);
			}
		});
	},

	preload: function() {
		// variable delcaration
		var ref = this;

		BasicGame.eurecaClient.exports.kill = function(id) {	
			BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update client side disconnect
		}

		// function to load all players info obtained from server.js
		BasicGame.eurecaClient.exports.loadPlayersLR = function(playerList) {
			var t1Counter = 0;
			var t2Counter = 0;
			var plCounter = 0;
			ref.clearPlayerText();

			for (var id in playerList) {
				var player = playerList[id];
				var displayNick = (player.nick.length > 16) ? player.nick.substring(0,12) + '...' : player.nick;

				if (player.position == null) {
					// current player has no team
					if (BasicGame.myID == player.id) {
						ref.PlayerText[ref.PlayerText.length] = ref.add.text(ref.world.width/6 * 4.5 + 10, 100 + (plCounter * 25),  displayNick, ref.subTextCyan);
					} else {
						ref.PlayerText[ref.PlayerText.length] = ref.add.text(ref.world.width/6 * 4.5 + 10, 100 + (plCounter * 25),  displayNick, ref.subText);
					}
					plCounter++;
				} else {
					// do nothing
				}
			}
		};
	},

	create: function () {
		var ref = this;
	},

	update: function () {
		// nothing at all
	},

	clearPlayerText: function () {
		var ref = this;
		for (var i=0; i<ref.PlayerText.length; i++) {
			ref.PlayerText[i].destroy();
		}
		ref.PlayerText = [];
	},

	loadRoom: function () {
		var ref = this;

		// Add background in
		this.background = ref.add.sprite(0, 0, 'menu_background');
		this.background.height = ref.game.height;
		this.background.width = ref.game.width;

		// Add Lobby name
		this.LobbyName = this.add.text(50, 30, this.roomID, {font: "40pt myfont", fill: 'white', align: 'right'});

		// Add Headers
		this.add.text(this.world.width/6, 120,  "Team A", this.headerTextDefault);
		this.add.text(this.world.width/2, 120,  "Team B", this.headerTextDefault);
		this.add.text(this.world.width/6 * 4.5, 50,  "Player List", this.headerTextDefault);

		// Add back button
		this.returnMenu = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 100,  "Back to Main Menu", optionStyle);
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);
		
		// Back button clicked
		this.returnMenu.events.onInputUp.add(function() {
			console.log('disconnected from eureca');
			BasicGame.eurecaServer.destroyRoomLink(ref.roomID, BasicGame.myID); // destroy connection
			BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update the rest of the clients after connection is destroyed
			BasicGame.eurecaClient.disconnect(); // request server to disconnect client
			BasicGame.disconnectClient(); // adjust client to reset connection variable
			ref.game.state.start("MainMenu", true);
		});

		// Add lobby button
		this.returnLobby = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 135,  "Back to Lobby", optionStyle);
		this.returnLobby.inputEnabled = true;
		this.returnLobby.events.onInputOver.add(BasicGame.onOver);
		this.returnLobby.events.onInputOut.add(BasicGame.onOut);
		
		// lobby button clicked
		this.returnLobby.events.onInputUp.add(function() {
			BasicGame.eurecaServer.destroyRoomLink(ref.roomID, BasicGame.myID); // destroy connection
			BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update the rest of the clients after connection is destroyed
			ref.game.state.start("LobbyMulti", true);
		});
	},
};