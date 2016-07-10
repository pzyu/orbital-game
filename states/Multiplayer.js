BasicGame.Multiplayer = function (game) {
	this.playerList;					// Player list
	this.playerListHUD;
	this.selectedChar = '';				// Selected character

	this.gravity = 5000;				// Gravity
	this.spawnX = 1000;					// Starting spawn
	this.spawnY = 1000;

	this.mapLayer;

	this.timeStep = 1000;				// Time step for interpolation
	this.delta = 5;						// Delta for smoothing

	this.spawnPoints = [				// Array of spawn points, set in each hero class
		{x: 500,  y: 500},
		{x: 1000,  y: 500},
		{x: 2500,  y: 500},
		{x: 3000, y: 500}
	];
};

BasicGame.Multiplayer.prototype.init = function() {
};

BasicGame.Multiplayer.prototype.preload = function() {
	// variables setting
	var ref = this;

	BasicGame.eurecaClient.exports.kill = function(id) {	
		if (ref.playerList[id][0]) {
			ref.playerList[id][0].kill();
			ref.broadcast(ref.playerList[id][0] + " has left the game!", 2);
			console.log('killing ', id, ref.playerList[id][0], Object.keys(ref.playerList).length);
			delete ref.playerList[id];
		}
	}	

	BasicGame.eurecaClient.exports.spawnOtherPlayers = function(i, x, y, char, nick, team) {
		// If it's me or if someone hasn't chose a character yet
		//console.log(i, BasicGame.myID);
		if (i == BasicGame.myID || char == null) return;
		// Spawn enemy at location
		var curX = x;
		var curY = y;
		if (x == 0 || y == 0) {
			curX = ref.spawnX;
			curY = ref.spawnY;
		}

		ref.broadcast(nick + " has joined the game!", 2);
		console.log('Spawning', i, curX, curY, char, nick, team);

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
			ref.playerList[i] = [player, nick, team];
		}
		// Every time you add a player, sort the group so local client is always on top
		BasicGame.playerCG.sort('z', Phaser.Group.SORT_DESCENDING);
	}

	BasicGame.eurecaClient.exports.updateState = function(id, state) {
		// Update state sends local remote input to every client 
		var curPlayer = ref.playerList[id][0];
		if (curPlayer) {
			// Update player's cursor with state
			curPlayer.cursor = state;
			//curPlayer.update();
		}
	};

	BasicGame.eurecaClient.exports.compensate = function(id, state) {
		// Compensate corrects server side position, does not touch local client
		var curPlayer = ref.playerList[id][0];
		if (curPlayer && BasicGame.myID != id) {
			//console.log('compensating');
			curPlayer.x = state.x;
			curPlayer.y = state.y;
			curPlayer.curHealth = state.hp;
			//curPlayer.interpolateTo(state.x, state.y, 1000);
		}
	};	

	BasicGame.eurecaClient.exports.getChar = function() {
		// Return player's selected character
		return BasicGame.selectedChar;
	};

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

	this.mapLayer = layer;

	map.setCollisionBetween(0, 60, true, layer);	// Set collision layers between json tile representation
	map.setCollisionBetween(63, 99, true, layer);	
	map.setCollisionBetween(329, 341, true, layer);	

	this.physics.arcade.TILE_BIAS = 60;				// The higher the tile bias, the more unlikely it is the player will fall through

    //this.inputField = this.game.plugins.add(Fabrique.Plugins.InputField);
    //this.nineSlice = this.game.plugins.add(Fabrique.Plugins.NineSlice);

    // Uncomment for chat
	//this.chatBox = this.game.add.inputField(260, 680, {
	//	width: 260,
	//	height: 20,
	//	placeHolder: 'Type something here'
	//});
	//this.chatBox.fixedToCamera = true;

	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);


	// Chat
	var test =  { font: '16pt myfont', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 400};
	this.playerText = this.game.add.text(-100, -100, "Default", test);
	this.textTimer = 0;

	this.createGame(); // preload complete, start to create game
}

BasicGame.Multiplayer.prototype.createGame = function() {
	var ref = this;
	var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
	var txt = this.add.text(this.world.width - this.world.width/2, this.world.height - 100,  "Back to main menu", optionStyle);
	txt.inputEnabled = true;
	txt.events.onInputUp.add(function() {
		ref.game.state.start("MainMenu", true);
		BasicGame.eurecaClient.disconnect(); // request server to disconnect client
		BasicGame.disconnectClient(); // adjust client to reset connection variable
		//console.log(BasicGame.eurecaClient);
	});

	// Assign global groups
	BasicGame.playerCG = this.add.group();
	BasicGame.projectileCG = this.add.group();
	BasicGame.colliderCG = this.add.group();
	BasicGame.shieldCG = this.add.group();

	this.playerList = {};

	// Create client's hero
	if (BasicGame.selectedChar == "player_trooper") {
		//console.log(this.game.rnd.integerInRange(0, 3));
		var player = new BasicGame.HeroTrooperMP(BasicGame.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_walker") {
		var player = new BasicGame.HeroWalkerMP(BasicGame.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_destroyer") {
		var player = new BasicGame.HeroDestroyerMP(BasicGame.myID, this.game, 100, 1000);
	}
	if (BasicGame.selectedChar == "player_gunner") {
		var player = new BasicGame.HeroGunnerMP(BasicGame.myID, this.game, 100, 1000);
	}
	console.log("Creating game");

	this.playerList[BasicGame.myID] = [player, BasicGame.myNick, BasicGame.myTeam];
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

	var style = { font: '32pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 800, align: 'center'};
	this.message = this.game.add.text(-500, 0, 'Default message', style), 
	this.message.fixedToCamera = true;
	this.message.anchor.setTo(0.5, 0.5);

	// create all other clients
	BasicGame.eurecaServer.handshake(BasicGame.roomID);
};

BasicGame.Multiplayer.prototype.broadcast = function(msg, duration) {
	var ref = this;
	console.log(msg, duration);
	var tween = this.game.add.tween(this).to({0: 0}, duration * 1000, Phaser.Easing.Linear.None, true, 0);
	tween.onStart.add(function() {
		ref.message.x = ref.game.width/2;
		ref.message.y = ref.game.height/4;
		ref.message.setText(msg);
		ref.message.fixedToCamera = true;
	});
	tween.onComplete.add(function(){
		ref.message.fixedToCamera = false;
		ref.message.position.x = ref.message.position.y = -50;
	});

};

BasicGame.Multiplayer.prototype.update = function() {
	//console.log("TEST update");
	// Enable collision between player and layer
	this.physics.arcade.collide(BasicGame.playerCG, layer);
	this.physics.arcade.collide(BasicGame.playerCG, BasicGame.playerCG);
	this.physics.arcade.collide(BasicGame.playerCG, BasicGame.shieldCG);

	this.physics.arcade.collide(BasicGame.projectileCG, layer, this.projectileCallback);
	this.physics.arcade.collide(BasicGame.projectileCG, BasicGame.shieldCG, this.shieldCallBack);
	// Overlap
	//this.physics.arcade.overlap(BasicGame.projectileCG, BasicGame.playerCG, this.colliderCallback);
	//this.physics.arcade.overlap(BasicGame.colliderCG, BasicGame.playerCG, this.colliderCallback);

	this.handleHUD();
	this.showPlayerList();
	//this.chat();
};

BasicGame.Multiplayer.prototype.handleHUD = function() {
	// Health
	this.healthRect.width = 283 * this.player.getHP();
	this.healthBar.crop(this.healthRect);

	// Skills
	this.cropRectA.height = 66 * (this.player.getSkillB() + 1);
	this.skillA.crop(this.cropRectA);

	this.cropRectB.height = 66 * (this.player.getSkillC() + 1);
	this.skillB.crop(this.cropRectB);

	this.cropRectC.height = 66 * (this.player.getSkillD() + 1);
	this.skillC.crop(this.cropRectC);

	this.cropRectD.height = 66 * (this.player.getSkillE() + 1);
	this.skillD.crop(this.cropRectD);
}

BasicGame.Multiplayer.prototype.showPlayerList = function() {
	var count = 0;
	var ref = this;
	var style2 = { font: '10pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 800, align: 'center'};

	BasicGame.Multiplayer.prototype.resetPlayerListHUD(); // reset playerlist
	for (var player in this.playerList) {
		this.playerListHUD[count] = ref.game.add.text(25, 20 + (count * 15), this.playerList[player][1] + " - " + this.playerList[player][0].curHealth, style2);
		this.playerListHUD[count].fixedToCamera = true;
		count++;
	}
}

// function for clearing playerListHUD text
BasicGame.Multiplayer.prototype.resetPlayerListHUD = function() {
	for (var item in this.playerListHUD) {
		this.playerListHUD[item].destroy();
	}
	this.playerListHUD = {};
}

BasicGame.Multiplayer.prototype.chat = function() {
	if (this.enter.isDown && this.game.time.now > this.textTimer) {
		this.textTimer = this.game.time.now + 1000;
		
		var ref = this;
		var tween = this.game.add.tween(this).to({0: 0}, 2000, Phaser.Easing.Linear.None, true, 0);
		tween.onStart.add(function() {
			ref.playerText.x = ref.playerList[BasicGame.myID][0].x + 20;
			ref.playerText.y = ref.playerList[BasicGame.myID][0].y - 50;
			ref.playerText.setText(ref.chatBox.value);
			ref.chatBox.resetText();

			console.log(ref.playerText.x, ref.playerText.y, ref.playerText.text);
		});
		tween.onComplete.add(function(){
			ref.playerText.position.x = ref.playerText.position.y = -50;
		});
	}
}

BasicGame.Multiplayer.prototype.projectileCallback= function(obj1, obj2) {
	obj1.onCollide();
};

BasicGame.Multiplayer.prototype.bulletCallback= function(obj1, obj2) {
	//console.log(obj1);
	obj1.kill();
};

BasicGame.Multiplayer.prototype.colliderCallback= function(obj1, obj2) {
	//console.log(obj1.__proto__);
	//if (obj1.__proto__ != Phaser.Sprite) {}
	obj1.onCollide(obj2);
};

BasicGame.Multiplayer.prototype.shieldCallBack = function(obj1, obj2) {
	obj1.onCollide();
};

BasicGame.Multiplayer.prototype.getID = function() {
	return BasicGame.myID;
};

BasicGame.Multiplayer.prototype.getChar = function() {
	return BasicGame.selectedChar;
};