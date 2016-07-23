BasicGame.LobbyRoom = function (game) {
	this.roomID = '';
	this.gameLeader = null;
	this.allReady = false;
	this.PlayerText = {};
	this.headerTextDefault = {font: '25pt myfont', align: 'center', stroke: 'rgba(0,0,0,255)', strokeThickness: 4, fill: "white"};
	this.headerTextGreen = {font: '25pt myfont', align: 'center', stroke: 'rgba(0,0,0,255)', strokeThickness: 4, fill: "#00FF00"};
	this.subText = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,255)', strokeThickness: 4, fill: "white"};
	this.subTextCyan = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,255)', strokeThickness: 4, fill: "cyan"}; 
	this.subTextGreen = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,255)', strokeThickness: 4, fill: "#00FF00"}; 

	this.readyOnOver =  function (target) {
		target.fill = "#00FF00";
		target.stroke = "rgba(255,255,255,255)";
	};
	this.readyOnOut =  function (target) {
		target.fill = "#00FF00";
		target.stroke = "rgba(0,0,0,255)";
	};
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

		BasicGame.eurecaClient.exports.gameStart = function() {
			BasicGame.roomID = ref.roomID;
			ref.game.state.start('CharSelect', true, false, true);
		}

		// function to load all players info obtained from server.js
		BasicGame.eurecaClient.exports.loadPlayersLR = function(playerList, gametype, maxplayers, roomHost) {
			var t1Counter = 0;
			var t2Counter = 0;
			var plCounter = 0;
			var readyCheck = true;
			ref.gameLeader = roomHost;
			ref.clearPlayerText();

			if (gametype == 'TDM') { // Team death math game settings
				// Load player teams
				for (var id in playerList) {
					var player = playerList[id];
					var displayNick = (player.nick.length > 16) ? player.nick.substring(0,10) + '...' : player.nick;
					var nickColor = (BasicGame.myID == player.id) ? ref.subTextCyan : (player.ready ? ref.subTextGreen : ref.subText);

					if (!player.ready) { 
						readyCheck = false; // not everyone is ready
					}

					// Print player nicknames on lobby
					if (player.team == null) {
						// current player has no team = player List
						ref.PlayerText[id] = ref.add.text(ref.game.width - 350, 200 + (plCounter * 25),  displayNick, nickColor);
						plCounter++;
					} else if (player.team == 1) {
						// current player belongs to team A
						ref.PlayerText[id] = ref.add.text(ref.game.width/6 - 80, 200 + (t1Counter * 25),  displayNick, nickColor);
						t1Counter++;
					} else if (player.team == 2) {
						// current player belongs to team B
						ref.PlayerText[id] = ref.add.text(ref.game.width/6 + 320, 200 + (t2Counter * 25),  displayNick, nickColor);
						t2Counter++;
					}
				}

				ref.allReady = readyCheck;

				// load game info
				ref.PlayerText["gameHostTxt"] = ref.add.text(ref.game.width/2.5, ref.game.height/7 * 5 - 80,  'Game Host : ' + playerList[ref.gameLeader].nick, ref.headerTextDefault);
				ref.PlayerText["gameTypeTxt"] = ref.add.text(ref.game.width/10, ref.game.height/7 * 5 - 80,  'Game Mode : ' + gametype, ref.headerTextDefault);

				// Add Headers and buttons
				ref.PlayerText["headerTeamA"] = ref.add.text(ref.game.width/7.9, 150,  "Team A", ref.headerTextDefault);
				ref.PlayerText["headerTeamB"] = ref.add.text(ref.game.width/2.27, 150,  "Team B", ref.headerTextDefault);
				ref.PlayerText["headerPL"] = ref.add.text(ref.game.width/6 * 4.4, 150,  "Player List", ref.headerTextDefault);

				// Header Team A
				ref.PlayerText['headerTeamA'].inputEnabled = !playerList[BasicGame.myID].ready;
				ref.PlayerText['headerTeamA'].events.onInputOver.add(BasicGame.onOver);
				ref.PlayerText['headerTeamA'].events.onInputOut.add(BasicGame.onOut);
				ref.PlayerText['headerTeamA'].events.onInputDown.add(BasicGame.onDown);
				ref.PlayerText['headerTeamA'].events.onInputUp.add(function() {
					BasicGame.myTeam = 1;
					BasicGame.eurecaServer.setClientTeam(ref.roomID, BasicGame.myID, 1);
				});

				// Header Team B
				ref.PlayerText['headerTeamB'].inputEnabled = !playerList[BasicGame.myID].ready;
				ref.PlayerText['headerTeamB'].events.onInputOver.add(BasicGame.onOver);
				ref.PlayerText['headerTeamB'].events.onInputOut.add(BasicGame.onOut);
				ref.PlayerText['headerTeamB'].events.onInputDown.add(BasicGame.onDown);
				ref.PlayerText['headerTeamB'].events.onInputUp.add(function() {
					BasicGame.myTeam = 2;
					BasicGame.eurecaServer.setClientTeam(ref.roomID, BasicGame.myID, 2);
				});

				// Header  Player List
				ref.PlayerText['headerPL'].inputEnabled = !playerList[BasicGame.myID].ready;
				ref.PlayerText['headerPL'].events.onInputOver.add(BasicGame.onOver);
				ref.PlayerText['headerPL'].events.onInputOut.add(BasicGame.onOut);
				ref.PlayerText['headerPL'].events.onInputDown.add(BasicGame.onDown);
				ref.PlayerText['headerPL'].events.onInputUp.add(function() {
					BasicGame.myTeam = null;
					BasicGame.eurecaServer.setClientTeam(ref.roomID, BasicGame.myID, null);
				});

				// load ready button
				if (playerList[BasicGame.myID].team != null) {
					// player has selected a team, show option to let player ready
					if (playerList[BasicGame.myID].ready) {
						// Player has announced they are ready
						ref.PlayerText["readyButton"] = ref.add.text(ref.game.width/10 * 7 + 20, ref.game.height/7 * 6,  'READY!', ref.headerTextGreen);
						ref.PlayerText["readyButton"].events.onInputOver.add(ref.readyOnOver);
						ref.PlayerText['readyButton'].events.onInputDown.add(BasicGame.onDown);
						ref.PlayerText["readyButton"].events.onInputOut.add(ref.readyOnOut);

						// Status message
						if (ref.allReady) {
							if (ref.gameLeader == BasicGame.myID) {
								// you are the host, choose when to start game
								ref.PlayerText["status"] = ref.add.text(ref.game.width/10 * 7 - 50, ref.game.height - 50,  'Start game when you are ready...', ref.subText);

								// START GAME BUTTON
								ref.PlayerText["startButton"] = ref.add.text(ref.game.width/10 * 7 + 170, ref.game.height/7 * 6,  'START', ref.headerTextGreen);
								ref.PlayerText["startButton"].events.onInputOver.add(ref.readyOnOver);
								ref.PlayerText['startButton'].events.onInputDown.add(BasicGame.onDown);
								ref.PlayerText["startButton"].events.onInputOut.add(ref.readyOnOut);
								ref.PlayerText["startButton"].inputEnabled = true;
								ref.PlayerText["startButton"].events.onInputUp.add(function() {
									// START GAME
									BasicGame.eurecaServer.startGameTDM(ref.roomID);
								});
							} else {
								// waiting for host to start game
								ref.PlayerText["status"] = ref.add.text(ref.game.width/10 * 7 - 50, ref.game.height - 50,  'Waiting for host to start game...', ref.subText);
							}
						} else {
							// not all player has announced they are ready
							ref.PlayerText["status"] = ref.add.text(ref.game.width/10 * 7 - 50, ref.game.height - 50,  'Waiting for all players to ready...', ref.subText);
						}
					} else {
						// Player has not announced they are ready, give ready button
						ref.PlayerText["readyButton"] = ref.add.text(ref.game.width/10 * 7 + 20, ref.game.height/7 * 6,  'READY!', ref.headerTextDefault);
						ref.PlayerText["readyButton"].events.onInputOver.add(ref.readyOnOver);
						ref.PlayerText['readyButton'].events.onInputDown.add(BasicGame.onDown);
						ref.PlayerText["readyButton"].events.onInputOut.add(BasicGame.onOut);
					}
					ref.PlayerText["readyButton"].inputEnabled = true;
					ref.PlayerText["readyButton"].events.onInputUp.add(function() {
						// READY!
						BasicGame.eurecaServer.setClientStatus(ref.roomID, BasicGame.myID);
					});
				} else {
					// Player has not select a team, ask player to choose team
					ref.PlayerText["readyButton"] = ref.add.text(ref.game.width/10 * 7, ref.game.height/7 * 6,  'Choose a team', ref.headerTextDefault);
				}
			} else {
				// unknown game mode
				// ADD NEW GAME MODE HERE!
			}
		};
	},

	create: function () {
		var ref = this;
	},

	update: function () {
		var ref = this;
	},

	clearPlayerText: function () {
		var ref = this;
		for (var idx in ref.PlayerText) {
			//console.log(idx);
			//console.log(ref.PlayerText);
			ref.PlayerText[idx].destroy();
		}
		ref.PlayerText = {};
	},

	loadRoom: function () {
		var ref = this;

		// Add background in
		this.background = ref.add.sprite(0, 0, 'menu_background');
		this.background.height = ref.game.height;
		this.background.width = ref.game.width;

		this.add.image(10, 80, 'lobby_big_panel');
		this.add.image(70, 150, 'lobby_team_panel');
		this.add.image(470, 150, 'lobby_team_panel');
		this.add.image(870, 150, 'lobby_team_panel');
		this.add.image(900, 600, 'hero_name');

		// Add Lobby name
		this.LobbyName = this.add.text(50, 20, this.roomID, {font: "40pt myfont", fill: 'white', align: 'right'});

		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,255)', strokeThickness: 4, fill: "white"};

		// Add back button
		this.returnMenu = this.add.text(this.game.width - this.game.width/1.08, this.game.height - 100,  "Back to Main Menu", optionStyle);
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);
		this.returnMenu.events.onInputDown.add(BasicGame.onDown);
		
		// Back button clicked
		this.returnMenu.events.onInputUp.add(function() {
			console.log('disconnected from eureca');
			BasicGame.eurecaServer.destroyRoomLink(ref.roomID, BasicGame.myID); // destroy connection
			BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update the rest of the clients after connection is destroyed
			BasicGame.eurecaClient.disconnect(); // request server to disconnect client
			BasicGame.disconnectClient(); // adjust client to reset connection variable
			ref.game.state.start("MainMenu", true);
		});

		// Add return lobby button
		this.returnLobby = this.add.text(this.game.width - this.game.width/1.08, this.game.height - 135,  "Back to Lobby", optionStyle);
		this.returnLobby.inputEnabled = true;
		this.returnLobby.events.onInputOver.add(BasicGame.onOver);
		this.returnLobby.events.onInputOut.add(BasicGame.onOut);
		this.returnLobby.events.onInputDown.add(BasicGame.onDown);
		
		// return lobby button clicked
		this.returnLobby.events.onInputUp.add(function() {
			BasicGame.eurecaServer.destroyRoomLink(ref.roomID, BasicGame.myID); // destroy connection
			BasicGame.eurecaServer.updateLobbyRoom(ref.roomID); // update the rest of the clients after connection is destroyed
			ref.game.state.start("LobbyMulti", true);
		});
	},
};