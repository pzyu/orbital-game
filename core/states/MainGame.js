BasicGame.MainGame = function (game) {
	this.gravity = 2000;
};

BasicGame.MainGame.prototype = {
	preload: function() {
		//console.log(BasicGame.score);
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
		map.addTilesetImage('building_sheet', 'background_tiles');
		map.addTilesetImage('tiles_spritesheet', 'tiles_spritesheet');

		var background = map.createLayer('Background');	// 'Background' must be the same in the json file
		background.resizeWorld();
		background.wrap = true;

		layer = map.createLayer('Level 1');				// 'Level 1' must be the same in the json file
		layer.resizeWorld();
		layer.wrap = true;

		map.setCollisionBetween(0, 60, true, layer);	// Set collision layers between json tile representation
		map.setCollisionBetween(63, 99, true, layer);	

		//console.log(this.tilesCollisionGroup);

		// Assign global groups
		BasicGame.playerCG = this.add.group();
		BasicGame.projectileCG = this.add.group();

		// Instantiate new player
		this.player = new BasicGame.Hero(this.game, 100, 1000);
		BasicGame.playerCG.add(this.player);

		// Follow player
		this.camera.follow(this.player);
	},

	update: function() {
		// Enable collision between player and layer
		this.physics.arcade.collide(BasicGame.playerCG, layer);
		this.physics.arcade.collide(BasicGame.projectileCG, layer, this.projectileCallback);
	},

	render: function() {
		//game.debug.bodyInfo(this.player, 32, 32);
		//game.debug.body(this.player);
	},

	// Callback function for projectile collision
	projectileCallback: function(obj1, obj2) {
		obj1.onCollide();
	}
};