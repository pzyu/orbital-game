BasicGame.LobbyMulti = function (game) {
	this.myID = '';
	this.playerList;
};

BasicGame.LobbyMulti.prototype = {
	preload: function() {
		var ref = this;

		// Add background in
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;

		this.eurecaServer;
		this.eurecaClient = new Eureca.Client();
		this.eurecaClient.ready(function(proxy) {
			ref.eurecaServer = proxy;
			console.log('asd');
		});

		this.eurecaClient.exports.setID = function(id) {
			//create() is moved here to make sure nothing is created before uniq id assignation
			ref.myID = id;
			// Create game here
			// Handshake with server to replicate other players
			ref.eurecaServer.handshake();
			ref.ready = true;
		}

	},

	create: function () {

	},

	update: function () {
	},
}