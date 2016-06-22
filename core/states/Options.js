// For every state, you just call BasicGame.StateName
BasicGame.Options = function (game) {
	console.log('options working');
};



BasicGame.Options.prototype = {
	init: function() {
	},


	preload: function() {

		// Use same background as main menu
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;
	},

	create:  function() {
		var ref = this;
		
		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		var txt = this.add.text(this.world.width - this.world.width/2.5, this.world.height/2  + 300,  "Back to main menu", optionStyle);
		txt.inputEnabled = true;
		txt.events.onInputUp.add(function() {
			ref.game.state.start("MainMenu", true);
		});
	},

	update: function() {
	}
};