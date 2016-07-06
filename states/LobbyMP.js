BasicGame.LobbyMulti = function (game) {
	this.myID = '';
	this.lobbyList;
};

BasicGame.LobbyMulti.prototype = {
	init: function() {
		// Add background in
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;
	},

	preload: function() {
		var ref = this;

		// connect to the eureca server client
		this.eurecaServer;
		this.eurecaClient = new Eureca.Client();
		this.eurecaClient.ready(function(proxy) {
			ref.eurecaServer = proxy;
			console.log('connecting to eureca');
		});

		this.eurecaClient.exports.setID = function(id) {
			//create() is moved here to make sure nothing is created before uniq id assignation
			ref.myID = id;
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
			ref.game.state.start("MainMenu", true);
		});
	},

	update: function () {
	},
}