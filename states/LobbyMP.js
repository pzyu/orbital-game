BasicGame.LobbyMulti = function (game) {
	this,playerNick = '';
	this.myID = '';
	this.lobbyList;
	this.eurecaServer;
	this.eurecaClient;

	// labels
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
		this.ready = false;

		// connect to the eureca server client
		this.eurecaClientSetup = function() {
			ref.eurecaClient = new Eureca.Client();
			ref.eurecaClient.ready(function(proxy) {
				ref.eurecaServer = proxy;
				console.log('connected to eureca');
			});
		}
		this.eurecaClientSetup(); // establish connection to eureca server
		this.preloadLobby(); // preload lobby

		/* server.js communication functions */
		this.eurecaClient.exports.setID = function(id) {
			//create() is moved here to make sure nothing is created before uniq id assignation
			ref.myID = id;
			this.ready = true; // information transfer complete
			console.log("LOADING LOBBY");
			ref.LoadLobby(); // load lobby information
		}

		this.eurecaClient.exports.getNick = function() {
			// Return player's selected character
			return ref.playerNick;
		}

		this.eurecaClient.exports.kill = function(id) {	
			ref.LoadLobby(); // update client side disconnect
		}

		this.eurecaClient.exports.updateLobby = function(totalPlayer, lobby1, lobby2, lobby3, lobby4) {
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

			//remote.updateLobby(connectedCount, lobbylist['publicLobby1'], lobbylist['publicLobby2'], lobbylist['publicLobby3'], lobbylist['publicLobby4'])
		}	
	},

	create: function () {
		var ref = this;

		// Add back button
		this.returnMenu = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 100,  "Back", optionStyle);
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);

		// Back button clicked
		this.returnMenu.events.onInputUp.add(function() {
			console.log('disconnected from eureca');
			ref.eurecaClient.disconnect();
			ref.myID = '';
			ref.game.state.start("MainMenu", true);
		});
	},

	update: function () {
		if (!this.ready) return;
	},

	preloadLobby: function () {
		console.log("PRELOADING LOBBY");
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
		this.playerStatus = this.add.text(30, 450,  "Total Online Players :", lobbyFixedText1);
	},

	LoadLobby: function () {
		this.eurecaServer.requestClientInfo();
	}
}