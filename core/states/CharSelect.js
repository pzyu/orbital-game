BasicGame.CharSelect = function (game) {
	this.offset = 200;
	this.charCount = 0;
	this.startGame = null;
	this.gray = null;
	this.isClicked = null;
};

BasicGame.CharSelect.prototype = {
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
	},

	addCharacter: function(spriteName) {
		// This way looks nicer but is more expensive and takes longer to load
		var char = this.add.sprite(this.offset * this.charCount, 0, spriteName);
		//console.log(spriteName + " " + char.height + " " + char.width);

		if (spriteName === "player_ninja") {
			char.scale.x = 0.9;
			char.scale.y = 0.9;

			char.x += 20;
			char.y += 20;
		}  else if (spriteName === "player_knight") {
			char.scale.x = 0.65;
			char.scale.y = 0.65;

			char.x += 60;
			char.y -= 10;
		} else if (spriteName === "player_cowgirl") {
			char.scale.x = 0.8;
			char.scale.y = 0.8;

			char.x -= 50;
			char.y += 5;
		} else {
			char.scale.x = 0.8;
			char.scale.y = 0.8;

			char.x += 80;
		}

		// Add animation and play
		char.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
		char.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
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
		this.addCharacter('player_ninja');
		this.addCharacter('player_cowgirl');
		this.addCharacter('player_knight');
		this.addCharacter('player_robot');
		//\console.log(BasicGame.charSelect_1);
		//this.add.sprite(0, 0, BasicGame.charSelect_1);

		// Add start game button
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		this.startGame = this.add.text(this.world.width - this.world.width/4, this.world.height - 100,  "Start Game", optionStyle);
		this.startGame.inputEnabled = true; 
		this.startGame.events.onInputUp.add(function() {
			this.game.state.start("MainGame");
		});

	},

	create: function() {

	},

	update: function() {
	}
};