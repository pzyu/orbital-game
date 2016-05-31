'use strict';
var cursors, jumpButton;
var jumpTimer, slideTimer;
var jumpAnim;
var jumpCount, jumpLimit;
var effect;

BasicGame.Hero = function (game, x, y, frame) {
	//console.log(BasicGame.CharSelect.prototype);
	Phaser.Sprite.call(this, game, x, y, BasicGame.selectedChar, frame);

	// Enable physics
	this.game.physics.arcade.enableBody(this);

	// Set invidual scale and collider
	if (BasicGame.selectedChar === "player_ninja") {
		this.scaleX = 0.32;
		this.scaleY = 0.32;
		this.body.setSize(220, 440, 0, 0);
	} else if (BasicGame.selectedChar === "player_robot") {
		this.scaleX = 0.3;
		this.scaleY = 0.3;
		this.body.setSize(230, 470, 0, 0);
	} else if (BasicGame.selectedChar === "player_cowgirl") {
		this.scaleX = 0.3;
		this.scaleY = 0.3;
		this.body.setSize(250, 470, 0, 0);
	} else {
		this.scaleX = 0.25;
		this.scaleY = 0.25;
		this.body.setSize(300, 540, 0, 5);
	}

	// Set anchor to middle
	this.anchor.setTo(0.5, 0.5);

	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	// Add animations of player, can refer to json
	// generateFrameNames takes in a suffix, followed by range of index, so for example ('Idle ', 1, 10) will produce an 
	// array ['Idle 1', 'Idle 2', ..... 'Idle 10'] to automate it for you
	// 16 is frame rate, boolean is whether animation should loop
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Run ', 1, 8), 16, true);
	this.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, false);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Jump ', 1, 10), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Dead ', 1, 10), 16, false);


	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.attackButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.attackAnim = this.animations.getAnimation('anim_attack');

	this.jumpTimer = 0;
	this.slideTimer = 0;

	// max jumps
	this.jumpCount = 0;
	this.jumpLimit = 2;

	this.body.maxVelocity.y = 1000;
	this.body.bounce.set(0.1, 0);

	this.effectName = 'anim_';
	this.effectCount = 1;
	this.effectTimer = 0;

	// Add this object into existing game
	this.game.add.existing(this);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'bolt_effect_sprite', false, 0);
	this.game.add.existing(this.effect);

	this.facingRight = 1;
}

// Kind of like inherts Sprite
BasicGame.Hero.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Hero.prototype.constructor = BasicGame.Player;

BasicGame.Hero.prototype.update = function() {
	this.handleControls();
	//this.game.debug.spriteInfo(this, 32, 32);
	this.game.debug.body(this);
};


BasicGame.Hero.prototype.handleControls = function() {
	this.body.velocity.x = 0;


    if (this.attackButton.isDown && this.game.time.now > this.effectTimer) {

    	/*this.effect.play(this.effectName + this.effectCount, this);
    	this.effectCount++;
    	if (this.effectCount > 4) {
    		this.effectCount = 1;
    	}*/
		var test = this.game.add.tween(this.body.velocity);
		test.to({x: 1000 * this.facingRight}, 250, Phaser.Easing.Cubic.In);
		test.start();

    	this.animations.play('anim_attack');
    	var projectile = new BasicGame.Effect(this.game, this.x, this.y, 'bolt_effect_sprite', true, 1);
    	this.game.add.existing(projectile);
    	projectile.play('anim_1', this);

    	BasicGame.projectileCG.add(projectile);

    	this.effectTimer = this.game.time.now + 500;
    	this.jumpCount = 0;
    }

	// If moving left
	if (this.cursors.left.isDown && !this.attackAnim.isPlaying) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
		this.body.velocity.x = -500;

	} else if (this.cursors.right.isDown && !this.attackAnim.isPlaying) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
		this.body.velocity.x = 500;
	} 
	//console.log(jumpCount);

	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.cursors.up.isDown  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit)
    {
    	console.log("jump");
        this.body.velocity.y = -600;
        this.jumpTimer = this.game.time.now + 350;
		this.animations.play('anim_jump');
		this.jumpCount++;
    }
    // Idle | if not moving and on the floor
    else if (this.body.velocity.x == 0 && this.body.onFloor()  && !this.attackAnim.isPlaying) {
    	this.animations.play('anim_idle');
    	this.jumpCount = 0;
    } 
    else if (this.body.onFloor()) {
    	this.jumpCount = 0;
    }
}

BasicGame.Hero.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
}