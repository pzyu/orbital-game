'use strict';
BasicGame.HeroWalkerMP = function (id, game, x, y, team, nick) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_walker', team, nick);

	// Collider size
	this.body.setSize(160, 200, 44, 24);

	// Hero Levels
	this.heroLevel = 1;
	this.heroExp = 0;
	this.heroToNextLevel = 100;

	// Hero Stats (Tank class - Walker)
	this.constituition = 10; // multiplier for hp
	this.attack = 10; // multiplayer for attack damage
	this.atkSpeed = 4; // multiplier for attack speed
	this.movSpeed = 3; // multiplier for movement speed

	// Hero attributes
	this.jumpLimit = 1;
	this.jumpStrength = -2000;
	this.moveSpeed = 550 + (this.movSpeed * this.heroLevel);
	this.defaultMoveSpeed = this.moveSpeed;
	this.maxHealth = 50 + (this.constituition * this.heroLevel); // base hp of 50
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
    this.knockbackForce = 1200;
    //BasicGame.colliderCG.add(this.attackCollider);

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 'bolt', 0, 0.4, true);
	this.hitAnim = "anim_1";

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

    // Rocket
    this.rocket = this.game.add.weapon(4, 'walker_rocket');					// Takes in amount of bullet, and sprite key
    this.rocket.fireAngle = 0;												// Angle to be fired from
    this.rocket.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;		
    this.rocket.bulletLifespan = 1000;
    this.rocket.bulletSpeed = 1000;											// Speed of bullet
    this.rocket.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);	// Must be offset with world's gravity
    this.rocket.trackSprite(this, 0, -20);									// Follow this sprite, offset X and offset Y
    this.rocket.bullets.setAll('scale.x', 0.5);								// Set scale of all bullets
    this.rocket.bullets.setAll('scale.y', 0.5);
    this.rocket.setBulletBodyOffset(50, 40, 10, 10);

    // Ultimate
    this.nuke = this.game.add.weapon(4, 'walker_rocket');
    this.nuke.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;		
    this.nuke.bulletLifespan = 1000;
    this.nuke.bulletSpeed = 3000;											// Speed of bullet
    this.nuke.bulletGravity = new Phaser.Point(0, -2000);					// Must be offset with world's gravity
    this.nuke.trackSprite(this, 0, -80);									// Follow this sprite, offset X and offset Y
    this.nuke.bullets.setAll('scale.x', 0.6);								// Set scale of all bullets
    this.nuke.bullets.setAll('scale.y', 0.6);
    this.nuke.bullets.setAll('body.maxVelocity.y', 1000);
    this.nuke.bullets.setAll('body.maxVelocity.x', 1000);
    this.nuke.setBulletBodyOffset(50, 40, 10, 10);
    this.nuke.bulletRotateToVelocity = true;

    // Shield
    //this.shield = this.game.add.sprite(-100, -100, 'walker_shield');
    this.shield = new BasicGame.Collider(this.game, this, 390, 800, 150, -40, 0, 0.25, 'walker_shield');
    this.shield.alpha = 0;
    this.shield.anchor.setTo(0.5, 0.5);
    this.shieldActive = false;
    this.shieldDuration = 5000;
    this.shield.body.immovable = true;
    BasicGame.shieldCG.add(this.shield);

    // Backdash
    this.muzzleFX = new BasicGame.Effect(this.game, 'muzzle', 0, 1, true);
    this.muzzleFX2 = new BasicGame.Effect(this.game, 'muzzle', 0, 1, true);
    this.game.add.existing(this.muzzleFX);
    this.game.add.existing(this.muzzleFX2);

    // Explosion group
    this.explosionGroup = this.game.add.group(); 
    for (var i = 0; i < 10; i++) {
    	var proj = new BasicGame.Effect(this.game, 'explosion', 1, 0.8, false);
    	this.explosionGroup.add(proj);
    }

    // Add onKill listener
    this.rocket.onKill.add(function(obj) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj.x, obj.y);
	}, this);

	this.nuke.onKill.add(function(obj) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_2', obj.x, obj.y);
	}, this);


	// Audio
    var volume = 0.1;
	this.skillASFX = this.game.add.audio('walker_skillA', volume);
	this.skillBSFX = this.game.add.audio('walker_skillB', volume);
	this.skillCSFX = this.game.add.audio('walker_skillC', volume);
	this.skillDSFX = this.game.add.audio('walker_skillD', volume);	
	this.skillESFX = this.game.add.audio('walker_skillE', volume);
	this.skillExplSFX = this.game.add.audio('walker_explosion', volume);
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

	// Collide with map
	this.refMP.physics.arcade.collide(this.rocket.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.nuke.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));

	// Collide with shield
	this.refMP.physics.arcade.collide(this.nuke.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.rocket.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));

	// Collide with other players
	this.refMP.physics.arcade.overlap(this.attackCollider, BasicGame.playerCG, this.attCallback.bind(this));		// Bind for context
	this.refMP.physics.arcade.overlap(this.rocket.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.nuke.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));

	//this.game.debug.body(this);
	//this.game.debug.body(this.shield);
	//this.rocket.debug(0, 0, true);
};

BasicGame.HeroWalkerMP.prototype.attCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID && this.myTeam != obj2.myTeam) {
		console.log(this.myTeam, obj2.myTeam);
		// Kill collider
		this.isAttacking = false;
		this.attackCollider.deactivate();
		// Call get hit of other person
		obj2.getHit(20, this.knockbackForce * this.facingRight, this.knockbackForce, this);
	}
};

BasicGame.HeroWalkerMP.prototype.bulletCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID && this.myTeam != obj2.myTeam) {
		// Kill the projectile
		obj1.kill();
		// Call get hit of other person
		obj2.getHit(30, 0, 0, this);	
		this.skillExplSFX.play();
	}
};

BasicGame.HeroWalkerMP.prototype.collideCallback = function(obj1, obj2) {
	//console.log(this.explosionGroup.getFirstExists(false));
	obj1.kill();
	this.skillExplSFX.play();
};

BasicGame.HeroWalkerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer && this.skillsEnabled) {
		this.muzzleFX.angle = 0;
		this.muzzleFX2.angle = 0;

		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({0:0}, 250, Phaser.Easing.Cubic.Out, true, 250);
		skillTween.onStart.add(function() {
    		// Play muzzle effect
    		this.muzzleFX.play('anim_1', this, 190, -25, 1);
    		this.muzzleFX2.play('anim_1', this, 70, -25, 1);

    		// Activate collider
			this.attackCollider.activate();   
			this.skillASFX.play();
		}, this);
		
    	// Play the animation
    	this.animations.play('anim_melee');

		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillB = function(){ 
	// Shield
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer && !this.shieldActive && this.skillsEnabled) {
		// Passive
		//this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 

		var tween = this.game.add.tween(this).to({0: 0}, this.shieldDuration, Phaser.Easing.Linear.None, true, 100);
		tween.onStart.add(function() {
			var tween = this.game.add.tween(this.shield).to({alpha: 1}, 250, Phaser.Easing.Linear.None, true, 0);
			this.shieldActive = true;
			this.skillBSFX.play();
		}, this);
		tween.onComplete.add(function() {
			// Break shield here
			this.shield.alpha = 0;
			this.shieldActive = false;
		}, this);

    	this.animations.play('anim_backdash');
    	this.animations.currentAnim.frame = 0;
    	this.isAttacking = true;
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
	// Allow players to deactivate shield after 500ms
	else if (this.shieldActive && this.cursor.skillB && (this.skillBTimer - this.game.time.now) < this.shieldDuration - 500){
		this.shieldActive = false;
		this.isAttacking = false;
	}

	// Update position of shield if active
	if (this.shieldActive) {
		this.body.velocity.x = 0;
		//this.body.width = 100;
		this.shield.activate();
	} else {
		//this.body.width = 160;
		this.shield.deactivate();
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer && this.skillsEnabled) {
		// Rocket
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;

    	this.muzzleFX.angle = 0;
		this.muzzleFX2.angle = 0;


		this.rocket.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);
    	if (this.facingRight == 1) {
    		this.rocket.fireAngle = 0;
    	} else {
    		this.rocket.fireAngle = 180;
    	}

    	var tween = this.game.add.tween(this).to({0: 0}, 400, Phaser.Easing.Linear.None, true); 
    	tween.onStart.add(function() {
    		this.rocket.trackOffset.x = 0;
    		this.rocket.fire();
    		this.skillCSFX.play();

    		// Muzzle
    		this.muzzleFX.play('anim_2', this, 70, -25, 1);
    	}, this);
    	tween.onComplete.add(function() {
    		// Correct offset
    		if (this.facingRight == 1) {
    			this.rocket.trackOffset.x = 100;	
    		} else {
    			this.rocket.trackOffset.x = -100;
    		}
    		this.rocket.fire();
    		this.skillCSFX.play();

    		// Muzzle
    		this.muzzleFX2.play('anim_2', this, 190, -25, 1);
    		this.isAttacking = false;
    	}, this);

		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer && this.skillsEnabled) {
		// Backdash
		this.muzzleFX.angle = 0;
		this.muzzleFX2.angle = 0;

		var skillTween = this.game.add.tween(this.body.velocity);
		skillTween.to({x: -1500 * this.facingRight, y: -500}, 250, Phaser.Easing.Cubic.Out, true, 250);
		skillTween.onStart.add(function() {
    		// Play muzzle effect
    		this.muzzleFX.play('anim_2', this, 180, -25, 1);
    		this.muzzleFX2.play('anim_2', this, 50, -25, 1);

    		// Activate collider
			this.attackCollider.activate();   
    		this.skillDSFX.play();
		}, this);

    	// Play the animation
    	this.animations.play('anim_backdash');

		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillE = function() {
	if (this.cursor.skillE && this.game.time.now > this.skillETimer && this.skillsEnabled) {
		// Play the animation
    	this.animations.play('anim_ultimate');
    	this.animations.currentAnim.frame = 0;
		
		if (this.facingRight == 1) {
    		this.nuke.fireAngle = -30;
			this.muzzleFX.angle = -30;
			this.muzzleFX2.angle = -30;
    	} else {
    		this.nuke.fireAngle = 210;
			this.muzzleFX.angle = 30;
			this.muzzleFX2.angle = 30;
    	}

    	var left = true;
    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 0, 4); 
    	tween.onRepeat.add(function() {
    		// Correct offset
    		if (this.facingRight == 1) {

    			if (left) {
    				this.nuke.trackOffset.x = 0;		
    				this.nuke.fire();

    				// Muzzle
    				this.muzzleFX.play('anim_2', this, 40, -80, 1);
    			} else {
    				this.nuke.trackOffset.x = 100;		
    				this.nuke.fire();    			
    				// Muzzle
    				this.muzzleFX2.play('anim_2', this, 170, -80, 1);
    			}

    			left = !left;
    		} else {

    			if (left) {
    				this.nuke.trackOffset.x = -100;		
    				this.nuke.fire();

    				// Muzzle
    				this.muzzleFX.play('anim_2', this, 40, -90, 1);
    			} else {
    				this.nuke.trackOffset.x = 0;		
    				this.nuke.fire();    			
    				// Muzzle
    				this.muzzleFX2.play('anim_2', this, 170, -90, 1);
    			}

    			left = !left;
    		}
    		this.skillESFX.play();
    	}, this);

    	tween.onComplete.add(function() {
    		this.isAttacking = false;
    	}, this);

		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};
