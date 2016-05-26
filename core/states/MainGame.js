BasicGame.MainGame = function (game) {
	this.gravity = 1500;
};

var map, p, layer, cursors;
var player;
BasicGame.MainGame.prototype = {
	preload: function() {
	},

	create: function() {
		// Start physics
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.physics.arcade.gravity.y = this.gravity;

		// Set background color
		this.stage.backgroundColor = '#787878';

		// Add tilemap
		map = this.add.tilemap('map');					// 'map' must be same as the one in Boot.js
		map.addTilesetImage('sheet', 'tiles');			// 'sheet' must be the same also

		var background = map.createLayer('Background');	// 'Background' must be the same in the json file
		background.resizeWorld();
		background.wrap = true;

		layer = map.createLayer('Level 1');				// 'Level 1' must be the same in the json file
		layer.resizeWorld();
		layer.wrap = true;

		map.setCollisionBetween(0, 60, true, layer);	// Set collision layers between json tile representation
		map.setCollisionBetween(63, 99, true, layer);

		//layer.debug = true;

		// Instantiate new player
		this.player = new BasicGame.Hero(this.game, 100, 1000);
		this.game.add.existing(this.player);
		this.camera.follow(this.player);
	},

	update: function() {
		// Enable collision between player and layer
		this.physics.arcade.collide(this.player, layer);
	},

	render: function() {
		//game.debug.bodyInfo(this.player, 32, 32);
		//game.debug.body(this.player);
	}
};