BasicGame.winTDM = function (game) {
	this.controlStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 400, align: 'left'};
	this.optionStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
};

BasicGame.winTDM.prototype = {
	init: function() {
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;
	},

	// On over style
	onOver: function(target) {

	},
 
	// On out style
	onOut: function (target) {

	},

	// On click
	onClick: function (target) {

	},

	preload: function() {
		var ref = this;

		// Add return to menu button
		this.returnMenu = this.add.text(this.game.width / 2 + 200, this.game.height - 100,  "Back to Main Menu", ref.controlStyle);
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);

		// Back button clicked
		this.returnMenu.events.onInputUp.add(function() {
			BasicGame.eurecaClient.disconnect(); // disconnect user completely from server
			BasicGame.disconnectClient(); // adjust client to reset connection variable
			ref.game.state.start("MainMenu", true);
		});
		
		// Add return lobby button
		this.returnLobby = this.add.text(this.game.width / 2 + 200, this.game.height - 135,  "Back to Lobby", ref.controlStyle);
		this.returnLobby.inputEnabled = true;
		this.returnLobby.events.onInputOver.add(BasicGame.onOver);
		this.returnLobby.events.onInputOut.add(BasicGame.onOut);

		// return lobby button clicked
		this.returnLobby.events.onInputUp.add(function() {
			ref.game.state.start("LobbyMulti", true);
		});
		

		// auto disconnection from the lobby
		console.log("disconnecting...");
		BasicGame.eurecaServer.destroyRoomLink(BasicGame.roomID, BasicGame.myID); // add this line after retrieval of info from server

	},

	create: function() {
	},

	update: function() {
	}
};