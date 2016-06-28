
// Constructor takes in game, x and y position, atlas name, duration of animation, whether effect is a projectile
BasicGame.Effect = function (game, x, y, atlasName, loopCount, scale) {
	Phaser.Sprite.call(this, game, x, y, atlasName, 0);

	this.scale.x = this.scale.y = scale;
	this.scaleX = this.scale.x;
	// this.scale.x = 0.4;
	// this.scale.y = 0.4;

	this.x = -100;
	this.y = -100;

	// Default loop count is 0
	this.loopCount = 0;

	if (atlasName === 'blood_effect_sprite') {
		this.anchor.setTo(0.5, 0.5);

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
		this.anchor.setTo(0.5, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('bolt ', 1, 10), 16, true);		// Projectile
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('bolt ', 11, 20), 16, false);		// Field
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('bolt ', 21, 30), 16, false);		// Strike 1
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('bolt ', 31, 40), 16, false);		// Strike 2
	}

	if (atlasName == 'muzzle_effect_sprite') {
		this.anchor.setTo(0.5, 0.5);
		
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('BlueMuzzle__00', 0, 9), 60, false);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('YellowMuzzle__00', 0, 9), 60, false);
	}

	//this.animations.play('anim_1');
	this.target = null;

	this.offX = 0;
	this.offY = 0;
}

// Effect is declared as a Sprite so it will only have Sprite attributes
BasicGame.Effect.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Effect.prototype.constructor = BasicGame.Effect;

BasicGame.Effect.prototype.update = function() {
	//this.game.debug.body(this);
	// Follow player when playing
	if (this.animations.currentAnim.isPlaying) {
		this.x = this.target.x + this.offX * this.target.facingRight;
		this.y = this.target.y + this.offY;
		this.scale.x = this.scaleX * this.target.facingRight;
	}
};	

BasicGame.Effect.prototype.animationComplete = function() {
	this.x = this.y = -100;
};

BasicGame.Effect.prototype.animationLoop = function() {
	// When animation has go past loop count, end animation
	if (this.animations.currentAnim.loopCount > this.loopCount) {
		this.endAnimation();
	}
};

// Takes in an animation string name, and target instantiated on
BasicGame.Effect.prototype.play = function(anim, target, offX, offY) {
	//var offset = 0 + offX;
	//	console.log(loadingText);
	//console.log(this.animations.currentAnim.name + " playing");
	this.reset(this.x, this.y);

	this.target = target;

	this.offX = offX;
	this.offY = offY;

	//this.x = this.target.x + offset * this.target.facingRight;
	//this.y = this.target.y + offY;

	//this.scale.x = this.scaleX * this.target.facingRight;

	//console.log(target);
	this.animations.play(anim);

	// On complete, callback and set position offscreen
	this.animations.currentAnim.onComplete.add(this.animationComplete, this);
	this.animations.currentAnim.onLoop.add(this.animationLoop, this);
};

// Ends animation safely
BasicGame.Effect.prototype.endAnimation = function () {
	// Tell animation that it has finished, and to stop looping
	this.animations.currentAnim.isFinished = true;
	this.animations.currentAnim.loop = false;
};
