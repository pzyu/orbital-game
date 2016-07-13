BasicGame.Collider = function (game, target, width, height, offsetX, offsetY, force, scale, sprite) {
    Phaser.Sprite.call(this, game, -100, -100, sprite);

    this.scaleX = scale;
    this.scale.setTo(scale, scale);
    this.anchor.setTo(1.0, 1.0);
    this.force = force;

	this.game.physics.arcade.enableBody(this);
	this.body.setSize(width, height, 0, offsetY);
	this.body.allowGravity = false;

	this.offX = offsetX;
	this.target = target;

	this.isActive = false;
};
 
BasicGame.Collider.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Collider.prototype.constructor = BasicGame.Collider;

BasicGame.Collider.prototype.update = function() {
	// If it's active track target
	if(this.isActive) {
		this.x = this.target.x + this.offX * this.target.facingRight;
		this.y = this.target.y;
		this.scale.x = this.scaleX * this.target.facingRight;
		//this.body.offset.x = this.offX * this.target.facingRight;
		//this.body.velocity.x = 10 * this.target.facingRight;
		
	} else {
		// Otherwise go out of screen.
		this.x = this.y = -100;
	}

	// this.game.debug.body(this);
};

BasicGame.Collider.prototype.activate = function() {
	this.isActive = true;
};

BasicGame.Collider.prototype.deactivate = function() {
	this.x = this.y = -100;
	this.isActive = false;
};

// BasicGame.Collider.prototype.onCollide = function(collider) {
// 	if (collider != this.target) {
// 		this.isActive = false;
// 		collider.getHit(this.force * this.target.facingRight, this.force);
// 	}
// };





