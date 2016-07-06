// For every state, you just call BasicGame.StateName
BasicGame.Credits = function (game) {
	// Game title, just edit from here
	console.log('loaded');
	this.gameTitle = "Credits";
};

var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};

BasicGame.Credits.prototype = {
	init: function() {
	},

	preload: function() {

		// Use same background as main menu
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;

		// Use same tittle as main menu
		this.title = this.add.text(50, this.world.height/6, this.gameTitle, {font: "60pt myfont", fill: 'white', align: 'right'});
		this.title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
		this.title.anchor.set(0, 0.5);
	},

	create:  function() {
		var ref = this;

		// Button to go back to main menu
		this.addMenuOption(this.world.width - this.world.width/2.5, this.world.height/2  + 300,  "Back to main menu", function (target) {
			ref.game.state.start("MainMenu", true);
		});

		this.add.text(100, 300, "Move along now, nothing to see here", optionStyle);
	},

	// Factory function that lets you add options easily
	addMenuOption: function(xPosition, yPosition, text, callback) {
		// Set default text
		var txt = this.add.text(xPosition, yPosition, text, optionStyle);

		// Default style
		txt.stroke = "rgba(0,0,0,0)";
		txt.strokeThickness = 4;
		txt.inputEnabled = true;
		txt.events.onInputUp.add(callback);
		txt.events.onInputOver.add(BasicGame.onOver);
		txt.events.onInputOut.add(BasicGame.onOut);
	},

	update: function() {
	}
};