'use strict';
var cursors, jumpButton;
var jumpTimer, slideTimer;
var jumpAnim;
var jumpCount, jumpLimit;
var effect;

BasicGame.Hero = function (game, x, y, frame, isDummy, name) {
	//console.log(BasicGame.CharSelect.prototype);
	Phaser.Sprite.call(this, game, x, y, BasicGame.selectedChar, frame);
	this.isDummy = isDummy;
	this.name = name;
	console.log(this.name);

	// Max jumps
	this.jumpCount = 0;
	this.jumpLimit = 2;
	this.jumpTimer = 0;
	this.jumpStrength = -1200;
	this.moveSpeed = 800;
	this.skillACooldown = 1000;
	this.skillBCooldown = 1000;
	this.skillCCooldown = 1000;
	this.skillDCooldown = 1000;

	// Enable physics
	this.game.physics.arcade.enableBody(this);

	// Set invidual scale and collider
	if (BasicGame.selectedChar === "player_ninja") {
		this.scaleX = 0.32;
		this.scaleY = 0.32;
		this.body.setSize(220, 440, 0, -5);
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

	// Set scale
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	// Add animations of player, can refer to json
	// generateFrameNames takes in a suffix, followed by range of index, so for example ('Idle ', 1, 10) will produce an 
	// array ['Idle 1', 'Idle 2', ..... 'Idle 10'] to automate it for you
	// 16 is frame rate, boolean is whether animation should loop
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Walk__00', 0, 9), 16, true);
	this.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Shoot__00', 0, 9), 16, false);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Jump__00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Dead__00', 0, 9), 16, false);


	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.jumpButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	this.skillATimer = 0;
	this.skillBTimer = 0;
	this.skillCTimer = 0;
	this.skillDTimer = 0;

	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.attackAnim = this.animations.getAnimation('anim_attack');
	this.attackAnim.onComplete.add(this.attackCallback, this);

	// Effect
	this.effectName = 'anim_';
	this.effectCount = 1;
	this.effectTimer = 0;

	// Add this object into existing game
	this.game.add.existing(this);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'blood_effect_sprite', false, 0);
	this.game.add.existing(this.effect);


    this.attackCollider = new BasicGame.Collider(this.game, this);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

	this.facingRight = 1;
}

// Kind of like inherts Sprite
BasicGame.Hero.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Hero.prototype.constructor = BasicGame.Player;

BasicGame.Hero.prototype.update = function() {
	if (!this.isDummy) {
		this.handleControls();
		//this.game.debug.body(this);
	} else {
		this.animations.play('anim_idle');
		//this.game.debug.spriteInfo(this, 32, 32);
		this.game.debug.body(this);
	}
};


BasicGame.Hero.prototype.handleControls = function() {
	this.body.velocity.x = 0;

    if (this.skillA.isDown && this.game.time.now > this.effectTimer) {

    	/*this.effect.play(this.effectName + this.effectCount, this);
    	this.effectCount++;
    	if (this.effectCount > 4) {
    		this.effectCount = 1;
    	}*//*
		var test = this.game.add.tween(this.body.velocity);
		test.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		test.start();

    	// Play the animation
    	this.animations.play('anim_attack');

    	var projectile = new BasicGame.Effect(this.game, this.x, this.y, 'bolt_effect_sprite', true, 1);
    	this.game.add.existing(projectile);
    	projectile.play('anim_1', this);

    	BasicGame.projectileCG.add(projectile);

    	this.effectTimer = this.game.time.now + 500;
    	this.jumpCount = 0;*/
    }
    this.handleSkillA();
    this.handleSkillB();

	// If moving left
	if (this.cursors.left.isDown && !this.attackAnim.isPlaying) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}

	} else if (this.cursors.right.isDown && !this.attackAnim.isPlaying) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	} 
	//console.log(jumpCount);

	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.cursors.up.isDown  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit)
    {
    	if (this.jumpCount > 0) {
    		//this.animations.stop(null, true);
    		this.jumpAnim.frame = 0;
    	}
    	//console.log("jump");
        this.body.velocity.y = this.jumpStrength;
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
};

BasicGame.Hero.prototype.handleSkillA = function() {
	if (this.skillA.isDown && this.game.time.now > this.skillATimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_attack');
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
	}

};

BasicGame.Hero.prototype.handleSkillB = function() {
	if (this.skillB.isDown && this.game.time.now > this.skillBTimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 2000 * this.facingRight}, 100, Phaser.Easing.Linear.None);
		skillTween.to({y: -2000}, 10, Phaser.Easing.Linear.None);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_attack');
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 
		this.attackCollider.activate();   
	}

};

BasicGame.Hero.prototype.attackCallback = function() {
	this.attackCollider.deactivate();
};

BasicGame.Hero.prototype.getHit = function() {
	this.effect.play('anim_4', this);
};

BasicGame.Hero.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
}