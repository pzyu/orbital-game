BasicGame.LobbyMulti = function (game) {
	this,playerNick = '';
	this.lobbyList;

	// labels initialization
	this.L1GameTxt;
	this.L1CurrPlayersTxt;
	this.L1MaxPlayersTxt;
	this.L1StatusTxt;
	this.L2GameTxt;
	this.L2CurrPlayersTxt;
	this.L2MaxPlayersTxt;
	this.L2StatusTxt;
	this.L3GameTxt;
	this.L3CurrPlayersTxt;
	this.L3MaxPlayersTxt;
	this.L3StatusTxt;
	this.L4GameTxt;
	this.L4CurrPlayersTxt;
	this.L4MaxPlayersTxt;
	this.L4StatusTxt;
	this.playerStatus;
	this.joinLobby1;
	this.joinLobby2;
	this.joinLobby3;
	this.joinLobby4;
};

BasicGame.LobbyMulti.prototype = {
	init: function(nickname) {
		// Add background in
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;

		// add player nick
		this.playerNick = nickname;
	},

	preload: function() {
		// variable delcaration
		var ref = this;

		// connect to the eureca server client
		this.eurecaClientSetup = function() {
			BasicGame.eurecaClient = new Eureca.Client();
			BasicGame.eurecaClient.ready(function(proxy) {
				BasicGame.eurecaServer = proxy;
				console.log('connected to eureca');
			});
		}
		if (BasicGame.eurecaClient == null && BasicGame.eurecaServer == null) {
			this.eurecaClientSetup(); // establish connection to eureca server
		} else {
			// connection is already establish. Load info
			ref.LoadLobby(); // load lobby information
			/* 
			IMPORTANT!
			When you enter this else statement, highly likely is because
			the password entered is wrong!

			Future additions : Fail message to entering lobby!
			 */
		}
		this.preloadLobby(); // preload lobby

		/* server.js communication functions */
		BasicGame.eurecaClient.exports.setID = function(id) {
			//create() is moved here to make sure nothing is created before uniq id assignation
			BasicGame.myID = id;
			ref.LoadLobby(); // load lobby information
		}

		BasicGame.eurecaClient.exports.getNick = function() {
			// Return player's selected character
			return ref.playerNick;
		}

		BasicGame.eurecaClient.exports.kill = function(id) {	
			ref.LoadLobby(); // update client side disconnect
		}

		BasicGame.eurecaClient.exports.updateLobby = function(totalPlayer, lobby1, lobby2, lobby3, lobby4) {
			// Update lobby text status
			ref.L1GameTxt.setText(lobby1.gameType);
			ref.L1CurrPlayersTxt.setText(lobby1.playerCount);
			ref.L1MaxPlayersTxt.setText(lobby1.maxPlayers);
			ref.L1StatusTxt.setText(lobby1.status);
			ref.L2GameTxt.setText(lobby2.gameType);
			ref.L2CurrPlayersTxt.setText(lobby2.playerCount);
			ref.L2MaxPlayersTxt.setText(lobby2.maxPlayers);
			ref.L2StatusTxt.setText(lobby2.status);
			ref.L3GameTxt.setText(lobby3.gameType);
			ref.L3CurrPlayersTxt.setText(lobby3.playerCount);
			ref.L3MaxPlayersTxt.setText(lobby3.maxPlayers);
			ref.L3StatusTxt.setText(lobby3.status);
			ref.L4GameTxt.setText(lobby4.gameType);
			ref.L4CurrPlayersTxt.setText(lobby4.playerCount);
			ref.L4MaxPlayersTxt.setText(lobby4.maxPlayers);
			ref.L4StatusTxt.setText(lobby4.status);
			ref.playerStatus.setText('Total Online Players : ' + totalPlayer);

			// Add join button to lobby
			(lobby1.status == 'Open Host' && lobby1.playerCount < lobby1.maxPlayers) ? ref.joinLobby1.visible = true : ref.joinLobby1.visible = false;
			(lobby2.status == 'Open Host' && lobby2.playerCount < lobby2.maxPlayers) ? ref.joinLobby2.visible = true : ref.joinLobby2.visible = false;
			(lobby3.status == 'Open Host' && lobby3.playerCount < lobby3.maxPlayers) ? ref.joinLobby3.visible = true : ref.joinLobby3.visible = false;
			(lobby4.status == 'Open Host' && lobby4.playerCount < lobby4.maxPlayers) ? ref.joinLobby4.visible = true : ref.joinLobby4.visible = false;
		}	
	},

	create: function () {
		var ref = this;

		// Add back button
		this.returnMenu = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 100,  "Back to Main Menu", optionStyle);
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);

		// Back button clicked
		this.returnMenu.events.onInputUp.add(function() {
			console.log('disconnected from eureca');
			BasicGame.eurecaClient.disconnect(); // server to disconnect client
			BasicGame.disconnectClient(); // client to reset connection variable
			ref.game.state.start("MainMenu", true);
		});
	},

	update: function () {
		// nothing at all
	},

	preloadLobby: function () {
		// constant variables declaration
		var lobbyFixedText1 = {font: '25pt myfont', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		var lobbyOptionText1 = {font: '14pt myfont', align: 'center', stroke: 'rgba(0,10,0,0)', strokeThickness: 2, fill: "white"};

		// Fixed labels
		this.add.text((this.world.width/5 * 1), 100,  "Lobby1", lobbyFixedText1);
		this.add.text((this.world.width/5 * 2), 100,  "Lobby2", lobbyFixedText1);
		this.add.text((this.world.width/5 * 3), 100,  "Lobby3", lobbyFixedText1);
		this.add.text((this.world.width/5 * 4), 100,  "Lobby4", lobbyFixedText1);
		this.add.text(30, 180,  "Game :", lobbyOptionText1);
		this.add.text(30, 230,  "Current Players :", lobbyOptionText1);
		this.add.text(30, 280,  "Max Players :", lobbyOptionText1);
		this.add.text(30, 330,  "Status :", lobbyOptionText1);

		// Updating labels
		// Lobby 1
		this.L1GameTxt = this.add.text((this.world.width/5 * 1) - 35, 180,  '', lobbyOptionText1);
		this.L1CurrPlayersTxt = this.add.text((this.world.width/5 * 1) + 55, 230,  '', lobbyOptionText1);
		this.L1MaxPlayersTxt = this.add.text((this.world.width/5 * 1) + 55, 280,  '', lobbyOptionText1);
		this.L1StatusTxt = this.add.text((this.world.width/5 * 1) + 10, 330,  '', lobbyOptionText1);
		// Lobby 2
		this.L2GameTxt = this.add.text((this.world.width/5 * 2) - 35, 180,  '', lobbyOptionText1);
		this.L2CurrPlayersTxt = this.add.text((this.world.width/5 * 2) + 55, 230,  '', lobbyOptionText1);
		this.L2MaxPlayersTxt = this.add.text((this.world.width/5 * 2) + 55, 280,  '', lobbyOptionText1);
		this.L2StatusTxt = this.add.text((this.world.width/5 * 2) + 10, 330,  '', lobbyOptionText1);
		// Lobby 3
		this.L3GameTxt = this.add.text((this.world.width/5 * 3) - 35, 180,  '', lobbyOptionText1);
		this.L3CurrPlayersTxt = this.add.text((this.world.width/5 * 3) + 55, 230,  '', lobbyOptionText1);
		this.L3MaxPlayersTxt = this.add.text((this.world.width/5 * 3) + 55, 280,  '', lobbyOptionText1);
		this.L3StatusTxt = this.add.text((this.world.width/5 * 3) + 10, 330,  '', lobbyOptionText1);
		// Lobby 4
		this.L4GameTxt = this.add.text((this.world.width/5 * 4) - 35, 180,  '', lobbyOptionText1);
		this.L4CurrPlayersTxt = this.add.text((this.world.width/5 * 4) + 55, 230,  '', lobbyOptionText1);
		this.L4MaxPlayersTxt = this.add.text((this.world.width/5 * 4) + 55, 280,  '', lobbyOptionText1);
		this.L4StatusTxt = this.add.text((this.world.width/5 * 4) + 10, 330,  '', lobbyOptionText1);
		// total players
		this.playerStatus = this.add.text(30, 450,  "Total Online Players : NOT ONLINE! Check your connection!", lobbyFixedText1);

		// Join lobby buttons
		this.joinLobby1 = this.add.text((this.world.width/5 * 1) + 20, 380,  "Join", lobbyFixedText1);
		this.joinLobby2 = this.add.text((this.world.width/5 * 2) + 20, 380,  "Join", lobbyFixedText1);
		this.joinLobby3 = this.add.text((this.world.width/5 * 3) + 20, 380,  "Join", lobbyFixedText1);
		this.joinLobby4 = this.add.text((this.world.width/5 * 4) + 20, 380,  "Join", lobbyFixedText1);

		this.joinLobby1.visible = false;
		this.joinLobby2.visible = false;
		this.joinLobby3.visible = false;
		this.joinLobby4.visible = false;

		this.joinLobby1.inputEnabled = true;
		this.joinLobby2.inputEnabled = true;
		this.joinLobby3.inputEnabled = true;
		this.joinLobby4.inputEnabled = true;
		this.joinLobby1.events.onInputOver.add(BasicGame.onOver);
		this.joinLobby1.events.onInputOut.add(BasicGame.onOut);
		this.joinLobby2.events.onInputOver.add(BasicGame.onOver);
		this.joinLobby2.events.onInputOut.add(BasicGame.onOut);
		this.joinLobby3.events.onInputOver.add(BasicGame.onOver);
		this.joinLobby3.events.onInputOut.add(BasicGame.onOut);
		this.joinLobby4.events.onInputOver.add(BasicGame.onOver);
		this.joinLobby4.events.onInputOut.add(BasicGame.onOut);

		this.joinLobby1.events.onInputUp.add(function() {
			this.game.state.start('LobbyRoom', true, false, 'publicLobby1', '');
		});
		this.joinLobby2.events.onInputUp.add(function() {
			this.game.state.start('LobbyRoom', true, false, 'publicLobby2', '');
		});
		this.joinLobby3.events.onInputUp.add(function() {
			this.game.state.start('LobbyRoom', true, false, 'publicLobby3', '');
		});
		this.joinLobby4.events.onInputUp.add(function() {
			this.game.state.start('LobbyRoom', true, false, 'publicLobby4', '');
		});
	},

	LoadLobby: function () {
		BasicGame.eurecaServer.requestClientInfo();
	}
}