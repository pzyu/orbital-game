BasicGame.MainGame = function (game) {
};

var map, p, layer, cursors;
var player;
BasicGame.MainGame.prototype = {
	preload: function() {
	},

	create: function() {
		this.physics.startSystem(Phaser.Physics.ARCADE);
		this.stage.backgroundColor = '#787878';

		map = this.add.tilemap('map');
		map.addTilesetImage('sheet', 'tiles');

		var background = map.createLayer('Background');
		background.resizeWorld();
		background.wrap = true;

		layer = map.createLayer('Level 1');
		layer.resizeWorld();
		layer.wrap = true;

		map.setCollisionBetween(0, 60, true, layer);
		map.setCollisionBetween(63, 99, true, layer);

		//layer.debug = true;
		this.physics.arcade.gravity.y = 1500;

		this.player = new BasicGame.Hero(this.game, 100, 1000);
		this.game.add.existing(this.player);
		this.camera.follow(this.player);
	},

	update: function() {
		this.physics.arcade.collide(p, layer);
		this.physics.arcade.collide(this.player, layer);
	},

	render: function() {
		//game.debug.bodyInfo(this.player, 32, 32);
		//game.debug.body(this.player);
	}
};