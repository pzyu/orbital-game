BasicGame.Multiplayer = function (game) {
	this.playerList;					// Player list
	this.myID = '';						// Client ID
	this.selectedChar = '';				// Selected character

	this.gravity = 5000;				// Gravity
	this.spawnX = 100;					// Starting spawn
	this.spawnY = 1000;

	this.timeStep = 1000;				// Time step for interpolation
	this.delta = 5;						// Delta for smoothing
};

BasicGame.Multiplayer.prototype.init = function() {
};

BasicGame.Multiplayer.prototype.preload = function() {
	this.ready = false;
	this.eurecaServer;
	this.eurecaClient;
	var ref = this;

	this.eurecaClientSetup = function() {
		// Setup client
		this.eurecaClient = new Eureca.Client();

		this.eurecaClient.ready(function(proxy) {
			ref.eurecaServer = proxy;
			ref.ready = true;
		});
	}

	this.eurecaClientSetup();

	this.eurecaClient.exports.setID = function(id) {
		//create() is moved here to make sure nothing is created before uniq id assignation
		ref.myID = id;
		// Create game here
		ref.createGame();
		// Handshake with server to replicate other players
		ref.eurecaServer.handshake();
		ref.ready = true;
	}

	this.eurecaClient.exports.kill = function(id) {	
		if (ref.playerList[id]) {
			ref.playerList[id].kill();
			console.log('killing ', id, ref.playerList[id]);
		}
	}	

	this.eurecaClient.exports.spawnEnemy = function(i, x, y, char) {
		// If it's me
		if (i == ref.myID) return;

		// Spawn enemy at location
		var curX = x;
		var curY = y;
		if (x == 0 || y == 0) {
			curX = ref.spawnX;
			curY = ref.spawnY;
		}
		console.log('Spawning', i, curX, curY, char);

		// If doesn't already exist
		if (ref.playerList[i] == null) {
			if (char == "player_trooper") {
				var player = new BasicGame.HeroTrooperMP(i, ref.game, curX, curY);
			} 
			if (char == "player_walker") {
				var player = new BasicGame.HeroWalkerMP(i, ref.game, curX, curY);
			}
			if (char == "player_destroyer") {
				var player = new BasicGame.HeroDestroyerMP(i, ref.game, curX, curY);
			}
			if (char == "player_gunner") {
				var player = new BasicGame.HeroGunnerMP(i, ref.game, curX, curY);
			}
			ref.playerList[i] = player;
		}
		// Every time you add a player, sort the group so local client is always on top
		BasicGame.playerCG.sort('z', Phaser.Group.SORT_DESCENDING);
	}

	this.eurecaClient.exports.updateState = function(id, state) {
		var curPlayer = ref.playerList[id];
		if (curPlayer && this.myID != id) {
			// Update player's cursor with state
			curPlayer.cursor = state;
			curPlayer.update();
		}
	}

	this.eurecaClient.exports.compensate = function(id, state) {
		var curPlayer = ref.playerList[id];
		if (curPlayer && this.myID != id) {
			//console.log('compensating');
			//curPlayer.x = state.x;
			//curPlayer.y = state.y;
			curPlayer.interpolateTo(state.x, state.y, 1000);
		}
	};

	this.eurecaClient.exports.getChar = function() {
		// Return player's selected character
		return BasicGame.selectedChar;
	}

	this.preloadGame();
};

BasicGame.Multiplayer.prototype.preloadGame = function() {
	this.physics.startSystem(Phaser.Physics.ARCADE);
	this.physics.arcade.gravity.y = this.gravity;

	// Set background color
	this.stage.backgroundColor = '#787878';

	// Add tilemap
	map = this.add.tilemap('map');					// 'map' must be same as the one in Boot.js
	map.addTilesetImage('sheet', 'tiles');			// 'sheet' must be the same also
	map.addTilesetImage('building_sheet', 'background_tiles');
	map.addTilesetImage('tiles_spritesheet', 'tiles_spritesheet');

	var background = map.createLayer('Background');	// 'Background' must be the same in the json file
	background.resizeWorld();
	background.wrap = true;

	layer = map.createLayer('Level 1');				// 'Level 1' must be the same in the json file
	layer.resizeWorld();
	layer.wrap = true;

	map.setCollisionBetween(0, 60, true, layer);	// Set collision layers between json tile representation
	map.setCollisionBetween(63, 99, true, layer);	
	map.setCollisionBetween(329, 341, true, layer);	

	this.physics.arcade.TILE_BIAS = 60;				// The higher the tile bias, the more unlikely it is the player will fall through
}

BasicGame.Multiplayer.prototype.createGame = function() {
	console.log('create');
	var ref = this;
	var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
	var txt = this.add.text(this.world.width - this.world.width/2, this.world.height - 100,  "Back to main menu", optionStyle);
	txt.inputEnabled = true;
	txt.events.onInputUp.add(function() {
		ref.game.state.start("MainMenu", true);
		ref.eurecaClient.disconnect();
		//console.log(this.eurecaClient);
	});

	// Assign global groups
	BasicGame.playerCG = this.add.group();
	BasicGame.projectileCG = this.add.group();
	BasicGame.colliderCG = this.add.group();

	this.playerList = {};

	// Create client's hero
	if (BasicGame.selectedChar == "player_trooper") {
		var player = new BasicGame.HeroTrooperMP(this.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_walker") {
		var player = new BasicGame.HeroWalkerMP(this.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_destroyer") {
		var player = new BasicGame.HeroDestroyerMP(this.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_gunner") {
		var player = new BasicGame.HeroGunnerMP(this.myID, this.game, 100, 1000);
	}

	this.playerList[this.myID] = player;
	this.camera.follow(player);

	this.player = player;

	// HUD
	this.skillA = this.game.add.image(50, this.game.height - 20, 'skill');
	this.skillB = this.game.add.image(100, this.game.height - 20, 'skill');
	this.skillC = this.game.add.image(150, this.game.height - 20, 'skill');
	this.skillD = this.game.add.image(200, this.game.height - 20, 'skill');

	this.skillA.fixedToCamera = true;
	this.skillB.fixedToCamera = true;
	this.skillC.fixedToCamera = true;
	this.skillD.fixedToCamera = true;

	this.skillA.anchor.setTo(0.5, 1);
	this.skillB.anchor.setTo(0.5, 1);
	this.skillC.anchor.setTo(0.5, 1);
	this.skillD.anchor.setTo(0.5, 1);

	this.cropRectA = new Phaser.Rectangle(0, 0, this.skillA.width, this.skillA.height);
	this.cropRectB = new Phaser.Rectangle(0, 0, this.skillB.width, this.skillB.height);
	this.cropRectC = new Phaser.Rectangle(0, 0, this.skillC.width, this.skillC.height);
	this.cropRectD = new Phaser.Rectangle(0, 0, this.skillD.width, this.skillD.height);

	this.healthBarEmpty = this.game.add.image(250, this.game.height - 20, 'hpEmpty');
	this.healthBarEmpty.fixedToCamera = true;
	this.healthBarEmpty.anchor.setTo(0, 1);

	this.healthBar = this.game.add.image(250, this.game.height - 20, 'hpFull');
	this.healthBar.fixedToCamera = true;
	this.healthBar.anchor.setTo(0, 1);
	this.healthRect = new Phaser.Rectangle(0, 0, this.healthBar.width, this.healthBar.height);
};

BasicGame.Multiplayer.prototype.update = function() {
	if (!this.ready) return;
	// Enable collision between player and layer
	this.physics.arcade.collide(BasicGame.playerCG, layer);
	this.physics.arcade.collide(BasicGame.playerCG, BasicGame.playerCG);
	this.physics.arcade.collide(BasicGame.projectileCG, layer, this.projectileCallback);
	this.physics.arcade.overlap(BasicGame.projectileCG, BasicGame.playerCG, this.colliderCallback);
	this.physics.arcade.overlap(BasicGame.colliderCG, BasicGame.playerCG, this.colliderCallback);

	this.handleHUD();
};

BasicGame.Multiplayer.prototype.handleHUD = function() {
	// Health
	this.healthRect.width = 283 * this.player.getHP();
	this.healthBar.crop(this.healthRect);

	// Skills
	this.cropRectA.height = 66 * (this.player.getSkillA() + 1);
	this.skillA.crop(this.cropRectA);

	this.cropRectB.height = 66 * (this.player.getSkillB() + 1);
	this.skillB.crop(this.cropRectB);

	this.cropRectC.height = 66 * (this.player.getSkillC() + 1);
	this.skillC.crop(this.cropRectC);

	this.cropRectD.height = 66 * (this.player.getSkillD() + 1);
	this.skillD.crop(this.cropRectD);
}

BasicGame.Multiplayer.prototype.projectileCallback= function(obj1, obj2) {
	obj1.onCollide();
};

BasicGame.Multiplayer.prototype.colliderCallback= function(obj1, obj2) {
	obj1.onCollide(obj2);
};

BasicGame.Multiplayer.prototype.getID = function() {
	return this.myID;
};

BasicGame.Multiplayer.prototype.getChar = function() {
	return BasicGame.selectedChar;
};