BasicGame.CharSelect = function (game) {
	this.offset = 250;
	this.charCount = 0;
	this.startGame = null;
	this.gray = null;
	this.isClicked = null;
	this.multiplayer = false;
	this.loaded = false;
	this.charArr = new Array(4);
	this.skillArr = new Array(4);
	this.textContainer = {};
	this.highlight = null;
};

BasicGame.CharSelect.prototype = {
	init: function(multiplayer) {
		// On init, check if player has chose multiplayer
		this.multiplayer = multiplayer;
		this.charCount = 0;

		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;
	},

	resetFilter: function() {
		for (var i=0; i<this.charArr.length; i++) {
			this.charArr[i].filters = [this.gray];
		}
	},

	// On over style
	onOver: function(target) {
		//target.filters = null;
		target.scale.setTo(1.1);
		BasicGame.buttonOver.play();
	},
 
	// On out style
	onOut: function (target) {
		//this.resetFilter(target);
		//if (this.isClicked != null) {
		//	this.isClicked.filters = null;
		//}
		target.scale.setTo(1.0);
	},

	// On click
	onClick: function (target) {
		if (this.highlight) {
			this.highlight.position.setTo(-200, -200);
			
		} // sends input to all other clients

		//this.resetFilter(target);
		this.isClicked = target; // chosen character information is stored into this.isClicked
		var char = target.key.substring(0, target.key.length - 9);
		var selected = 'player_' + char;
		//console.log(selected);
		BasicGame.selectedChar = selected;
		this.heroName.setText((char == null) ? "" : (char == "destroyer") ? "Destroyer"
												  : (char == "trooper") ? "Ace"
												  : (char == "walker") ? "Walker"
												  : (char == "gunner") ? "Disruptor"
												  : "");
		this.stats.animations.frameName = char;
		this.skills.animations.frameName = char;

		this.highlight = this.charArr[selected];
		this.highlight.position.setTo(250, 140);
		BasicGame.buttonClick.play();
		//console.log(this.highlight);
		BasicGame.eurecaServer.getTeamSelection(BasicGame.roomID, BasicGame.myTeam, selected, BasicGame.myID);
	},

	addCharacter: function(spriteName) {
		// This way looks nicer but is more expensive and takes longer to load
		var char = this.add.sprite(-200, -200, spriteName);
		//console.log(spriteName + " " + char.height + " " + char.width);

		// To get the correct prefix for each character
		var animName = "";
		if (spriteName == 'player_destroyer') {
			animName = "Anim_Destroyer_";
			char.anchor.setTo(0.4, 0.5);
		}
		if (spriteName == 'player_trooper') {
			animName = "Anim_Trooper_";
			char.anchor.setTo(0.4, 0.35);
		}
		if (spriteName == 'player_walker') {
			animName = "Anim_Walker_";
			char.anchor.setTo(0.5, 0.55);
		}
		if (spriteName == 'player_gunner') {
			animName = "Anim_Gunner_";
			char.anchor.setTo(0.5, 0.4);
		}
		// Add animation and play
		char.animations.add('anim_idle', Phaser.Animation.generateFrameNames(animName + 'Idle_00', 0, 9), 16, true);
		//char.animations.add('anim_attack', Phaser.Animation.generateFrameNames(animName + 'Shoot_00', 0, 10), 16, true);
		char.animations.play('anim_idle');

		this.charArr[spriteName] = char;

		// Set input functions
		//char.inputEnabled = true;
		//char.events.onInputUp.add(this.onClick, this);
		//char.events.onInputOver.add(this.onOver, this);
		//char.events.onInputOut.add(this.onOut, this);

		//this.charCount++;
	},

	preload: function() {
		var ref = this;
		//this.loaded = true;
		this.gray = this.game.add.filter('Gray');

		// Just use factory function
		this.addCharacter('player_destroyer');
		this.addCharacter('player_walker');
		this.addCharacter('player_gunner');
		this.addCharacter('player_trooper');

		this.destroyer = this.game.add.image(915, 110, 'destroyer_portrait');
		this.destroyer.anchor.setTo(0.5, 0.5);
		this.destroyer.inputEnabled = true;
		this.destroyer.events.onInputUp.add(this.onClick, this);
		this.destroyer.events.onInputOver.add(this.onOver, this);
		this.destroyer.events.onInputOut.add(this.onOut, this);

		this.walker = this.game.add.image(1065, 110, 'walker_portrait');
		this.walker.anchor.setTo(0.5, 0.5);
		this.walker.inputEnabled = true;
		this.walker.events.onInputUp.add(this.onClick, this);
		this.walker.events.onInputOver.add(this.onOver, this);
		this.walker.events.onInputOut.add(this.onOut, this);

		this.gunner = this.game.add.image(840, 240, 'gunner_portrait');
		this.gunner.anchor.setTo(0.5, 0.5);
		this.gunner.inputEnabled = true;
		this.gunner.events.onInputUp.add(this.onClick, this);
		this.gunner.events.onInputOver.add(this.onOver, this);
		this.gunner.events.onInputOut.add(this.onOut, this);

		this.trooper = this.game.add.image(990, 240, 'trooper_portrait');
		this.trooper.anchor.setTo(0.5, 0.5);
		this.trooper.inputEnabled = true;
		this.trooper.events.onInputUp.add(this.onClick, this);
		this.trooper.events.onInputOver.add(this.onOver, this);
		this.trooper.events.onInputOut.add(this.onOut, this);

		// Add start game button
		var optionStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,255)', strokeThickness: 4, fill: "white"};
		if (ref.multiplayer) {
			var joinTxt = "Enter Game!";
		} else {
			var joinTxt = "Start Game";
		}
		//this.add.text(400, 300, "Arrow keys for controls, \nA,S,D,F for skills", optionStyle);
		
		this.heroPanel = this.game.add.image(245, 275, 'hero_name');
		this.heroPanel.anchor.setTo(0.5, 0.5);
		this.heroName = this.add.text(250, 250, "", {font: '30pt myfont', align: 'center', fill: 'white'});
		this.heroName.anchor.x = 0.5;
		//this.add.text(900, 600, "Ultimate skill", optionStyle);

		this.returnMenu = this.add.text(this.world.width - this.world.width/4, this.world.height - 70,  "Back", optionStyle);
		this.startGame = this.add.text(this.world.width - this.world.width/4, this.world.height - 110,  joinTxt, optionStyle);

		this.startGame.inputEnabled = true; 
		this.returnMenu.inputEnabled = true;
		this.returnMenu.events.onInputDown.add(BasicGame.onDown);
		this.returnMenu.events.onInputOver.add(BasicGame.onOver);
		this.returnMenu.events.onInputOut.add(BasicGame.onOut);
		this.startGame.events.onInputDown.add(BasicGame.onDown);
		this.startGame.events.onInputOver.add(BasicGame.onOver);
		this.startGame.events.onInputOut.add(BasicGame.onOut);

		this.stats = this.game.add.image(440, 10, 'stats');
		this.stats.animations.frameName = "stats";
		this.stats.scale.setTo(0.8, 0.8);

		this.teamPanel = this.game.add.image(900, 350, 'team_panel');
		this.teamPanel.scale.setTo(0.8, 0.8);
		this.add.text(1020, 345, "Team", optionStyle);

		this.skills = this.game.add.image(100, 350, 'skills');
		this.skills.animations.frameName = 'base';


		// Back button clicked
		if (ref.multiplayer) {
			this.returnMenu.events.onInputUp.add(function() {
				BasicGame.eurecaServer.destroyRoomLink(BasicGame.roomID, BasicGame.myID); // destroy connection
				BasicGame.eurecaServer.updateLobbyRoom(BasicGame.roomID); // update the rest of the clients after connection is destroyed
				ref.game.state.start("LobbyMulti", true);
			});
		} else {
			this.returnMenu.events.onInputUp.add(function() {
				ref.game.state.start("MainMenu", true);
			});
		}

		// Start game button clicked
		this.startGame.events.onInputUp.add(function() {
			if (BasicGame.selectedChar != null && !ref.multiplayer) {
				// If not multiplayer, then start main game
				this.game.state.start("MainGame");
			} else if (BasicGame.selectedChar != null && ref.multiplayer) {
				// Go into multiplayer
				this.game.state.start("Multiplayer");
			}
		});

		// Multiplayer Add-on
		if (ref.multiplayer) {
			BasicGame.eurecaClient.exports.loadTeamChar = function(teamArr) {
				// clear existing text
				for (var idx in ref.textContainer) {
					ref.textContainer[idx].destroy();
				}
				ref.textContainer = {};

				// Update with new text
				var textColorDefault = {font: '12pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
				var plCounter = 0;
				for (var i=0; i<teamArr.length; i++) {
					if (teamArr[i][2] != BasicGame.myID) {
						plCounter++;
						var selChar = (teamArr[i][1] == null) ? "None" : (teamArr[i][1] == "destroyer_portrait") ? "Destroyer"
																		: (teamArr[i][1] == "trooper_portrait") ? "Ace"
																		: (teamArr[i][1] == "walker_portrait") ? "Walker"
																		: (teamArr[i][1] == "gunner_portrait") ? "Disruptor"
																		: "None";
						ref.textContainer[i + " 1"] = ref.add.text(930, ref.game.height / 2 + 15 + (plCounter * 25),  teamArr[i][0] + ": \n[" + selChar + "]", textColorDefault);
					}
				}
			}

			BasicGame.eurecaClient.exports.kill = function(id) { // overwrite lobbyroom kill function
				BasicGame.eurecaServer.getTeamSelection(BasicGame.roomID, BasicGame.myTeam, null, BasicGame.myID); // update everyone in lobbyroom
			}

			BasicGame.eurecaServer.getTeamSelection(BasicGame.roomID, BasicGame.myTeam, null, BasicGame.myID);
		}

	},

	create: function() {
	},

	update: function() {
	}
};