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
		//target.animations.play('anim_attack');
		//target.animations.currentAnim.onLoop.add(function() { 
		//	target.animations.play('anim_idle');
		//});
		BasicGame.selectedChar = 'player_knight';
	},

	addCharacter: function(spriteName) {
		// This way looks nicer but is more expensive and takes longer to load
		var char = this.add.sprite(this.offset * this.charCount, 0, spriteName);
		//console.log(spriteName + " " + char.height + " " + char.width);

		// Add animation and play
		char.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Destroyer_Idle_00', 0, 9), 16, true);
		//char.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
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
		this.addCharacter('player_destroyer');
		this.addCharacter('player_destroyer');
		this.addCharacter('player_destroyer');
		/*BasicGame.charSelect_1.x = 200;
		BasicGame.charSelect_1.y = 200;
		BasicGame.charSelect_1.animations.play('anim_idle');
		BasicGame.charSelect_2.animations.play('anim_idle');
		BasicGame.charSelect_3.animations.play('anim_idle');
		BasicGame.charSelect_4.animations.play('anim_idle');
		this.game.add.existing(BasicGame.charSelect_1);
		this.game.add.existing(BasicGame.charSelect_2);
		this.game.add.existing(BasicGame.charSelect_3);
		this.game.add.existing(BasicGame.charSelect_4);
*/

		// Add start game button
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		this.startGame = this.add.text(this.world.width - this.world.width/4, this.world.height - 100,  "Start Game", optionStyle);
		this.startGame.inputEnabled = true; 
		this.startGame.events.onInputUp.add(function() {
			if (BasicGame.selectedChar != null) {
				this.game.state.start("MainGame");
			}
		});

	},

	create: function() {

	},

	update: function() {
	}
};