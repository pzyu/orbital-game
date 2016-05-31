BasicGame.Multiplayer = function (game) {
};

BasicGame.Multiplayer.prototype.init = function() {

};

BasicGame.Multiplayer.prototype.preload = function() {
	var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
	var txt = this.add.text(this.world.width - this.world.width/2, this.world.height - 100,  "Back to main menu", optionStyle);
	txt.inputEnabled = true;
	txt.events.onInputUp.add(function() {
		this.game.state.start("MainMenu");
	});
};

BasicGame.Multiplayer.prototype.update = function() {

};