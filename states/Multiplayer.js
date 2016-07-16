BasicGame.Multiplayer = function (game) {
	this.playerList;					// Player list
	this.playerListHUD;
	this.logo;
	this.selectedChar = '';				// Selected character
	this.team = '';

	this.gravity = 5000;				// Gravity
	this.spawnX = 1000;					// Starting spawn
	this.spawnY = 1000;

	this.mapLayer;

	this.timeStep = 350;				// Time step for interpolation
	this.delta = 5;						// Delta for smoothing

	this.spawnPoints = [				// Array of spawn points, set in each hero class
		{x: 1000,  y: 250},
		{x: 250,  y: 1000},				// Team 1 spawn
		{x: 3200, y: 1000},				// Team 2 spawn
		{x: 2500,  y: 500}
	];

	this.teamScores = [
		0, 
		0,
		0
	];

	this.magicSpawnPoints = [			// Array of magic circle spawn points
		{x: 490,  y: 635},
		{x: 1750,  y: 700},
		{x: 1750, y: 1260},
		{x: 3010,  y: 640}
	];

	this.teamAHUD;
	this.teamBHUD;
};

BasicGame.Multiplayer.prototype.init = function() {
};

BasicGame.Multiplayer.prototype.preload = function() {
	// variables setting
	var ref = this;

	BasicGame.eurecaClient.exports.kill = function(id) {	
		if (ref.playerList[id][0]) {
			ref.removePlayerName(id);
			ref.playerList[id][0].kill();
			ref.broadcast(ref.playerList[id][1] + " has left the game!", 2);
			console.log('killing ', id, ref.playerList[id][1], Object.keys(ref.playerList).length);
			delete ref.playerList[id];
		}
	}	

	BasicGame.eurecaClient.exports.kickToMenu = function() {
		ref.game.state.start("MainMenu", true);
		BasicGame.eurecaClient.disconnect(); // request server to disconnect client
		BasicGame.disconnectClient(); // adjust client to reset connection variable
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
				var player = new BasicGame.HeroTrooperMP(i, ref.game, curX, curY, team, nick);
			} 
			if (char == "player_walker") {
				var player = new BasicGame.HeroWalkerMP(i, ref.game, curX, curY, team, nick);
			}
			if (char == "player_destroyer") {
				var player = new BasicGame.HeroDestroyerMP(i, ref.game, curX, curY, team, nick);
			}
			if (char == "player_gunner") {
				var player = new BasicGame.HeroGunnerMP(i, ref.game, curX, curY, team, nick);
			}
			ref.playerList[i] = [player, nick, team];
			// Uncomment for team only
			//if (team == BasicGame.myTeam) {
				ref.addPlayerName(i);
			//}
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
			curPlayer.heroLevel = state.lvl;
			curPlayer.heroExp = state.exp;
			//curPlayer.interpolateTo(state.x, state.y, 1000);
		}
		//console.log(BasicGame.myID, id);
		if (curPlayer && BasicGame.myID == id) {
			curPlayer.inCircle = state.inCircle;
			// console.log(curPlayer.ID +  " " + curPlayer.inCircle);
			if (curPlayer.inCircle) {
				creditExp(curPlayer, 20);
			}
		}
		ref.updatePlayerList();
	};	

	BasicGame.eurecaClient.exports.getChar = function() {
		// Return player's selected character
		return BasicGame.selectedChar;
	};

	BasicGame.eurecaClient.exports.setIndex = function(index) {
		// Return player's selected character
		if (ref.magicCircle != null) {
			ref.magicCircle.position = ref.magicSpawnPoints[index];
			console.log('setting magic circle to: ' + ref.magicCircle.position.x + ' ' + ref.magicCircle.position.y);
			ref.broadcast("The sigil of Antares has appeared", 2);
		}
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
	map.setCollisionBetween(63, 80, true, layer);	
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
		BasicGame.eurecaClient.exports.kickToMenu();
	});

	// Assign global groups
	BasicGame.playerCG = this.add.group();
	BasicGame.colliderCG = this.add.group();
	BasicGame.shieldCG = this.add.group();
	BasicGame.miteCG = this.add.group();

	this.playerList = {};

	// Create client's hero
	if (BasicGame.selectedChar == "player_trooper") {
		//console.log(this.game.rnd.integerInRange(0, 3));
		var player = new BasicGame.HeroTrooperMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick);
	}
	if (BasicGame.selectedChar == "player_walker") {
		var player = new BasicGame.HeroWalkerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick);
	}
	if (BasicGame.selectedChar == "player_destroyer") {
		var player = new BasicGame.HeroDestroyerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick);
	}
	if (BasicGame.selectedChar == "player_gunner") {
		var player = new BasicGame.HeroGunnerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick);
	}
	console.log("Creating game");

	this.playerList[BasicGame.myID] = [player, BasicGame.myNick, BasicGame.myTeam];
	this.camera.follow(player);

	this.player = player;

	// Add collider for spawns
	this.teamA = this.game.add.sprite(80, 950, '');
	this.game.physics.arcade.enableBody(this.teamA);
	this.teamA.body.setSize(500, 300, 0, 0);
	this.teamA.body.allowGravity = false;
	this.game.add.existing(this.teamA);

	this.teamB = this.game.add.sprite(2900, 950, '');
	this.game.physics.arcade.enableBody(this.teamB);
	this.teamB.body.setSize(500, 300, 0, 0);
	this.teamB.body.allowGravity = false;
	this.game.add.existing(this.teamB);

	// HUD
	this.skillA = this.game.add.image(433, this.game.height - 20, 'skill');
	this.skillB = this.game.add.image(478, this.game.height - 20, 'skill');
	this.skillC = this.game.add.image(805, this.game.height - 20, 'skill');
	this.skillD = this.game.add.image(850, this.game.height - 20, 'skill');

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

	// Healthbar
	this.healthBarEmpty = this.game.add.image(500, this.game.height - 20, 'hpEmpty');
	this.healthBarEmpty.fixedToCamera = true;
	this.healthBarEmpty.anchor.setTo(0, 1);

	this.healthBar = this.game.add.image(500, this.game.height - 20, 'hpFull');
	this.healthBar.fixedToCamera = true;
	this.healthBar.anchor.setTo(0, 1);
	this.healthRect = new Phaser.Rectangle(0, 0, this.healthBar.width, this.healthBar.height);

	this.healthBarPercentage = this.game.add.text(680, this.game.height - 40, '0%', { font: '24pt myfont', align: 'right', fill: 'white'});
	this.healthBarPercentage.fixedToCamera = true;
	this.healthBarPercentage.anchor.setTo(0.5, 0.5);

	// Exp bar
	this.expBarEmpty = this.game.add.image(522, this.game.height - 65, 'expEmpty');
	this.expBarEmpty.fixedToCamera = true;
	this.expBarEmpty.anchor.setTo(0, 1);

	this.expBar = this.game.add.image(522, this.game.height - 65, 'expFull');
	this.expBar.fixedToCamera = true;
	this.expBar.anchor.setTo(0, 1);
	this.expRect = new Phaser.Rectangle(0, 0, this.expBar.width, this.expBar.height);

	this.expBarPercentage = this.game.add.text(680, this.game.height - 72, '0%', { font: '16pt myfont', align: 'right', fill: 'white'});
	this.expBarPercentage.fixedToCamera = true;
	this.expBarPercentage.anchor.setTo(0.5, 0.5);

	// Team gui
	this.logo = this.game.add.image(240, 0, 'score');
	this.teamAHUD = this.game.add.text(BasicGame.gameWidth/2 - 90, 40, 'TeamA', { font: '16pt myfont', align: 'right', fill: 'white'});
	this.teamBHUD = this.game.add.text(BasicGame.gameWidth/2 + 50, 40, 'TeamB', { font: '16pt myfont', align: 'left', fill: 'white'});

	this.logo.fixedToCamera = true;
	this.teamAHUD.fixedToCamera = true;
	this.teamBHUD.fixedToCamera = true;

	// Team list
	this.playerCount = 0;
	this.playerListHUD = [];
	this.addPlayerName(BasicGame.myID);

	// Broadcast messages
	var style = { font: '32pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 800, align: 'center'};
	this.message = this.game.add.text(-500, 0, 'Default message', style), 
	this.message.fixedToCamera = true;
	this.message.anchor.setTo(0.5, 0.5);

	// Magic circle
	this.magicCircle = this.game.add.sprite(-500, -500, 'magicCircle');
	this.magicCircle.anchor.setTo(0.5, 0.5);
	this.game.physics.arcade.enableBody(this.magicCircle);
	this.magicCircle.body.setSize(400, 100, 0, -50);
	this.magicCircle.body.allowGravity = false;
	this.game.add.existing(this.magicCircle);

	// create all other clients
	BasicGame.eurecaServer.handshake(BasicGame.roomID);

	console.log("my team: " + BasicGame.myTeam);
};

BasicGame.Multiplayer.prototype.addPlayerName = function(id) {
	// Factory function
	this.playerListHUD[id] = this.game.add.sprite(25, 15 + (this.playerCount * 35), 'playerName');
	var text = this.game.add.text(15, 15, this.playerList[id][1] + " - " + this.playerList[id][0].curHealth + " (" + this.playerList[id][0].heroLevel + ")", { font: '10pt myfont', align: 'left', fill: "white", align: 'left'});
	this.playerListHUD[id].addChild(text);
 	this.playerListHUD[id].fixedToCamera = true;
 	this.playerCount++;
};

BasicGame.Multiplayer.prototype.removePlayerName = function(id) {
	this.playerCount--;
	this.playerListHUD[id].destroy();
};

BasicGame.Multiplayer.prototype.updatePlayerList = function() {
	for (id in this.playerListHUD) {
		//console.log(this.playerListHUD[id].children.length);
		if(this.playerListHUD[id].children.length > 0) {
			this.playerListHUD[id].getChildAt(0).setText(this.playerList[id][1] + " - " + this.playerList[id][0].curHealth + " (" + this.playerList[id][0].heroLevel + ") ");
		}
	}
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
	// Enable collision between player and layer and shield
	this.physics.arcade.collide(BasicGame.playerCG, layer);
	this.physics.arcade.overlap(BasicGame.playerCG, BasicGame.shieldCG, this.shieldCallback.bind(this));
	// Team colliders
	this.physics.arcade.overlap(this.teamA, BasicGame.playerCG, this.baseCallback.bind(this));	
	this.physics.arcade.overlap(this.teamB, BasicGame.playerCG, this.baseCallback.bind(this));	

	this.handleHUD();
	//this.showPlayerList();
	//this.updatePlayerList();
	//this.game.debug.body(this.teamA);
	//this.game.debug.body(this.teamB);
	//this.chat();
	//this.game.debug.spriteInfo(this.magicCircle, 0, 100);
	//this.game.debug.body(this.magicCircle, 0, 200);
};

BasicGame.Multiplayer.prototype.handleHUD = function() {
	// Health
	this.healthBarPercentage.setText(this.game.math.floorTo(this.player.getHP() * 100) + "% HP");
	this.healthRect.width = 283 * this.player.getHP();
	this.healthBar.crop(this.healthRect);

	// Exp
	this.expBarPercentage.setText(this.game.math.floorTo(this.player.getExp() * 100) + "%   EXP");
	this.expRect.width = 240 * this.player.getExp();
	this.expBar.crop(this.expRect);

	// Skills
	this.cropRectA.height = 66 * (this.player.getSkillB() + 1);
	this.skillA.crop(this.cropRectA);

	this.cropRectB.height = 66 * (this.player.getSkillC() + 1);
	this.skillB.crop(this.cropRectB);

	this.cropRectC.height = 66 * (this.player.getSkillD() + 1);
	this.skillC.crop(this.cropRectC);

	this.cropRectD.height = 66 * (this.player.getSkillE() + 1);
	this.skillD.crop(this.cropRectD);

	// Update every 500ms so won't be that taxing
	if (this.game.time.now > this.textTimer) {
		this.textTimer = this.game.time.now + 500;
		var ref = this;
		BasicGame.eurecaServer.getTeamScore(BasicGame.roomID).onReady(function(result) {
			ref.teamScores = result;
		}, this);
		
		this.teamAHUD.setText(this.teamScores[1]);
		this.teamBHUD.setText(this.teamScores[2]);
	}
};

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

BasicGame.Multiplayer.prototype.baseCallback= function(obj1, obj2) {
	if ((obj1 == this.teamA && obj2.myTeam == 1) || (obj1 == this.teamB && obj2.myTeam == 2)) {
		if (obj2.curHealth < obj2.maxHealth && !obj2.isDead) {
			obj2.curHealth++;
		}
	}
};

BasicGame.Multiplayer.prototype.shieldCallback= function(obj1, obj2) {
	// If not same team, push back
	if (obj1.myTeam != obj2.myTeam) {
		obj1.inShield = true;
		obj1.body.velocity.x = obj2.facingRight * 500;
	}
};

BasicGame.Multiplayer.prototype.projectileCallback= function(obj1, obj2) {
	obj1.onCollide();
};

BasicGame.Multiplayer.prototype.bulletCallback= function(obj1, obj2) {
	//console.log(obj1);
	obj1.kill();
};


BasicGame.Multiplayer.prototype.getID = function() {
	return BasicGame.myID;
};

BasicGame.Multiplayer.prototype.getChar = function() {
	return BasicGame.selectedChar;
};