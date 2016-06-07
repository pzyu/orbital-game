'use strict';
BasicGame.HeroWalker = function (game, x, y, frame, isDummy, name) {
	Phaser.Sprite.call(this, game, x, y, 'player_walker', frame);
	this.isDummy = isDummy;
	this.name = name;
	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 1;
	this.jumpTimer = 0;
	this.jumpStrength = -2000;
	this.moveSpeed = 500;
	this.facingRight = 1;

	// Skills
	this.skillACooldown = 500;
	this.skillBCooldown = 500;
	this.skillCCooldown = 1000;
	this.skillDCooldown = 5000;	
	this.skillATimer = 0;
	this.skillBTimer = 0;
	this.skillCTimer = 0;
	this.skillDTimer = 0;

	// Enable physics
	this.game.physics.arcade.enableBody(this);

	// Set invidual scale and collider
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;
	this.bodyOffset = 10;

	this.body.setSize(160, 200, this.bodyOffset, -2);
	this.body.maxVelocity.y = 3000;
	this.body.drag.x = 5000;

	// Add animations of player, can refer to json
	// generateFrameNames takes in a suffix, followed by range of index, so for example ('Idle ', 1, 10) will produce an 
	// array ['Idle 1', 'Idle 2', ..... 'Idle 10'] to automate it for you
	// 16 is frame rate, boolean is whether animation should loop
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Walker_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Walker_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_backdash', Phaser.Animation.generateFrameNames('Anim_Walker_Backdash_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Walker_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Walker_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Walker_Dead_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Walker_Ultimate_00', 0, 9), 16, false);

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_backdash');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate');

    this.isAttacking = false;
	// Add callback
	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

	// Add this object into existing game
	this.game.add.existing(this);
	BasicGame.playerCG.add(this);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'bolt_effect_sprite', false, 0);
	this.game.add.existing(this.effect);

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);
    console.log(BasicGame.colliderCG.length);

    this.bulletGroup = this.game.add.group();
    for (var i = 0; i < 100; i++) {
    	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1);
    	BasicGame.projectileCG.add(proj);
    }
    // Maybe use queue
	console.log(BasicGame.projectileCG.length);
}

// Kind of like inherts Sprite
BasicGame.HeroWalker.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroWalker.prototype.constructor = BasicGame.Player;

BasicGame.HeroWalker.prototype.update = function() {
	if (!this.isDummy) {
		this.handleControls();
			this.game.debug.body(this);
	} else {
		this.animations.play('anim_idle');
		//this.game.debug.spriteInfo(this, 32, 32);
		//this.game.debug.body(this);
	}
};


BasicGame.HeroWalker.prototype.handleControls = function() {
	
	// If moving left
	if (this.cursors.left.isDown && !this.isAttacking) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
    	this.body.offset.x = this.bodyOffset;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}

	} else if (this.cursors.right.isDown && !this.isAttacking) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
    	this.body.offset.x = -this.bodyOffset;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	} 
	//console.log(jumpCount);

	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.cursors.up.isDown  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit && !this.isAttacking)
    {
    	if (this.jumpCount > 0) {
    		//this.animations.stop(null, true);
    		this.jumpAnim.frame = 0;
    	}
    	//console.log("jump");

        //this.body.velocity.y = this.jumpStrength;
		var jumpTween = this.game.add.tween(this.body.velocity);
		jumpTween.to({0: 0}, 250, Phaser.Easing.Linear.None, false, 300);
		jumpTween.start();
		var ref = this;
		ref.animations.play('anim_jump');
		ref.isAttacking = true;
		jumpTween.onStart.add(function() {
			ref.body.velocity.y = ref.jumpStrength;
        	ref.jumpTimer = ref.game.time.now + 350;
			ref.jumpCount++;
		});
		jumpTween.onComplete.add(function() {
			ref.isAttacking = false;
		});

        
    }
    // Idle | if not moving and on the floor
    else if (this.body.velocity.x == 0 && this.body.onFloor()  && !this.isAttacking) {
    	this.animations.play('anim_idle');
    	this.jumpCount = 0;
    } 
    else if (this.body.onFloor()) {
    	this.jumpCount = 0;
    }

    this.handleSkillA();
    this.handleSkillB();
    this.handleSkillC();
    this.handleSkillD();
};

BasicGame.HeroWalker.prototype.handleSkillA = function() {
	if (this.skillA.isDown && this.game.time.now > this.skillATimer) {
		this.isAttacking = true;

		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: -1500 * this.facingRight, y: -500}, 250, Phaser.Easing.Cubic.Out, false, 250);

		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_backdash');
    	//this.animations.currentAnim.frame = 0;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
	}
};

BasicGame.HeroWalker.prototype.handleSkillB = function() {
	if (this.skillB.isDown && this.game.time.now > this.skillBTimer) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 

		//console.log(BasicGame.projectileCG.getFirstExists(false));
    	BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
	}
};

BasicGame.HeroWalker.prototype.handleSkillC = function() {
	if (this.skillC.isDown && this.game.time.now > this.skillCTimer) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
		
		// Projectile variables
		var shootAmt = 3;
		var velX = 750;
		var velY = 500;
		var angle = 30;
		var offsetX = 150;
		var offsetY = 50;

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 200, shootAmt);
    	tween.onStart.add(function() {
    		tween.delay(0);
    	});
    	tween.onRepeat.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_4', ref, velX, -velY, -angle, offsetX, -offsetY);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_4', ref, velX, velY, angle, offsetX, offsetY);
    	});
	}
};

BasicGame.HeroWalker.prototype.handleSkillD = function() {
	if (this.skillD.isDown && this.game.time.now > this.skillDTimer) {
    	// Play the animation
    	this.animations.play('anim_ultimate');
    	this.animations.currentAnim.frame = 0;
    	this.animations.currentAnim.speed = 10;
		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 

    	// Projectile variables
		var shootAmt = 3;
		var velX = 500;
		var velY = -500;
		var angle = 0;
		var offsetX = 50;
		var offsetY = -50;

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 200, shootAmt);
    	tween.onStart.add(function() {
    		tween.delay(100);
    	});
    	tween.onRepeat.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_2', ref, -velX, 0, 		angle, 	-offsetX, 	0);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_2', ref, -velX, velY, 	angle, 	-offsetX, 	offsetY);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_2', ref, 0, 	velY,	angle, 	0, 			offsetY);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_2', ref, velX, 	velY, 	angle, 	offsetX, 	offsetY);
    		BasicGame.projectileCG.getFirstExists(false).play('anim_2', ref, velX, 	0, 		angle, 	offsetX, 	0);
    	});
	}
};

BasicGame.HeroWalker.prototype.attackCallback = function() {
	console.log('attack callback');
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroWalker.prototype.shootCallback = function() {
	console.log('shoot callback');
	this.isAttacking = false;
};

BasicGame.HeroWalker.prototype.getHit = function() {
	this.effect.play('anim_4', this);
};

BasicGame.HeroWalker.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
}