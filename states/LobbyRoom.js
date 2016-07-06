BasicGame.LobbyRoom = function (game) {
	this.roomID = '';
};

BasicGame.LobbyRoom.prototype = {
	init: function(roomName, pass) {
		var ref = this;
		// Validate Room credentials
		BasicGame.eurecaServer.passwordCheck(roomName, pass).onReady(function(result) {
			if (result) {
				// valid credentials, continue loading room info

				ref.loadRoom();
			} else {
				// wrong credentials, kick to lobby
				ref.game.state.start("LobbyMulti", true);
			}
		});
	},

	preload: function() {
		// variable delcaration
		var ref = this;
	},

	create: function () {
		var ref = this;
	},

	update: function () {
		// nothing at all
	},

	loadRoom: function () {
		var ref = this;

		// Add background in
		ref.background = ref.add.sprite(0, 0, 'menu_background');
		ref.background.height = ref.game.height;
		ref.background.width = ref.game.width;
		// add player nick
		ref.roomID = roomName;

		// Test welcome Message
		ref.add.text(20, ref.world.height/2,  "If u see this message, means u have entered a lobby room", optionStyle);

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

		// Add lobby button
		this.returnLobby = this.add.text(this.world.width - this.world.width/1.08, this.world.height - 135,  "Back to Lobby", optionStyle);
		this.returnLobby.inputEnabled = true;
		this.returnLobby.events.onInputOver.add(BasicGame.onOver);
		this.returnLobby.events.onInputOut.add(BasicGame.onOut);
		
		// lobby button clicked
		this.returnLobby.events.onInputUp.add(function() {
			ref.game.state.start("LobbyMulti", true);
		});
	},
}