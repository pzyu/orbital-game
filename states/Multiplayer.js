BasicGame.Multiplayer = function (game) {
	this.playerList;					// Player list
	this.playerListHUD;
	this.logo;
	this.selectedChar = '';				// Selected character
	this.team = '';						// Selected Team
	this.winState = false;				// win condition not met

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
	this.playerHUD;
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

	BasicGame.eurecaClient.exports.winGame = function(winTeam) {
		// Apply forced disconnection to lobby to "freeze" game state
		console.log("Forcing LobbyRoom disconnection on client...");
		ref.winState = true;
		BasicGame.eurecaServer.destroyRoomLink(BasicGame.roomID, BasicGame.myID); // forced disconnection from game lobby
		var winText = (BasicGame.myTeam == winTeam) ? "You are Victorious!" : "You are Defeated!";
		console.log("Client successfully disconnected from LobbyRoom!");

		// Show win/lose message
		var winLoseMsg = game.add.text(ref.game.width / 2, ref.game.height / 4, winText, 
			{font: '64pt myfont', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", boundsAlignH: "center", boundsAlignV: "middle"}); 
		winLoseMsg.fixedToCamera = true;
		winLoseMsg.anchor.setTo(0.5, 0.5);
		winLoseMsg.alpha = 0.1;
		game.add.tween(winLoseMsg).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

		// Add return to menu button
		var returnMenu = game.add.text(ref.game.width / 2, ref.game.height / 4 + 235,  "Back to Main Menu", 
			{font: '25pt myfont', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", boundsAlignH: "center", boundsAlignV: "middle"}); 
		returnMenu.inputEnabled = true;
		returnMenu.fixedToCamera = true;
		returnMenu.anchor.setTo(0.5, 0.5);
		returnMenu.events.onInputOver.add(BasicGame.onOver);
		returnMenu.events.onInputOut.add(BasicGame.onOut);

		// Back button clicked
		returnMenu.events.onInputUp.add(function() {
			BasicGame.eurecaClient.disconnect(); // disconnect user completely from server
			BasicGame.disconnectClient(); // adjust client to reset connection variable
			returnMenu.destroy();
			ref.game.state.start("MainMenu", true);
		});

		// Add return lobby button
		var returnLobby = game.add.text(ref.game.width / 2, ref.game.height / 4 + 200,  "Back to Lobby", 
			{font: '25pt myfont', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", boundsAlignH: "center", boundsAlignV: "middle"}); 
		returnLobby.inputEnabled = true;
		returnLobby.fixedToCamera = true;
		returnLobby.anchor.setTo(0.5, 0.5);
		returnLobby.events.onInputOver.add(BasicGame.onOver);
		returnLobby.events.onInputOut.add(BasicGame.onOut);
		
		// return lobby button clicked
		returnLobby.events.onInputUp.add(function() {
			ref.game.state.start("LobbyMulti", true);
		});
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
				var player = new BasicGame.HeroTrooperMP(i, ref.game, curX, curY, team, nick, 1);
			} 
			if (char == "player_walker") {
				var player = new BasicGame.HeroWalkerMP(i, ref.game, curX, curY, team, nick, 1);
			}
			if (char == "player_destroyer") {
				var player = new BasicGame.HeroDestroyerMP(i, ref.game, curX, curY, team, nick, 1);
			}
			if (char == "player_gunner") {
				var player = new BasicGame.HeroGunnerMP(i, ref.game, curX, curY, team, nick, 1);
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
			curPlayer.heroToNextLevel = state.expNext;
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
	var optionStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
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
		var player = new BasicGame.HeroTrooperMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_walker") {
		var player = new BasicGame.HeroWalkerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_destroyer") {
		var player = new BasicGame.HeroDestroyerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_gunner") {
		var player = new BasicGame.HeroGunnerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
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

	// Player hud
	this.hud = this.game.add.image(10, 540, 'player_hud');
	this.hud.fixedToCamera = true;

	this.healthBar = this.game.add.image(363, 668, 'player_hud_bar');
	this.healthBar.fixedToCamera = true;
	this.healthBar.anchor.setTo(0, 1);
	this.healthRect = new Phaser.Rectangle(0, 0, this.healthBar.width, this.healthBar.height);

	this.healthBarPercentage = this.game.add.text(505, this.game.height - 65, '0%', { font: '14pt myfont', align: 'right', fill: 'white', stroke: '#7cabd5', strokeThickness: 2});
	this.healthBarPercentage.fixedToCamera = true;
	this.healthBarPercentage.anchor.setTo(0.5, 0.5);

	this.expBar = this.game.add.image(385, 692, 'player_hud_bar');
	this.expBar.fixedToCamera = true;
	this.expBar.anchor.setTo(0, 1);
	this.expRect = new Phaser.Rectangle(0, 0, this.expBar.width, this.expBar.height);

	this.expBarPercentage = this.game.add.text(520, this.game.height - 42, '0%', { font: '14pt myfont', align: 'right', fill: 'white', stroke: '#7cabd5', strokeThickness: 2});
	this.expBarPercentage.fixedToCamera = true;
	this.expBarPercentage.anchor.setTo(0.5, 0.5);

	this.playerLevel = this.game.add.text(360, this.game.height - 98, '[25]', {font: '16pt myfont', align:'right', fill:'white', stroke:'#7cabd5', strokeThickness: 2});
	this.playerLevel.fixedToCamera = true;
	this.playerLevel.anchor.setTo(0, 0.5);

	// Customized skill and portrait
	var char = BasicGame.selectedChar.substring(7);
	// Team gui
	this.logo = this.game.add.image(240, 0, 'score');
	this.teamAHUD = this.game.add.text(BasicGame.gameWidth/2 - 90, 40, 'TeamA', { font: '16pt myfont', align: 'right', fill: 'white'});
	this.teamBHUD = this.game.add.text(BasicGame.gameWidth/2 + 50, 40, 'TeamB', { font: '16pt myfont', align: 'left', fill: 'white'});

	this.logo.fixedToCamera = true;
	this.teamAHUD.fixedToCamera = true;
	this.teamBHUD.fixedToCamera = true;

	// Skills
	this.skillA = this.game.add.image(52, 626, char + '_hud_skillA');
	this.skillB = this.game.add.image(89, 694, char + '_hud_skillB');
	this.skillC = this.game.add.image(128, 626, char + '_hud_skillC');
	this.skillD = this.game.add.image(169, 694, char + '_hud_skillD');
	this.skillE = this.game.add.image(207, 626, char + '_hud_skillE');

	this.skillA.fixedToCamera = true;
	this.skillB.fixedToCamera = true;
	this.skillC.fixedToCamera = true;
	this.skillD.fixedToCamera = true;
	this.skillE.fixedToCamera = true;

	this.skillA.anchor.setTo(0.5, 1);
	this.skillB.anchor.setTo(0.5, 1);
	this.skillC.anchor.setTo(0.5, 1);
	this.skillD.anchor.setTo(0.5, 1);
	this.skillE.anchor.setTo(0.5, 1);

	this.skillAHotkey = this.game.add.text(15, 550, '[A]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillAHotkey.fixedToCamera = true;

	this.skillBHotkey = this.game.add.text(55, 620, '[S]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillBHotkey.fixedToCamera = true;

	this.skillCHotkey = this.game.add.text(95, 550, '[D]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillCHotkey.fixedToCamera = true;

	this.skillDHotkey = this.game.add.text(135, 620, '[F]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillDHotkey.fixedToCamera = true;

	this.skillEHotkey = this.game.add.text(175, 550, '[SPACE]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillEHotkey.fixedToCamera = true;

	// Input
	this.skillA.inputEnabled = true;
	this.skillA.events.onInputDown.add(function() {
		this.player.skillA.isDown = true;
	}, this);
	this.skillA.events.onInputUp.add(function() {
		this.player.skillA.isDown = false;
	}, this);

	this.skillB.inputEnabled = true;
	this.skillB.events.onInputDown.add(function() {
		this.player.skillB.isDown = true;
	}, this);
	this.skillB.events.onInputUp.add(function() {
		this.player.skillB.isDown = false;
	}, this);

	this.skillC.inputEnabled = true;
	this.skillC.events.onInputDown.add(function() {
		this.player.skillC.isDown = true;
	}, this);
	this.skillC.events.onInputUp.add(function() {
		this.player.skillC.isDown = false;
	}, this);

	this.skillD.inputEnabled = true;
	this.skillD.events.onInputDown.add(function() {
		this.player.skillD.isDown = true;
	}, this);
	this.skillD.events.onInputUp.add(function() {
		this.player.skillD.isDown = false;
	}, this);

	this.skillE.inputEnabled = true;
	this.skillE.events.onInputDown.add(function() {
		this.player.skillE.isDown = true;
	}, this);
	this.skillE.events.onInputUp.add(function() {
		this.player.skillE.isDown = false;
	}, this);

	// Portrait
	this.playerHUD = this.game.add.image(264, 648, char + '_portrait');
	this.playerHUD.anchor.setTo(0.5, 0.5);
	this.playerHUD.scale.setTo(0.62, 0.62);
	this.playerHUD.fixedToCamera = true;

	// Team list
	this.playerCount = 0;
	this.playerListHUD = [];
	this.addPlayerName(BasicGame.myID);

	// Broadcast messages
	var style = {font: '32pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 800, align: 'center'};
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

	// Initialize and reset team variables
	this.winState = false;
	this.teamScores = [
		0, 
		0,
		0
	];

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
	// Level
	this.playerLevel.setText("[" + this.player.heroLevel + "]");

	// Health
	this.healthBarPercentage.setText(this.game.math.floorTo(this.player.getHP() * 100) + "%");
	this.healthRect.width = 269 * this.player.getHP();
	this.healthBar.crop(this.healthRect);

	// Exp
	this.expBarPercentage.setText(this.game.math.floorTo(this.player.getExp() * 100) + "%");
	this.expRect.width = 269 * this.player.getExp();
	this.expBar.crop(this.expRect);

	// Skills
	this.skillA.alpha = this.player.getSkillA() + 1;
	this.skillB.alpha = this.player.getSkillB() + 1;
	this.skillC.alpha = this.player.getSkillC() + 1;
	this.skillD.alpha = this.player.getSkillD() + 1;
	this.skillE.alpha = this.player.getSkillE() + 1;

	this.skillAHotkey.fill = this.skillA.alpha == 1 ? "white" : "grey";
	this.skillBHotkey.fill = this.skillB.alpha == 1 ? "white" : "grey";
	this.skillCHotkey.fill = this.skillC.alpha == 1 ? "white" : "grey";
	this.skillDHotkey.fill = this.skillD.alpha == 1 ? "white" : "grey";
	this.skillEHotkey.fill = this.skillE.alpha == 1 ? "white" : "grey";

	// var skillATime = this.game.math.roundTo((-this.player.skillBCooldown * this.player.getSkillB()) / 1000, -1);
	// if (skillATime == 0) {
	// 	skillATime = '';
	// }
	// this.skillA.getChildAt(0).setText(skillATime);

	// var skillBTime = this.game.math.roundTo((-this.player.skillCCooldown * this.player.getSkillC()) / 1000, -1);
	// if (skillBTime == 0) {
	// 	skillBTime = '';
	// }
	// this.skillB.getChildAt(0).setText(skillBTime);

	// var skillCTime = this.game.math.roundTo((-this.player.skillDCooldown * this.player.getSkillD()) / 1000, -1);
	// if (skillCTime == 0) {
	// 	skillCTime = '';
	// }
	// this.skillC.getChildAt(0).setText(skillCTime);

	// var skillDTime = this.game.math.roundTo((-this.player.skillECooldown * this.player.getSkillE()) / 1000, -1);
	// if (skillDTime == 0) {
	// 	skillDTime = '';
	// }
	// this.skillD.getChildAt(0).setText(skillDTime);

	// Update every 500ms so won't be that taxing
	if (this.winState == false && this.game.time.now > this.textTimer) {
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