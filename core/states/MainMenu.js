BasicGame.MainMenu = function (game) {
	// Game title, just edit from here
	this.gameTitle = "Very Original";

	// Other variables
	this.music = null;
	this.playButton = null;

	this.background = null;
	this.title = null;
};

BasicGame.MainMenu.prototype = {
	preload: function() {
		this.music = this.add.audio('titleMusic');		// Add music, titleMusic is defined in Boot.js
		this.music.volume = 0.1;						// Volume
		this.music.loop = true;							// Loop
		this.music.play();								// Play the music

		// Add background in
		background = this.add.sprite(0, 0, 'menu_background');
		background.height = this.game.height;
		background.width = this.game.width;

		// Add title
		title = this.add.text(50, this.world.height/6, this.gameTitle, {font: "60pt myfont", fill: 'white'});
		title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
		title.anchor.set(0, 0.5);

		// Set default option count for factory function
		this.optionCount = 1;
	},

	create: function () {
		this.addMenuOption('Start', function (target) {
			// Suppose to have a hero select or whatever
			// But just start with the game first
			this.game.state.start('CharSelect');
		});
		this.addMenuOption('Options', function (target) {
		});
		this.addMenuOption('Credits', function (target) {
		});
	},

	update: function () {

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		this.music.stop();

		//	And start the actual game
		this.state.start('Game');

	},

	addMenuOption: function(text, callback) {
		// Set default text
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		var txt = this.add.text(this.world.width - this.world.width/4, this.world.height/1.5 + this.optionCount * 40, text, optionStyle);

		// On over style
		var onOver = function (target) {
			target.fill = "#CCE8FF";
			target.stroke = "rgba(255,255,255,1)";
		};

		// On out style
		var onOut = function (target) {
			target.fill = "white";
			target.stroke = "rgba(0,0,0,0)";
		};

		// Default style
		txt.stroke = "rgba(0,0,0,0)";
		txt.strokeThickness = 4;
		txt.inputEnabled = true;
		txt.events.onInputUp.add(callback);
		txt.events.onInputOver.add(onOver);
		txt.events.onInputOut.add(onOut);
		this.optionCount ++;
	}

};
