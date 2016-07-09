'use strict';
BasicGame.HeroTrooperMP = function (id, game, x, y) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_trooper');

	// Collider size
	this.body.setSize(70, 140, 40, 10);

	// Hero attributes
	this.jumpStrength = -1500;
	this.moveSpeed = 1000;
	this.defaultMoveSpeed = this.moveSpeed;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;
	this.knockbackForce = 500;

    // Skill cooldowns in milliseconds
    this.skillACooldown = 500;
	this.skillBCooldown = 2000;
	this.skillCCooldown = 2000;
	this.skillDCooldown = 2000;	
	this.skillECooldown = 1000;

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 80, 100, 40, 0, 2000, 1);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

    // Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 'blood', 0, 0.4, true);
	this.hitAnim = "anim_1";

	this.smokeEffect = new BasicGame.Effect(this.game, 'smoke', 0, 0.4);
	this.slashEffect = new BasicGame.Effect(this.game, 'slash', 0, 0.3, true);
	this.snipeEffect = new BasicGame.Effect(this.game, 'bolt', 0, 0.4, true);
	this.game.add.existing(this.smokeEffect);
	this.game.add.existing(this.slashEffect);
	this.game.add.existing(this.snipeEffect);

    // Movement Animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Trooper_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Trooper_Run_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Trooper_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Trooper_Dead_00', 0, 9), 16, false);

	// Skill Animations
	this.animations.add('anim_thrust', Phaser.Animation.generateFrameNames('Anim_Trooper_Melee_00', 0, 9), 16, false);
	this.animations.add('anim_haste', Phaser.Animation.generateFrameNames('Anim_Trooper_Haste_00', 0, 9), 16, false);
	this.animations.add('anim_stealth', Phaser.Animation.generateFrameNames('Anim_Trooper_Stealth_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate1', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchAim_00', 0, 9), 16, true);
	this.animations.add('anim_ultimate2', Phaser.Animation.generateFrameNames('Anim_Trooper_CrouchShoot_00', 0, 9), 16, false);
    
    // Keep track of animation
    this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_thrust');
	this.hasteAnim = this.animations.getAnimation('anim_haste');
	this.stealthAnim = this.animations.getAnimation('anim_stealth');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate2');

	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.hasteAnim.onComplete.add(this.attackCallback, this);
	this.stealthAnim.onComplete.add(this.attackCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

	this.snipe = this.game.add.weapon(4, 'laser_red');    
    this.snipe.fireAngle = 0;												// Angle to be fired from
    this.snipe.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;			// Kill when out of bounds
    this.snipe.bulletSpeed = 2000;											// Speed of bullet
    this.snipe.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);	// Must be offset with world's gravity
    this.snipe.trackSprite(this, 0, 20);									// Follow this sprite, offset X and offset Y
    this.snipe.bullets.setAll('scale.x', 1);							
    this.snipe.bullets.setAll('scale.y', 1);
    this.snipe.setBulletBodyOffset(45, 10, 0, 0);

	// Audio
    var volume = 0.1;
	this.skillASFX = this.game.add.audio('trooper_skillA', volume);
	this.skillBSFX = this.game.add.audio('trooper_skillB', volume);
	this.skillCSFX = this.game.add.audio('trooper_skillC', volume);
	this.skillDSFX = this.game.add.audio('trooper_skillD', volume);	
	this.skillESFX = this.game.add.audio('trooper_skillE', volume);
};

// Inherit HeroBase
BasicGame.HeroTrooperMP.prototype = Object.create(BasicGame.HeroBase.prototype);
BasicGame.HeroTrooperMP.prototype.constructor = BasicGame.HeroTrooperMP;

BasicGame.HeroTrooperMP.prototype.update = function() {
	if (!this.isDead) {
		this.handleControls();
		this.handleSkillA();	
		this.handleSkillB();
		this.handleSkillC();
		this.handleSkillD();
		this.handleSkillE();
	}
	//this.game.debug.body(this.attackCollider);
	// this.game.debug.bodyInfo(this, 32, 200);

	// Collide with map
	this.refMP.physics.arcade.collide(this.snipe.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));

	// Collide with other players
	this.refMP.physics.arcade.overlap(this.attackCollider, BasicGame.playerCG, this.attCallback.bind(this));	
	this.refMP.physics.arcade.overlap(this.snipe.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));

	// Collide with walker's shield
	this.refMP.physics.arcade.collide(this.snipe.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));

	//this.snipe.debug(0, 0, true);
};

BasicGame.HeroTrooperMP.prototype.attCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
		// Kill collider
		this.isAttacking = false;
		this.attackCollider.x = this.attackCollider.y = -100;
		this.attackCollider.deactivate();

		if (this.facingRight == obj2.facingRight) {
			// Backstab
			console.log("backstab");
			obj2.getHit(this.knockbackForce * 3 * this.facingRight, this.knockbackForce * 2);
		} else {			// Call get hit of other person
			obj2.getHit(this.knockbackForce * this.facingRight, this.knockbackForce);
		}
	}
};

BasicGame.HeroTrooperMP.prototype.bulletCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
 		//this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj1.x, obj1.y);
		// Kill the projectile
		obj1.kill();
		// Call get hit of other person
		obj2.getHit();	
	}
};

BasicGame.HeroTrooperMP.prototype.collideCallback = function(obj1, obj2) {
	//console.log(this.explosionGroup.getFirstExists(false));
 	//this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj1.x, obj1.y);
	obj1.kill();
};


BasicGame.HeroTrooperMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1000 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

		this.slashEffect.angle = 30;
    	this.slashEffect.play('anim_1', this, 50, 0);

    	this.skillASFX.play();

    	// Play the animation
    	this.animations.play('anim_thrust');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate(); 
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer) {
		this.animations.play('anim_haste');
		this.skillBTimer = this.game.time.now + this.skillBCooldown;
		this.isAttacking = true;

		this.skillBSFX.play();

		this.applyBuff("BUFF_HASTE", 1600, 5000, 0);
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer) {
    	// Play the animation
    	this.animations.play('anim_stealth');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 

		this.skillCSFX.play();


    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 500, 0);
    	tween.onStart.add(function() {
    		this.smokeEffect.playUntracked('anim_4', this.x - 20 * this.facingRight, this.y - 10);
    	}, this);

		this.applyBuff("BUFF_INVIS", 0, 5000, 500);
	}
};


BasicGame.HeroTrooperMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
		// Passive
		//this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 
		this.skillDSFX.play();
		console.log('backstab unlocked');
	}
}


BasicGame.HeroTrooperMP.prototype.handleSkillE = function() {
	if (this.cursor.skillE && this.game.time.now > this.skillETimer) {
    	// Play the animation
		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 

    	var tween = this.game.add.tween(this).to({0: 0}, 1000, Phaser.Easing.Linear.None, true, 200, 0);
    	tween.onStart.add(function() {
    		this.snipeEffect.play('anim_1', this, -20, 20);
    		this.animations.play('anim_ultimate1');
    		this.animations.currentAnim.frame = 0;
    		//tween.delay(1000);
			this.skillESFX.play();
    	}, this);
    	tween.onComplete.add(function() {
    		this.snipeEffect.play('anim_2', this, 100, 30);
    		this.animations.play('anim_ultimate2');
    		this.animations.currentAnim.frame = 0;
    		
    		// Correct offset
    		if (this.facingRight == 1) {
    			this.snipe.fireAngle = 0;
    			this.snipe.trackOffset.x = 80;	
    		} else {
    			this.snipe.fireAngle = 180;
    			this.snipe.trackOffset.x = -80;
    		}
    		this.snipe.fire();
    	}, this);
	}
};