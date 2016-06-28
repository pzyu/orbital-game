'use strict';
BasicGame.HeroTrooperMP = function (id, game, x, y) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_trooper');

	// Collider size
	this.body.setSize(70, 140, 40, 10);

	// Hero attributes
	this.jumpStrength = -1500;
	this.moveSpeed = 1000;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;

    // Skill cooldowns in milliseconds
    this.skillACooldown = 2000;
	this.skillBCooldown = 5000;
	this.skillCCooldown = 8000;
	this.skillDCooldown = 8000;	
	this.skillECooldown = 8000;

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 80, 100, 100, 0, 2000, 1);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

    // Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'blood_effect_sprite', 0, 0.4);
	this.game.add.existing(this.effect);
	this.hitAnim = "anim_4";

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

	this.bulletGroup = this.game.add.group();
    for (var i = 0; i < 20; i++) {
    	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1, this);
    	BasicGame.projectileCG.add(proj);
    }
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
	//this.game.debug.body(this);
	// this.game.debug.bodyInfo(this, 32, 200);
};

BasicGame.HeroTrooperMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_thrust');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
		this.alpha = 1;
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer) {
		this.animations.play('anim_haste');
		this.skillBTimer = this.game.time.now + this.skillBCooldown;
		this.isAttacking = true;
		this.alpha = 1;

		var ref = this;
		var tween = this.game.add.tween(this).to({0: 0}, 5000, Phaser.Easing.Linear.None, true, 0);
		tween.onStart.add(function() {
			ref.moveSpeed = 1600;
		});
		tween.onComplete.add(function() {
			//ref.alpha = 1;
			ref.moveSpeed = 800;
		});
	}
};

BasicGame.HeroTrooperMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer) {
    	// Play the animation
    	this.animations.play('anim_stealth');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 

		var ref = this;
		var tween = this.game.add.tween(this).to({alpha: 0.5}, 500, Phaser.Easing.Linear.None, true, 500);
		tween.onComplete.add(function() {
			//ref.alpha = 1;
		});
		//this.alpha = 0.5;
	}
};


BasicGame.HeroTrooperMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
		// Passive
		//this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 
	}
}


BasicGame.HeroTrooperMP.prototype.handleSkillE = function() {
	if (this.cursor.skillE && this.game.time.now > this.skillETimer) {
    	// Play the animation
		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
		this.alpha = 1;

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