BasicGame.Effect = function (game, x, y, atlas_name, frame) {
	Phaser.Sprite.call(this, game, x, y, atlas_name, frame);

	this.scale.x = 0.4;
	this.scale.y = 0.4;

	this.x = -100;
	this.y = -100;

	if (atlas_name === 'blood_effect_sprite') {
		this.anchor.setTo(0.25, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('blood ', 1, 6), 16, false);		// Splatter 1
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('blood ', 7, 12), 16, false);		// Splatter 2
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('blood ', 13, 18), 16, false);	// Splash upwards
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('blood ', 19, 24), 16, false);	// Splash downwards
		this.animations.add('anim_5', Phaser.Animation.generateFrameNames('blood ', 25, 32), 16, false);	// Drip
		this.animations.add('anim_6', Phaser.Animation.generateFrameNames('blood ', 33, 40), 16, false);	// Projectile
		this.animations.add('anim_7', Phaser.Animation.generateFrameNames('blood ', 41, 48), 16, false);	// Ground splatter
		this.animations.add('anim_8', Phaser.Animation.generateFrameNames('blood ', 49, 56), 16, false);	// Upward spurt
		this.animations.add('anim_9', Phaser.Animation.generateFrameNames('blood ', 57, 64), 16, false);	// Splatter 3
	} 

	if (atlas_name == 'bolt_effect_sprite') {
		this.anchor.setTo(0, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('bolt ', 1, 10), 16, false);		// Projectile
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('bolt ', 11, 20), 16, false);		// Field
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('bolt ', 21, 30), 16, false);		// Strike 1
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('bolt ', 31, 40), 16, false);		// Strike 2
	}

	this.animations.play('anim_1');
	this.target = null;
}

BasicGame.Effect.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Effect.prototype.constructor = BasicGame.Effect;

BasicGame.Effect.prototype.preload = function() {
};

BasicGame.Effect.prototype.update = function() {
	//if (this.animations.currentAnim.isPlaying) {
	//}
	if (this.target != null && this.animations.currentAnim.isPlaying) {
		if(this.target.scale.x < 0) {
			this.scale.x = -0.4;
		} else {
			this.scale.x = 0.4;
		}

		//console.log(this.target.x + ", " + this.target.y);
		if (this.animations.currentAnim.name === "anim_1") {
			var test = this.game.add.tween(this);
			test.to({x: this.target.x + 1000 * this.scale.x * 2.5}, 300, Phaser.Easing.Linear.None);
			test.start();
		} else {
			this.x = this.target.x;
			this.y = this.target.y;
		}
	}
};	

BasicGame.Effect.prototype.animationComplete = function() {
	//console.log(this.animations.currentAnim.name + " complete");
	this.x = -100;
	this.y = -100;
};

BasicGame.Effect.prototype.play = function(x, y, anim, target) {
	//console.log(this.animations.currentAnim.name + " playing");
	this.target = target;

	this.x = this.target.x;
	this.y = this.target.y;
	
	//console.log(target);
	this.animations.play(anim);

	// On complete, callback and set position offscreen
	this.animations.currentAnim.onComplete.add(this.animationComplete, this);
}
