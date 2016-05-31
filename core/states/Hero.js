'use strict';
var cursors, jumpButton;
var jumpTimer, slideTimer;
var jumpAnim;
var jumpCount, jumpLimit;
var effect;

BasicGame.Hero = function (game, x, y, frame) {
	Phaser.Sprite.call(this, game, x, y, 'player_sprite', frame);

	// Set anchor to middle
	this.anchor.setTo(0.5, 0.5);

	// Set scale of player
	this.scale.x = 0.2;
	this.scale.y = 0.2;

	// Add animations of player, can refer to json
	// generateFrameNames takes in a suffix, followed by range of index, so for example ('Idle ', 1, 10) will produce an 
	// array ['Idle 1', 'Idle 2', ..... 'Idle 10'] to automate it for you
	// 16 is frame rate, boolean is whether animation should loop
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Run ', 1, 8), 16, true);
	this.animations.add('anim_walk', Phaser.Animation.generateFrameNames('Walk ', 1, 10), 16, true);
	this.animations.add('anim_slide', Phaser.Animation.generateFrameNames('Slide ', 1, 10), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Jump ', 1, 10), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Dead ', 1, 10), 16, false);

	// Enable physics
	this.game.physics.arcade.enableBody(this);

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.attackButton = this.game.input.keyboard.addKey(Phaser.Keyboard.A);

	this.jumpAnim = this.animations.getAnimation('anim_jump');

	this.jumpTimer = 0;
	this.slideTimer = 0;

	// max jumps
	this.jumpCount = 0;
	this.jumpLimit = 2;

	// Change collider size
	this.body.setSize(300, 640, -10, -1);
	this.body.maxVelocity.y = 600;

	this.effectName = 'anim_';
	this.effectCount = 1;
	this.effectTimer = 0;

	// Add this object into existing game
	this.game.add.existing(this);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'bolt_effect_sprite', false, 0);
	this.game.add.existing(this.effect);
}

// Kind of like inherts Sprite
BasicGame.Hero.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Hero.prototype.constructor = BasicGame.Player;

BasicGame.Hero.prototype.update = function() {
	this.handleControls();
	this.game.debug.spriteInfo(this, 32, 32);
	this.game.debug.body(this);
};


BasicGame.Hero.prototype.handleControls = function() {
	this.body.velocity.x = 0;

	// If moving left
	if (this.cursors.left.isDown) {
		// Change scale to -ve so it'll face left
		this.scale.x = -0.2;
		this.body.velocity.x = -500;

	    // Slide
	    if (this.cursors.down.isDown && this.game.time.now > this.slideTimer) {
	    	this.body.velocity.x *= 1.5;
	    	this.slideTimer = this.game.time.now + 750;
			this.animations.play('anim_slide');	
	    } else if (this.body.onFloor() && !this.cursors.down.isDown) {
			this.animations.play('anim_run');	
		}


	} else if (this.cursors.right.isDown) {
		this.scale.x = 0.2;
		this.body.velocity.x = 500;

	    // Slide
	 	if (this.cursors.down.isDown && this.game.time.now > this.slideTimer) {
	    	this.body.velocity.x *= 1.5;
	    	this.slideTimer = this.game.time.now + 750;
			this.animations.play('anim_slide');	
	    } else if (this.body.onFloor() && !this.cursors.down.isDown) {
			this.animations.play('anim_run');	
		}
	} 
	//console.log(jumpCount);

	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.jumpButton.isDown  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit)
    {
    	console.log("jump");
    	console.log(this.jumpCount);
        this.body.velocity.y = -600;
        this.jumpTimer = this.game.time.now + 350;
		this.animations.play('anim_jump');
		this.jumpCount++;
    }
    // Idle | if not moving and on the floor
    else if (this.body.velocity.x == 0 && this.body.onFloor()) {
    	this.animations.play('anim_idle');
    } 
    else if (this.body.onFloor()) {
    	this.jumpCount = 0;
    }

    if (this.attackButton.isDown && this.game.time.now > this.effectTimer) {

    	/*this.effect.play(this.effectName + this.effectCount, this);
    	this.effectCount++;
    	if (this.effectCount > 4) {
    		this.effectCount = 1;
    	}*/

    	var projectile = new BasicGame.Effect(this.game, this.x, this.y, 'bolt_effect_sprite', true, 1);
    	this.game.add.existing(projectile);
    	projectile.play('anim_1', this);

    	this.effectTimer = this.game.time.now + 500;
    }

}

BasicGame.Hero.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
}