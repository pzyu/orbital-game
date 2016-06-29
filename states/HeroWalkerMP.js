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
    this.knockbackForce = 1200;
    //BasicGame.colliderCG.add(this.attackCollider);

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
    this.rocket = this.game.add.weapon(4, 'walker_rocket');					// Takes in amount of bullet, and sprite key
    this.rocket.fireAngle = 0;												// Angle to be fired from
    this.rocket.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;			// Kill when out of bounds
    this.rocket.bulletSpeed = 1000;											// Speed of bullet
    this.rocket.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);	// Must be offset with world's gravity
    this.rocket.trackSprite(this, 0, -20);									// Follow this sprite, offset X and offset Y
    this.rocket.bullets.setAll('scale.x', 0.5);								// Set scale of all bullets
    this.rocket.bullets.setAll('scale.y', 0.5);
    this.rocket.setBulletBodyOffset(50, 40, 10, 10);

    // Ultimate
    this.nuke = this.game.add.weapon(4, 'walker_rocket');
    this.nuke.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;				// Kill when out of bounds
    this.nuke.bulletSpeed = 2000;											// Speed of bullet
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

    // Setup tweens
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
	this.refMP.physics.arcade.collide(this.rocket.bullets, this.refMP.mapLayer, function(obj1, obj2) {obj1.kill();});
	this.refMP.physics.arcade.collide(this.nuke.bullets, this.refMP.mapLayer, function(obj1, obj2) {obj1.kill();});
	this.refMP.physics.arcade.collide(this.nuke.bullets, BasicGame.shieldCG, function(obj1, obj2) {obj1.kill();});
	this.refMP.physics.arcade.collide(this.rocket.bullets, BasicGame.shieldCG, function(obj1, obj2) {obj1.kill();});

	// Collide with other players
	this.refMP.physics.arcade.overlap(this.attackCollider, BasicGame.playerCG, this.attCallback.bind(this));		// Bind for context
	this.refMP.physics.arcade.overlap(this.rocket.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.nuke.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));

	//this.game.debug.body(this);
	// this.game.debug.body(this.shield);
	//this.rocket.debug(0, 0, true);
};

BasicGame.HeroWalkerMP.prototype.attCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
		// Kill collider
		this.isAttacking = false;
		this.attackCollider.deactivate();
		// Call get hit of other person
		obj2.getHit(this.knockbackForce * this.facingRight, this.knockbackForce);
	}
};

BasicGame.HeroWalkerMP.prototype.bulletCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID) {
		// Kill the projectile
		obj1.kill();
		// Call get hit of other person
		obj2.getHit();
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
		this.backdashFX.angle = 0;
		this.backdashFX2.angle = 0;

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

    	this.backdashFX.angle = 0;
		this.backdashFX2.angle = 0;


		this.rocket.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);
    	if (this.facingRight == 1) {
    		this.rocket.fireAngle = 0;
    	} else {
    		this.rocket.fireAngle = 180;
    	}

    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 400, Phaser.Easing.Linear.None, true); 
    	tween.onStart.add(function() {
    		ref.rocket.trackOffset.x = 0;
    		ref.rocket.fire();

    		// Muzzle
    		ref.backdashFX.play('anim_2', ref, 70, -25, 1);
    	});
    	tween.onComplete.add(function() {
    		// Correct offset
    		if (ref.facingRight == 1) {
    			ref.rocket.trackOffset.x = 100;	
    		} else {
    			ref.rocket.trackOffset.x = -100;
    		}
    		ref.rocket.fire();

    		// Muzzle
    		ref.backdashFX2.play('anim_2', ref, 190, -25, 1);
    	});

		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer) {
		// Backdash
		this.backdashFX.angle = 0;
		this.backdashFX2.angle = 0;

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
		
		if (this.facingRight == 1) {
    		this.nuke.fireAngle = -30;
    	} else {
    		this.nuke.fireAngle = 210;
    	}

    	var left = true;
    	var ref = this;
    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 0, 4); 
    	tween.onRepeat.add(function() {
    		// Correct offset
    		if (ref.facingRight == 1) {
				ref.backdashFX.angle = -30;
				ref.backdashFX2.angle = -30;

    			if (left) {
    				ref.nuke.trackOffset.x = 0;		
    				ref.nuke.fire();

    				// Muzzle
    				ref.backdashFX.play('anim_2', ref, 40, -80, 1);
    			} else {
    				ref.nuke.trackOffset.x = 100;		
    				ref.nuke.fire();    			
    				// Muzzle
    				ref.backdashFX2.play('anim_2', ref, 170, -80, 1);
    			}

    			left = !left;
    		} else {
    			ref.backdashFX.angle = 30;
				ref.backdashFX2.angle = 30;

    			if (left) {
    				ref.nuke.trackOffset.x = -100;		
    				ref.nuke.fire();

    				// Muzzle
    				ref.backdashFX.play('anim_2', ref, 40, -90, 1);
    			} else {
    				ref.nuke.trackOffset.x = 0;		
    				ref.nuke.fire();    			
    				// Muzzle
    				ref.backdashFX2.play('anim_2', ref, 170, -90, 1);
    			}

    			left = !left;
    		}
    	});

		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
	}
};
