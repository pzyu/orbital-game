'use strict';
BasicGame.HeroWalkerMP = function (id, game, x, y) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_walker');

	// Collider size
	this.body.setSize(160, 200, 44, 24);

	// Hero attributes
	this.jumpLimit = 1;
	this.jumpStrength = -2000;
	this.moveSpeed = 500;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;

	// Skill cooldowns in milliseconds
    this.skillACooldown = 1000;
	this.skillBCooldown = 6000;
	this.skillCCooldown = 2000;
	this.skillDCooldown = 2000;	
	this.skillECooldown = 2000;

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 100, 120, 120, -50, 1200, 1);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'bolt_effect_sprite', 0, 0.4);
	this.game.add.existing(this.effect);
	this.hitAnim = "anim_4";

	// Movement animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Walker_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Walker_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Walker_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Walker_Dead_00', 0, 9), 16, false);
	
	// Skill animations
	this.animations.add('anim_melee', Phaser.Animation.generateFrameNames('Anim_Walker_Melee_00', 0, 9), 16, false);
	this.animations.add('anim_backdash', Phaser.Animation.generateFrameNames('Anim_Walker_Backdash_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Walker_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Walker_Ultimate_0', 0, 19), 16, false);

	// Keep track of animation
	this.meleeAnim = this.animations.getAnimation('anim_melee');
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_backdash');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate');

	// Add callback
	this.meleeAnim.onComplete.add(this.attackCallback, this);
	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

    //this.bulletGroup = this.game.add.group();
    //for (var i = 0; i < 20; i++) {
    // 	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1);
    //	BasicGame.projectileCG.add(proj);
    //}
    // Rocket
    this.weapon = this.game.add.weapon(2, 'walker_rocket');
    this.weapon.fireAngle = 0;
    //this.weapon.bulletRotateToVelocity = true;
   	//this.weapon.bulletAngleOffset = ;
    //this.weapon.bulletAngleVariance = 10;
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.weapon.bulletSpeed = 1000;
    this.weapon.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);
    this.weapon.trackSprite(this);
    this.weapon.bulletInheritSpriteSpeed = true;
    console.log(this.weapon);

    // Shield
    //this.shield = this.game.add.sprite(-100, -100, 'walker_shield');
    this.shield = new BasicGame.Collider(this.game, this, 360, 800, 100, -40, 0, 0.25, 'walker_shield');
    this.shield.alpha = 0;
    this.shield.anchor.setTo(0.5, 0.5);
    this.shieldActive = false;
    this.shieldDuration = 5000;
    this.shield.body.immovable = true;
    BasicGame.shieldCG.add(this.shield);

    // Backdash
    this.backdashFX = new BasicGame.Effect(this.game, -100, -100, 'muzzle_effect_sprite', 0, 1);
    this.backdashFX2 = new BasicGame.Effect(this.game, -100, -100, 'muzzle_effect_sprite', 0, 1);
    this.game.add.existing(this.backdashFX);
    this.game.add.existing(this.backdashFX2);
}

// Inherit HeroBase
BasicGame.HeroWalkerMP.prototype = Object.create(BasicGame.HeroBase.prototype);
BasicGame.HeroWalkerMP.prototype.constructor = BasicGame.HeroWalkerMP;

BasicGame.HeroWalkerMP.prototype.update = function() {
	if (!this.isDead) {		
		this.handleControls();

		if (!this.shieldActive) {
			this.handleSkillA();	
			this.handleSkillC();
			this.handleSkillD();
			this.handleSkillE();
		}
		// Only for shield so players can deactivate
		this.handleSkillB();
	}
	//this.game.debug.body(this);
	// this.game.debug.body(this.shield);
};

BasicGame.HeroWalkerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {

		var ref = this;
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({0:0}, 250, Phaser.Easing.Cubic.Out, true, 250);
		skillTween.onStart.add(function() {
    		// Play muzzle effect
    		ref.backdashFX.play('anim_1', ref, 190, -25, 1);
    		ref.backdashFX2.play('anim_1', ref, 70, -25, 1);

    		// Activate collider
			ref.attackCollider.activate();   
		});
		
    	// Play the animation
    	this.animations.play('anim_melee');


		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillB = function(){ 
	// Shield
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer && !this.shieldActive) {
		// Passive
		//this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 

		var ref = this;
		var tween = this.game.add.tween(this).to({0: 0}, this.shieldDuration, Phaser.Easing.Linear.None, true, 100);
		tween.onStart.add(function() {
			var tween = ref.game.add.tween(ref.shield).to({alpha: 1}, 250, Phaser.Easing.Linear.None, true, 0);
			ref.shieldActive = true;
		});
		tween.onComplete.add(function() {
			// Break shield here
			ref.shield.alpha = 0;
			ref.shieldActive = false;
		});

    	this.animations.play('anim_backdash');
    	this.animations.currentAnim.frame = 0;
    	this.isAttacking = true;
	}
	// Allow players to deactivate shield after 500ms
	else if (this.shieldActive && this.cursor.skillB && (this.skillBTimer - this.game.time.now) < this.shieldDuration - 500){
		this.shieldActive = false;
		this.isAttacking = false;
	}

	// Update position of shield if active
	if (this.shieldActive) {
		this.body.velocity.x = 0;
		this.body.width = 80;
		this.shield.activate();
	} else {
		this.body.width = 160;
		this.shield.deactivate();
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer) {
		// Rocket
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
    	//BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 175, 0);
    	this.weapon.fire();

		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
		// Backdash
		var ref = this;
		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: -1500 * this.facingRight, y: -500}, 250, Phaser.Easing.Cubic.Out, true, 250);
		skillTween.onStart.add(function() {
    		// Play muzzle effect
    		ref.backdashFX.play('anim_2', ref, 180, -25, 1);
    		ref.backdashFX2.play('anim_2', ref, 50, -25, 1);

    		// Activate collider
			ref.attackCollider.activate();   
		});

    	// Play the animation
    	this.animations.play('anim_backdash');

		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillE = function() {
	if (this.cursor.skillE && this.game.time.now > this.skillETimer) {
		// Play the animation
    	this.animations.play('anim_ultimate');
    	this.animations.currentAnim.frame = 0;

    	var ref = this;
		var firstShot = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, false, 50);
		var secondShot = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, false, 0);
		var thirdShot = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, false, 0);
		var forthShot = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, false, 0);
		firstShot.onStart.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, 1200, -1500, 0, 0, -100, true);
		});
		secondShot.onStart.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, 1200, -1500, 0, 175, -100, true);
		});
		thirdShot.onStart.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, 1200, -1500, 0, 0, -100, true);
		});
		forthShot.onStart.add(function() {
    		BasicGame.projectileCG.getFirstExists(false).play('anim_1', ref, 1200, -1500, 0, 175, -100, true);
		});
		firstShot.chain(secondShot);
		secondShot.chain(thirdShot);
		thirdShot.chain(forthShot);

		firstShot.start();

		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
	}
};
