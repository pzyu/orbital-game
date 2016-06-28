'use strict';
BasicGame.HeroGunnerMP = function (id, game, x, y) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_gunner');

	// Collider size
	this.body.setSize(180, 100, 60, 74);

	// Hero attributes
	this.jumpStrength = -1500;
	this.moveSpeed = 800;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;
	
	// Skill cooldowns in milliseconds
    this.skillACooldown = 1000;
	this.skillBCooldown = 3000;
	this.skillCCooldown = 5000;
	this.skillDCooldown = 6000;	
	this.skillECooldown = 8000;

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 80, 150, 100, 0, 1000, 1);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

    // Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'blood_effect_sprite', 0, 0.4);
	this.game.add.existing(this.effect);
	this.hitAnim = "anim_4";

	// Movement animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Gunner_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Gunner_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Gunner_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Gunner_Dead_00', 0, 9), 16, false);
	
	// Skill animations
	this.animations.add('anim_leap', Phaser.Animation.generateFrameNames('Anim_Gunner_Leap_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Gunner_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Gunner_Ultimate_00', 0, 9), 16, false);
	
	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_leap');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate');

	// Add callback
	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

    this.bulletGroup = this.game.add.group();
    for (var i = 0; i < 20; i++) {
    	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1);
    	BasicGame.projectileCG.add(proj);
    }
}

// Inherit HeroBase
BasicGame.HeroGunnerMP.prototype = Object.create(BasicGame.HeroBase.prototype);
BasicGame.HeroGunnerMP.prototype.constructor = BasicGame.HeroGunnerMP;

BasicGame.HeroGunnerMP.prototype.update = function() {
	if (!this.isDead) {
		this.handleControls();
		this.handleSkillA();	
		this.handleSkillB();
		this.handleSkillC();
		this.handleSkillD();
		this.handleSkillE();
	}
	// this.game.debug.body(this);
};

BasicGame.HeroGunnerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
		this.isAttacking = true;

		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight, y: -500}, 250, Phaser.Easing.Cubic.Out, false, 250);

		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_leap');
    	//this.animations.currentAnim.frame = 0;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.attackCollider.activate();   
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 

		//console.log(BasicGame.projectileCG.getFirstExists(false));
    	BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 120, -42);
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer) {
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

BasicGame.HeroGunnerMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
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

BasicGame.HeroGunnerMP.prototype.handleSkillE = function(){ 
	if (this.cursor.skillE && this.game.time.now > this.skillETimer) {
		// Passive
		//this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
	}
};