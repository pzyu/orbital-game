
// Constructor takes in game, x and y position, atlas name, duration of animation, whether effect is a projectile
BasicGame.Projectile = function (game, atlasName, loopCount, frame, target) {
	Phaser.Sprite.call(this, game, -100, -100, atlasName, frame);
	this.target = target;
	this.scale.x = 0.4;
	this.scale.y = 0.4;

	if (atlasName == 'bolt_effect_sprite') {
		this.anchor.setTo(0.5, 0.5);

		this.animations.add('anim_1', Phaser.Animation.generateFrameNames('bolt ', 1, 10), 16, true);		// Projectile
		this.animations.add('anim_2', Phaser.Animation.generateFrameNames('bolt ', 11, 20), 16, true);		// Field
		this.animations.add('anim_3', Phaser.Animation.generateFrameNames('bolt ', 21, 30), 16, false);		// Strike 1
		this.animations.add('anim_4', Phaser.Animation.generateFrameNames('bolt ', 31, 40), 16, false);		// Strike 2
	}

	this.game.physics.arcade.enableBody(this);
	//this.enableBody = true;

	this.body.setSize(150, 150, 0, 0);
	this.body.allowGravity = false;
	//this.body.bounce.setTo(1, 1);

	this.loopCount = loopCount;

	//this.checkWorldBounds = true;
	//this.outOfBoundsKill = true;
	// Kill first
	this.kill();

    this.game.add.existing(this);
}

// Effect is declared as a Sprite so it will only have Sprite attributes
BasicGame.Projectile.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Projectile.prototype.constructor = BasicGame.Projectile;

BasicGame.Projectile.prototype.update = function() {
	//this.game.debug.body(this);
};	

BasicGame.Projectile.prototype.animationComplete = function() {
	this.kill();
};

BasicGame.Projectile.prototype.animationLoop = function() {
	if (this.animations.currentAnim.loopCount > this.loopCount) {
		console.log('over');
		this.x = this.y = -100;
		this.endAnimation();
	}
};

// Takes in an animation string name, and target instantiated on
BasicGame.Projectile.prototype.play = function(anim, target, velX, velY, angle, offsetX, offsetY) {
	//	console.log(loadingText);
	//console.log(this.animations.currentAnim.name + " playing");
	this.reset(this.x, this.y);

	this.target = target;
	this.angle = angle * target.facingRight;
	this.x = this.target.x + offsetX;
	this.y = this.target.y + offsetY;

	this.body.velocity.x = velX;
	this.body.velocity.y = velY;

	// Correct collider velocity and offset
	if (this.correctDirection(this.target)) {
		this.body.velocity.x *= -1;
		this.body.offset.x *= -1;
		this.x -= offsetX * 2;
	}
	
	//console.log(target);
	this.animations.play(anim);

	// On complete, callback and set position offscreen
	//this.animations.currentAnim.onComplete.add(this.animationComplete, this);
	this.animations.currentAnim.onLoop.add(this.animationLoop, this);
};

// Takes in a target sprite and corrects own sprite direction
// Returns true if facing left, false if facing right
BasicGame.Projectile.prototype.correctDirection = function(target) {
	if(this.target.scale.x < 0) {
		this.scale.x = -0.4;
		return true;
	} else {
		this.scale.x = 0.4;
		return false;
	}
};

BasicGame.Projectile.prototype.onCollide = function (collider) {
	var test = new BasicGame.Effect(this.game, this.x, this.y, 'bolt_effect_sprite');
	this.game.add.existing(test);
	test.play('anim_2', this);
	//console.log(test);
	// Move the effect off screen first, then destroy safely
	this.x = this.y = -100;
	this.endAnimation();

	// If not yourself and exists in playerCG
	if (collider != this.target && BasicGame.playerCG.getIndex(collider) > -1) {
		this.isActive = false;
		collider.getHit();
	}
};

// Ends animation safely
BasicGame.Projectile.prototype.endAnimation = function () {
	this.animations.currentAnim.isFinished = true;
	this.animations.currentAnim.loop = false;
	console.log('collided');
	this.kill();
};
