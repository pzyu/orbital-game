

// Constructor takes in game, x and y position, atlas name, duration of animation, whether effect is a projectile
BasicGame.Effect = function (game, x, y, atlasName, isProjectile, loopCount, frame) {
	Phaser.Sprite.call(this, game, x, y, atlasName, frame);

	this.scale.x = 0.4;
	this.scale.y = 0.4;

	this.x = -100;
	this.y = -100;

	// Default loop count is 0
	this.loopCount = 0;

	this.isProjectile = isProjectile;
	// If it is a projectile, then enable arcade physics
	if (this.isProjectile) {
		this.game.physics.arcade.enableBody(this);
		this.body.collideWorldBounds = true;

		this.body.velocity.x = 500;
		this.body.allowGravity = false;
		//this.body.bounce.setTo(1, 1);

		// Only assign it if it's a projectile
		this.loopCount = loopCount;
	}


	if (atlasName === 'blood_effect_sprite') {
		this.anchor.setTo(0.25, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('blood ', 1, 6), 16, false);		// Splatter 1
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('blood ', 7, 12), 16, false);		// Splatter 2
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('blood ', 13, 18), 16, false);	// Splash upwards
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('blood ', 19, 24), 16, false);	// Splash downwards
		this.animations.add('anim_5', Phaser.Animation.generateFrameNames('blood ', 25, 32), 16, false);	// Drip
		this.animations.add('anim_6', Phaser.Animation.generateFrameNames('blood ', 33, 40), 16, true);		// Projectile
		this.animations.add('anim_7', Phaser.Animation.generateFrameNames('blood ', 41, 48), 16, false);	// Ground splatter
		this.animations.add('anim_8', Phaser.Animation.generateFrameNames('blood ', 49, 56), 16, false);	// Upward spurt
		this.animations.add('anim_9', Phaser.Animation.generateFrameNames('blood ', 57, 64), 16, false);	// Splatter 3
	} 

	if (atlasName == 'bolt_effect_sprite') {
		this.anchor.setTo(0, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('bolt ', 1, 10), 16, true);		// Projectile
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('bolt ', 11, 20), 16, false);		// Field
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('bolt ', 21, 30), 16, false);		// Strike 1
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('bolt ', 31, 40), 16, false);		// Strike 2
	}

	//this.animations.play('anim_1');
	this.target = null;
}

// Effect is declared as a Sprite so it will only have Sprite attributes
BasicGame.Effect.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Effect.prototype.constructor = BasicGame.Effect;

BasicGame.Effect.prototype.update = function() {
	//if (this.animations.currentAnim.isPlaying) {
	//}
	// Only update if it's not a projectile
	if (!this.isProjectile) {
		if (this.target != null && this.animations.currentAnim.isPlaying) {

			/*//console.log(this.target.x + ", " + this.target.y);
			if (this.animations.currentAnim.name === "anim_1") {
				var test = this.game.add.tween(this);
				test.to({x: this.target.x + 1000 * this.scale.x * 2.5}, 300, Phaser.Easing.Linear.None);
				test.start();
			} else {
				this.x = this.target.x;
				this.y = this.target.y;
			}*/
		}
	}
};	

BasicGame.Effect.prototype.animationComplete = function() {
	//console.log(this.animations.currentAnim.name + " complete");
	this.x = -100;
	this.y = -100;

	// If it is a projectile, then destroy on complete
	if (this.isProjectile) {
		this.destroy();
	}
};

BasicGame.Effect.prototype.animationLoop = function() {
	if (this.animations.currentAnim.loopCount > this.loopCount) {
		console.log('destroy');
		//console.log(this);
		this.animations.currentAnim.isFinished = true;
		this.animations.currentAnim.loop = false;
	}
};

// Takes in an animation string name, and target instantiated on
BasicGame.Effect.prototype.play = function(anim, target) {
	//console.log(this.animations.currentAnim.name + " playing");
	this.target = target;

	this.x = this.target.x;
	this.y = this.target.y;

	// Correct direction and velocity
	if (this.correctDirection(this.target)) {
		this.body.velocity.x *= -1;
	}
	
	//console.log(target);
	this.animations.play(anim);

	// On complete, callback and set position offscreen
	this.animations.currentAnim.onComplete.add(this.animationComplete, this);
	this.animations.currentAnim.onLoop.add(this.animationLoop, this);
};

// Takes in a target sprite and corrects own sprite direction
// Returns true if facing left, false if facing right
BasicGame.Effect.prototype.correctDirection = function(target) {
	if(this.target.scale.x < 0) {
		this.scale.x = -0.4;
		return true;
	} else {
		this.scale.x = 0.4;
		return false;
	}
}
