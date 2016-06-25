BasicGame.Collider = function (game, target) {
    Phaser.Sprite.call(this, game, -100, -100);
    this.anchor.setTo(0.5, 0.5);

	this.game.physics.arcade.enableBody(this);
	this.body.setSize(100, 100, 0, 0);
	this.body.allowGravity = false;

	this.target = target;

	this.isActive = false;
};
 
BasicGame.Collider.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Collider.prototype.constructor = BasicGame.Collider;

BasicGame.Collider.prototype.update = function() {
	// If it's active track target
	if(this.isActive) {
		this.x = this.target.x;
		this.y = this.target.y;
		this.body.offset.x = this.body.width/2 * this.target.facingRight;
		this.body.velocity.x = 1000 * this.target.facingRight;
		
	} else {
		// Otherwise go out of screen.
		this.x = this.y = -100;
	}

	this.game.debug.body(this);
};

BasicGame.Collider.prototype.activate = function() {
	this.isActive = true;
};

BasicGame.Collider.prototype.deactivate = function() {
	this.isActive = false;
};

BasicGame.Collider.prototype.onCollide = function(collider) {
	if (collider != this.target) {
		this.isActive = false;
		collider.getHit();
	}
};





