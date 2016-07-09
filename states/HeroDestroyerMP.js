'use strict';
BasicGame.HeroDestroyerMP = function (id, game, x, y) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_destroyer');

	// Collider size
	this.body.setSize(110, 220, 110, 20);

	// Hero attributes
	this.jumpStrength = -1500;
	this.moveSpeed = 800;
	this.defaultMoveSpeed = this.moveSpeed;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;
	
	// Skill cooldowns in milliseconds
    this.skillACooldown = 500;
	this.skillBCooldown = 2000;
	this.skillCCooldown = 2000;
	this.skillDCooldown = 2000;	
	this.skillECooldown = 2000;

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 80, 100, 80, 0, 2000, 1);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);
	this.knockbackForce = 1500;

    // Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 'bolt', 0, 0.4, true);
	this.hitAnim = "anim_1";

	// Movement animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Destroyer_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Destroyer_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Destroyer_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Destroyer_Dead_00', 0, 9), 16, false);

	// Skill animations
	this.animations.add('anim_thrust', Phaser.Animation.generateFrameNames('Anim_Destroyer_Thrust_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Destroyer_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_throw', Phaser.Animation.generateFrameNames('Anim_Destroyer_Throw_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Destroyer_Ultimate_00', 0, 9), 16, false);

	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.thrustAnim = this.animations.getAnimation('anim_thrust');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.throwAnim = this.animations.getAnimation('anim_throw');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate');
	
	// Add callback
	this.thrustAnim.onComplete.add(this.attackCallback, this);
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.throwAnim.onComplete.add(this.shootCallback, this);
	this.ultiAnim.onComplete.add(this.shootCallback, this);

	// Grenade
    this.grenade = this.game.add.weapon(4, 'grenade');
    this.grenade.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;				
    this.grenade.bulletLifespan = 3000;
    this.grenade.bulletSpeed = 2000;											
    this.grenade.bulletGravity = new Phaser.Point(0, -2000);					
    this.grenade.trackSprite(this, 0, 0);										
    this.grenade.bullets.setAll('scale.x', 1);								
    this.grenade.bullets.setAll('scale.y', 1);
    this.grenade.bullets.setAll('body.maxVelocity.x', 1000);
    this.grenade.bullets.setAll('body.bounce.x', 0.5);
    this.grenade.bullets.setAll('body.bounce.y', 0.5);
    this.grenade.bullets.setAll('body.drag.x', 300);
    this.grenade.setBulletBodyOffset(50, 40, 10, 10);
    this.grenade.bulletRotateToVelocity = true;

	// Projectile    
	this.weapon = this.game.add.weapon(10, 'laser_blue');				
    this.weapon.fireAngle = 0;												
    this.weapon.fireRate = 0;					
    this.weapon.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;			
    this.weapon.bulletSpeed = 1500;											
    this.weapon.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);	
    this.weapon.trackSprite(this, 0, 10);									
    this.weapon.bullets.setAll('scale.x', 1);							
    this.weapon.bullets.setAll('scale.y', 1);
    this.weapon.setBulletBodyOffset(45, 10, 0, 0);


	this.blast = new BasicGame.Effect(this.game, 'blast', 0, 1.3, true);
	this.blast.alpha = 0.75;
	this.game.add.existing(this.blast);

    // Explosion group
    this.explosionGroup = this.game.add.group(); 
    for (var i = 0; i < 10; i++) {
    	var proj = new BasicGame.Effect(this.game, 'explosion', 1, 0.8, false);
    	this.explosionGroup.add(proj);
    }

    // Add onKill listener
    this.grenade.onKill.add(function(grenade) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_1', grenade.x, grenade.y - 60);
		this.skillD_1SFX.play();
	}, this);

	// Audio
    var volume = 0.1;
	this.skillASFX = this.game.add.audio('destroyer_skillA', volume);
	this.skillBSFX = this.game.add.audio('destroyer_skillB', volume);
	this.skillCSFX = this.game.add.audio('destroyer_skillC', volume);
	this.skillDSFX = this.game.add.audio('destroyer_skillD', volume);
	this.skillD_1SFX = this.game.add.audio('destroyer_skillD_1', volume);
	this.skillESFX = this.game.add.audio('destroyer_skillE', volume);
}

// Inherit HeroBase
BasicGame.HeroDestroyerMP.prototype = Object.create(BasicGame.HeroBase.prototype);
BasicGame.HeroDestroyerMP.prototype.constructor = BasicGame.HeroDestroyerMP;

BasicGame.HeroDestroyerMP.prototype.update = function() {
	if (!this.isDead) {
		this.handleControls();
		this.handleSkillA();	
		this.handleSkillB();
		this.handleSkillC();
		this.handleSkillD();
		this.handleSkillE();
	}

	// Collide with map	
	this.refMP.physics.arcade.collide(this.weapon.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.grenade.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));

	// Collide with other players
	this.refMP.physics.arcade.overlap(this.attackCollider, BasicGame.playerCG, this.attCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.weapon.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.grenade.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));

	// Collide with shield
	this.refMP.physics.arcade.collide(this.weapon.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.grenade.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));

	//this.game.debug.body(this.attackCollider);
	//this.weapon.debug(0, 0, true);
	//this.grenade.debug(0, 100, true);
};

BasicGame.HeroDestroyerMP.prototype.attCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
		// Kill collider
		this.isAttacking = false;
		this.attackCollider.x = this.attackCollider.y = -200;
		this.attackCollider.deactivate();
		// Call get hit of other person
		obj2.getHit(this.knockbackForce * this.facingRight, this.knockbackForce);
	}
};

BasicGame.HeroDestroyerMP.prototype.bulletCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
 		//this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj1.x, obj1.y);
		// Kill the projectile
		obj1.kill();
		// Call get hit of other person
		obj2.getHit();	
	}
};

BasicGame.HeroDestroyerMP.prototype.collideCallback = function(obj1, obj2) {
	//console.log(this.explosionGroup.getFirstExists(false));
 	//this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj1.x, obj1.y);
 	// Don't kill grenade
 	if (obj1.key != "grenade") {
		obj1.kill();
	}
};

BasicGame.HeroDestroyerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer && this.skillsEnabled) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		//console.log(BasicGame.projectileCG.getFirstExists(false));
    	//BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 100, 0);
		if (this.facingRight == 1) {
			this.weapon.fireAngle = 0;
			this.weapon.trackOffset.x = 80;	
		} else {
			this.weapon.fireAngle = 180;
			this.weapon.trackOffset.x = -80;
		}
		this.skillASFX.play();
    	this.weapon.fire();

		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;

	}
};

BasicGame.HeroDestroyerMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer && this.skillsEnabled) {

    	var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: 1500 * this.facingRight}, 250, Phaser.Easing.Cubic.Out);
		skillTween.start();

    	// Play the animation
    	this.animations.play('anim_thrust');
    	this.animations.currentAnim.frame = 0;
		this.attackCollider.activate();   

		this.skillBSFX.play();

		this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroDestroyerMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer && this.skillsEnabled) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		if (this.facingRight == 1) {
			this.weapon.fireAngle = 0;
			this.weapon.trackOffset.x = 80;	
		} else {
			this.weapon.fireAngle = 180;
			this.weapon.trackOffset.x = -80;
		}
    	this.weapon.fire(null, this.x + this.facingRight * 100, this.y + 8);
    	this.weapon.fire(null, this.x + this.facingRight * 100, this.y + 10);
    	this.weapon.fire(null, this.x + this.facingRight * 100, this.y + 12);


		this.skillCSFX.play();

		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroDestroyerMP.prototype.handleSkillD = function() {
	// Grenade
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer && this.skillsEnabled) {
		if (this.facingRight == 1) {
			this.grenade.fireAngle = -30;
			this.grenade.trackOffset.x = 80;	
		} else {
			this.grenade.fireAngle = 210;
			this.grenade.trackOffset.x = -80;
		}

    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 500); 
    	tween.onStart.add(function() {
    		this.grenade.fire();
			this.skillDSFX.play();
    	}, this);

    	this.animations.play('anim_throw');
    	this.animations.currentAnim.frame = 0;

		this.skillDTimer = this.game.time.now + this.skillDCooldown;
		this.isAttacking = true;
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};


BasicGame.HeroDestroyerMP.prototype.handleSkillE = function() {
	if (this.cursor.skillE && this.game.time.now > this.skillETimer && this.skillsEnabled) {
		this.body.velocity.x = 0;
    	// Play the animation
    	this.animations.play('anim_ultimate');
    	this.animations.currentAnim.frame = 0;

    	this.attackCollider.body.setSize(200, 500, 0, -370);
		this.attackCollider.offX = -100;

		var tween = this.game.add.tween(this).to({0: 0}, 400, Phaser.Easing.Linear.None, true, 200); 
    	tween.onStart.add(function() {

			this.skillESFX.play();
			this.blast.play('anim_1', this, -40, -170);
    		this.knockbackForce = 2000;
			this.attackCollider.activate();   
    	}, this);

    	tween.onComplete.add(function() {
    		this.knockbackForce = 1000;
    		this.attackCollider.deactivate();   
			this.attackCollider.x = this.attackCollider.y = -100;
			this.attackCollider.body.setSize(80, 100, 0, 0);
			this.attackCollider.offX = 80;
    	}, this);

		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};