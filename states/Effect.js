// Constructor takes in game, x and y position, atlas name, duration of animation, whether effect is a projectile
BasicGame.Effect = function (game, effectName, loopCount, scale, trackTarget) {
	var key = effectName + '_effect_sprite';
	Phaser.Sprite.call(this, game, -200, -200, key, 0);

	if (effectName == "muzzle") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('muzzle_blue (', 1, 10, ')'), 60, false);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('muzzle_yellow (', 1, 10, ')'), 60, false);
	}

	if (effectName == "explosion") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('explosion_ground (', 1, 10, ')'), 60, false);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('explosion_air (', 1, 10, ')'), 60, false);
	}

	if (effectName == "blast") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('', 0, 7, ''), 16, false);
	}

	if (effectName == "beam") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('beam (', 1, 10, ')'), 60, true);
	}

	if (effectName == "slime") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('summon (', 1, 18, ')'), 16, true);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('slime_splash (', 1, 13, ')'), 16, false);
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('slimeball (', 1, 10, ')'), 16, true);
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('slime_idle (', 1, 10, ')'), 16, true);
		this.animations.add('anim_5', Phaser.Animation.generateFrameNames('slimeball_muzzle (', 1, 10, ')'), 16, false);
	}

	if (effectName == "ice") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('energy (', 1, 13, ')'), 16, true);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('ice_poof (', 1, 11, ')'), 16, false);
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('ice_summon (', 1, 26, ')'), 16, false);
	}

	if (effectName == "smoke") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('smoke (', 1, 10, ')'), 60, false);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('smoke_plume (', 1, 10, ')'), 60, false);
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('smoke_right (', 1, 10, ')'), 60, false);
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('smoke_up (', 1, 10, ')'), 60, false);
	}

	if (effectName == "slash") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('slash (', 1, 5, ')'), 16, false);
	}	

	if (effectName == "energy") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('energy (', 1, 13, ')'), 16, true);
	}


	if (effectName == "blood") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('blood (', 1, 5, ')'), 60, false);
	}

	if (effectName == "bolt") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('bolt_sizzle (', 1, 10, ')'), 16, true);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('bolt_strike (', 1, 10, ')'), 16, false);
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('bolt_tesla (', 1, 10, ')'), 16, true);
	}

	if (effectName == "fire") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('fire (', 1, 9, ')'), 60, false);
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('flamethrower (', 1, 29, ')'), 60, false);
	}

	if (effectName == "summon") {
		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('summon (', 1, 18, ')'), 16, true);
	}

	if (effectName == "beam") {
		this.anchor.setTo(0.0, 0.5); 
	} else {
		this.anchor.setTo(0.5, 0.5);
	}

	this.scale.x = this.scale.y = scale;
	this.scaleX = this.scale.x;
	// this.scale.x = 0.4;
	// this.scale.y = 0.4;
	this.trackTarget = trackTarget;
	this.isTracking = false;

	// Default loop count is 0
	this.loopCount = 0;
	this.target = null;

	this.offX = 0;
	this.offY = 0;

	if (!this.trackTarget) {
		this.kill();	
	}
	
	this.game.add.existing(this);
}

// Effect is declared as a Sprite so it will only have Sprite attributes
BasicGame.Effect.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Effect.prototype.constructor = BasicGame.Effect;

BasicGame.Effect.prototype.update = function() {
	//this.game.debug.body(this);
	// Follow player when playing
	if (this.animations.currentAnim && this.animations.currentAnim.isPlaying && this.trackTarget) {
	 	this.x = this.target.x + this.offX * this.target.facingRight;
	 	this.y = this.target.y + this.offY;
	 	this.scale.x = this.scaleX * this.target.facingRight;
	} else if (this.isTracking) {
		console.log('tracking');
	 	this.x = this.target.x + this.offX * this.target.facingRight;
	 	this.y = this.target.y + this.offY;
	 	this.scale.x = this.scaleX * this.target.facingRight;
	}
};	

BasicGame.Effect.prototype.animationComplete = function() {
	this.x = this.y = -200;
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

	//this.x = this.target.x + offX * this.target.facingRight;
	//this.y = this.target.y + offY;

	//this.scale.x = this.scaleX * this.target.facingRight;
	this.animations.play(anim);
	this.animations.currentAnim.frame = 0;

	// On complete, callback and set position offscreen
	this.animations.currentAnim.onComplete.add(this.animationComplete, this);
	this.animations.currentAnim.onLoop.add(this.animationLoop, this);
};

BasicGame.Effect.prototype.playUntracked = function(anim, x, y) {
	this.reset(x, y);
	this.animations.play(anim, 16, false, true);
};

BasicGame.Effect.prototype.playLooped = function(anim) {
	this.reset(-200, -200);
	this.animations.play(anim);
};

BasicGame.Effect.prototype.playTimed = function(anim, target, offX, offY, duration) {
	this.reset(-200, -200);
	this.offX = offX;
	this.offY = offY;
	this.target = target;
	this.isTracking = true;

	var tween = this.game.add.tween(this).to({0: 0}, duration, Phaser.Easing.Linear.None, true, 0);
	tween.onComplete.add(function() {
		this.isTracking = false;
		this.x = this.y = -200;
		this.animations.currentAnim._parent.kill();
	}, this);

	this.animations.play(anim);
	this.animations.currentAnim.frame = 0;
};

BasicGame.Effect.prototype.killAnim = function() {
	this.animations.currentAnim.x = this.animations.currentAnim.y = -200;
	this.animations.currentAnim._parent.kill();
};

// Ends animation safely
BasicGame.Effect.prototype.endAnimation = function () {
	// Tell animation that it has finished, and to stop looping
	this.animations.currentAnim.isFinished = true;
	this.animations.currentAnim.loop = false;
};
