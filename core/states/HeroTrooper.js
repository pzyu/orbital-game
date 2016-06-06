'use strict';
BasicGame.HeroTrooper = function (game, x, y, frame, isDummy, name) {
	Phaser.Sprite.call(this, game, x, y, 'player_trooper', frame);
	this.isDummy = isDummy;
	this.name = name;
	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 2;
	this.jumpTimer = 0;
	this.jumpStrength = -1500;
	this.moveSpeed = 800;
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

	this.body.setSize(70, 130, -35, -10);
	this.body.maxVelocity.y = 3000;

	// Add animations of player, can refer to json
	// generateFrameNames takes in a suffix, followed by range of index, so for example ('Idle ', 1, 10) will produce an 
	// array ['Idle 1', 'Idle 2', ..... 'Idle 10'] to automate it for you
	// 16 is frame rate, boolean is whether animation should loop
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Trooper_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Trooper_Run_00', 0, 9), 16, true);
	this.animations.add('anim_thrust', Phaser.Animation.generateFrameNames('Anim_Trooper_Melee_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Trooper_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_walkshoot', Phaser.Animation.generateFrameNames('Anim_Trooper_WalkShoot_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Trooper_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Trooper_Dead_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate1', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchAim_00', 0, 9), 16, true);
	this.animations.add('anim_ultimate2', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchShoot_00', 0, 9), 16, false);

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_thrust');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate2');

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
};

// Kind of like inherts Sprite
BasicGame.HeroTrooper.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroTrooper.prototype.constructor = BasicGame.Player;

BasicGame.HeroTrooper.prototype.update = function() {
	if (!this.isDummy) {
		this.handleControls();
		this.game.debug.body(this);
	} else {
		this.animations.play('anim_idle');
		//this.game.debug.spriteInfo(this, 32, 32);
		//this.game.debug.body(this);
	}
};


BasicGame.HeroTrooper.prototype.handleControls = function() {
	this.body.velocity.x = 0;
	// If moving left
	if (this.cursors.left.isDown && !this.isAttacking && !this.skillB.isDown) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
    	this.body.offset.x = 35;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}

	} else if (this.cursors.right.isDown && !this.isAttacking && !this.skillB.isDown) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
    	this.body.offset.x = -35;
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
        this.body.velocity.y = this.jumpStrength;
        this.jumpTimer = this.game.time.now + 350;
		this.animations.play('anim_jump');
		this.jumpCount++;
    }
    // Idle | if not moving and on the floor
    else if (this.body.velocity.x == 0 && this.body.onFloor()  && !this.isAttacking && !this.skillB.isDown) {
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

BasicGame.HeroTrooper.prototype.handleSkillA = function() {
	if (this.skillA.isDown && this.game.time.now > this.skillATimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_thrust');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
	}
};

BasicGame.HeroTrooper.prototype.handleSkillB = function() {
	if (this.cursors.left.isDown && this.skillB.isDown) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
    	this.body.offset.x = 35;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_walkshoot');
		}
		
	} else if (this.cursors.right.isDown && this.skillB.isDown) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
    	this.body.offset.x = -35;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_walkshoot');	
		}
	} else {
		
	}
	if (this.skillB.isDown && this.game.time.now > this.skillBTimer) {
		this.animations.play('anim_shoot');
		this.skillBTimer = this.game.time.now + this.skillBCooldown;
		BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
	}

	//console.log(BasicGame.projectileCG.getFirstExists(false));
	//BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
};

BasicGame.HeroTrooper.prototype.handleSkillC = function() {
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

BasicGame.HeroTrooper.prototype.handleSkillD = function() {
	if (this.skillD.isDown && this.game.time.now > this.skillDTimer) {
    	// Play the animation
		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 

    	// Projectile variables
		var repeat = 0;
		var velX = 1500;
		var velY = 0;
		var angle = 0;
		var offsetX = 50;
		var offsetY = 0;

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 1000, Phaser.Easing.Linear.None, true, 200, repeat);
    	tween.onStart.add(function() {
    		ref.animations.play('anim_ultimate1');
    		ref.animations.currentAnim.frame = 0;
    		tween.delay(1000);
    	});
    	tween.onComplete.add(function() {
    		ref.animations.play('anim_ultimate2');
    		ref.animations.currentAnim.frame = 0;
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, velX, -velY, angle, offsetX, offsetY);
    	});
	}
};

BasicGame.HeroTrooper.prototype.attackCallback = function() {
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroTrooper.prototype.shootCallback = function() {
	this.isAttacking = false;
};

BasicGame.HeroTrooper.prototype.getHit = function() {
	this.effect.play('anim_4', this);
};

BasicGame.HeroTrooper.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
}