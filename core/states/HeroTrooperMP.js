'use strict';
BasicGame.HeroTrooperMP = function (id, game) {
	Phaser.Sprite.call(this, game, 200, 200, 'player_trooper', 0);
	this.ID = id;
	console.log('creating player');

	this.cursor = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false
	}

	this.input = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false
	}

	this.name = name;
	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 2;
	this.jumpTimer = 0;
	this.jumpStrength = -1500;
	this.moveSpeed = 800;
	this.facingRight = 1;

	// Enable physics
	this.game.physics.arcade.enableBody(this);

	// Set invidual scale and collider
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	this.body.setSize(70, 130, -35, -10);
	this.body.maxVelocity.y = 3000;
	this.body.drag.x = 5000;
	this.body.drag.y = 5000;

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	// Add this object into existing game
	this.game.add.existing(this);

	this.refMP = this.game.state.states['Multiplayer'];
};

// Kind of like inherts Sprite
BasicGame.HeroTrooperMP.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroTrooperMP.prototype.constructor = BasicGame.Player;

BasicGame.HeroTrooperMP.prototype.update = function() {
	this.handleControls();
	this.game.debug.body(this);
};


BasicGame.HeroTrooperMP.prototype.handleControls = function() {
	this.input.left = this.cursors.left.isDown;
	this.input.right = this.cursors.right.isDown;
	this.input.up = this.cursors.up.isDown;
	this.input.down = this.cursors.down.isDown;
	this.input.skillA = this.skillA.isDown;
	this.input.skillB = this.skillB.isDown;
	this.input.skillC = this.skillC.isDown;
	this.input.skillD = this.skillD.isDown;


	/*for (var i in this.input) {
		this.cursor[i] = this.input[i];
	}*/
	var inputChanged = (
		this.cursor.left != this.input.left ||
		this.cursor.right != this.input.right ||
		this.cursor.up != this.input.up ||
		this.cursor.down != this.input.down ||
		this.cursor.skillA != this.input.skillA ||
		this.cursor.skillB != this.input.skillB ||
		this.cursor.skillC != this.input.skillC ||
		this.cursor.skillD != this.input.skillD
	);
	//console.log(inputChanged);

	if (inputChanged) {
		//console.log(this.ID + " " + BasicGame.Multiplayer.myID);
		if (this.ID == this.refMP.myID) {
			//this.input.left = this.left;
			//this.input.right = this.right;

			this.refMP.eurecaServer.handleKeys(this.input);
		}
	}

	if (this.cursor.left) {
		this.body.velocity.x = -this.moveSpeed;
	} else if (this.cursor.right) {
		this.body.velocity.x = this.moveSpeed;
	}
	if (this.cursor.up) {
		this.body.velocity.y = this.jumpStrength;
	}
	if(this.cursor.down) {
		this.body.velocity.y = -this.jumpStrength;
	}
};

BasicGame.HeroTrooperMP.prototype.kill = function() {
	this.kill();
};
