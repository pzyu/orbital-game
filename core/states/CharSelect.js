BasicGame.CharSelect = function (game) {
	this.offset = 200;
	this.charCount = 0;
	this.startGame = null;
	this.gray = null;
	this.isClicked = null;
	this.multiplayer = false;
};

BasicGame.CharSelect.prototype = {
	init: function(multiplayer) {
		this.multiplayer = multiplayer;
		console.log(this.multiplayer);
	},

	resetFilter: function(target) {
		target.filters = [this.gray];
	},

	// On over style
	onOver: function(target) {
		target.filters = null;
	},
 
	// On out style
	onOut: function (target) {
		if(this.isClicked != target) {
			this.resetFilter(target);
		}
	},

	// On click
	onClick: function (target) {
		this.resetFilter(target);
		this.isClicked = target; // chosen character information is stored into this.isClicked
		target.filters = null; // highlight chosen character
		target.animations.play('anim_attack');
		target.animations.currentAnim.onLoop.add(function() { 
			target.animations.play('anim_idle');
		});
		BasicGame.selectedChar = target.key;
		//console.log(BasicGame.selectedChar);
	},

	addCharacter: function(spriteName) {
		// This way looks nicer but is more expensive and takes longer to load
		var char = this.add.sprite(this.offset * this.charCount, 0, spriteName);
		//console.log(spriteName + " " + char.height + " " + char.width);

		var animName = "";

		if (spriteName == 'player_destroyer') {
			animName = "Anim_Destroyer_";
		}
		if (spriteName == 'player_trooper') {
			animName = "Anim_Trooper_";
			char.x += 120;
			char.y += 100;
		}
		if (spriteName == 'player_walker') {
			animName = "Anim_Walker_";
			char.x += 50;
			char.y += 20;
		}
		if (spriteName == 'player_gunner') {
			animName = "Anim_Gunner_";
			char.x += 110;
			char.y += 75;
		}


		// Add animation and play
		char.animations.add('anim_idle', Phaser.Animation.generateFrameNames(animName + 'Idle_00', 0, 9), 16, true);
		char.animations.add('anim_attack', Phaser.Animation.generateFrameNames(animName + 'Shoot_00', 0, 10), 16, true);
		char.animations.play('anim_idle');

		this.resetFilter(char);
		this.isClicked = null;

		// Set input functions
		char.inputEnabled = true;
		char.events.onInputUp.add(this.onClick, this);
		char.events.onInputOver.add(this.onOver, this);
		char.events.onInputOut.add(this.onOut, this);

		this.charCount++;
	},

	preload: function() {
		this.gray = this.game.add.filter('Gray');

		// Just use factory function
		this.addCharacter('player_destroyer');
		this.addCharacter('player_trooper');
		this.addCharacter('player_walker');
		this.addCharacter('player_gunner');

		// Add start game button
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		this.startGame = this.add.text(this.world.width - this.world.width/4, this.world.height - 100,  "Start Game", optionStyle);
		this.startGame.inputEnabled = true; 
		var ref = this;
		this.startGame.events.onInputUp.add(function() {
			if (BasicGame.selectedChar != null && !ref.multiplayer) {
				this.game.state.start("MainGame");
			} else if (BasicGame.selectedChar != null && ref.multiplayer) {
				this.game.state.start("Multiplayer");
			}
		});

	},

	create: function() {

	},

	update: function() {
	}
};