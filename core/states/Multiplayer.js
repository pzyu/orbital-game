BasicGame.Multiplayer = function (game) {
	this.playerList;
	this.myID = '';
};

BasicGame.Multiplayer.prototype.init = function() {
};

BasicGame.Multiplayer.prototype.preload = function() {
	this.ready = false;
	this.eurecaServer;
	this.eurecaClient;
	var ref = this;

	this.eurecaClientSetup = function() {
		this.eurecaClient = new Eureca.Client();

		this.eurecaClient.ready(function(proxy) {
			ref.eurecaServer = proxy;
			ready = true;
		});
	}

	this.eurecaClientSetup();

	this.eurecaClient.exports.setID = function(id) {
		//create() is moved here to make sure nothing is created before uniq id assignation
		ref.myID = id;
		console.log('create id ' + ref.myID);
		ref.createMenu();
		ref.eurecaServer.handshake();
		ready = true;
	}

	this.eurecaClient.exports.kill = function(id) {	
		if (ref.playerList[id]) {
			ref.playerList[id].kill();
			console.log('killing ', id, ref.playerList[id]);
		}
	}	

	this.eurecaClient.exports.spawnEnemy = function(i, x, y) {
		if (i == ref.myID) return; //this is me
		
		console.log('SPAWN');
		var player = new BasicGame.HeroTrooperMP(i, ref.game);
		ref.playerList[i] = player;
	}

	this.eurecaClient.exports.updateState = function(id, state) {
		if (ref.playerList[id]) {
			ref.playerList[id].cursor = state;
			ref.playerList[id].update();
		}
	}

};

BasicGame.Multiplayer.prototype.createMenu = function() {
	console.log('create');
	var ref = this;
	var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
	var txt = this.add.text(this.world.width - this.world.width/2, this.world.height - 100,  "Back to main menu", optionStyle);
	txt.inputEnabled = true;
	txt.events.onInputUp.add(function() {
		this.game.state.start("MainMenu");
		ref.eurecaClient.disconnect();
		//console.log(this.eurecaClient);
	});

	this.playerList = {};

	var player = new BasicGame.HeroTrooperMP(this.myID, this.game);
	this.playerList[this.myID] = player;

	this.game.camera.follow(player);
};

BasicGame.Multiplayer.prototype.update = function() {
	if (!this.ready) return;
};

BasicGame.Multiplayer.prototype.getID = function() {
	return this.myID;
};