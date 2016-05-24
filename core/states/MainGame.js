BasicGame.MainGame = function (game) {
	console.log("It works");
};

BasicGame.MainGame.prototype = {
	preload: function() {
        this.map = this.game.add.tilemap('level1');
        this.map.addTilesetImage('tiles', 'gameTiles');
		console.log(this.map);
	}
};