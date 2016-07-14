'use strict';
BasicGame.HeroGunnerMP = function (id, game, x, y, team, nick) {
	BasicGame.HeroBase.call(this, id, game, x, y, 'player_gunner', team, nick);

	// Collider size
	this.body.setSize(180, 120, 60, 54);

	// Hero Levels
	this.heroLevel = 1;
	this.heroExp = 0;
	this.heroToNextLevel = 100;

	// Hero Stats (Support Class - Gunner)
	this.constituition = 5; // multiplier for hp
	this.attack = 3; // multiplayer for attack damage
	this.atkSpeed = 7; // multiplier for attack speed
	this.movSpeed = 7; // multiplier for movement speed
	this.skillBLvl = -100;
	this.skillCLvl = -100;
	this.skillDLvl = -800;
	this.skillELvl = -400;

	// Base Hero attributes
	this.jumpStrength = -1500;
	this.moveSpeed = 600;
	this.defaultMoveSpeed = this.moveSpeed;
	this.maxHealth = 40;
	this.curHealth = this.maxHealth;
	this.healthAmt = 10;
	
	// Skill cooldowns in milliseconds
    this.skillACooldown = 1000; // normal attack - shoot bullet (Default 1s)
	this.skillBCooldown = 5000; // mite (Default 5s)
	this.skillCCooldown = 4500; // trap (Default 4.5s)
	this.skillDCooldown = 30000; // health pack (Default 30s)
	this.skillECooldown = 30000; // Ulti - revive (Default 40s)

	// Revive collider
    this.attackCollider = new BasicGame.Collider(this.game, this, 250, 100, 150, 20, 1000, 1);
    this.game.add.existing(this.attackCollider);

    // Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 'bolt', 0, 0.4, true);
	this.hitAnim = "anim_1";

	// Movement animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Gunner_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Gunner_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Gunner_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Gunner_Dead_00', 0, 9), 16, false);
	
	// Skill animations
	this.animations.add('anim_trap', Phaser.Animation.generateFrameNames('Anim_Gunner_Trap_00', 0, 9), 16, false);
	this.animations.add('anim_deploy', Phaser.Animation.generateFrameNames('Anim_Gunner_Deploy_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Gunner_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Gunner_Ultimate_00', 0, 9), 16, true);
	
	// Keep track of animation
	this.jumpAnim = this.animations.getAnimation('anim_jump');
	this.trapAnim = this.animations.getAnimation('anim_trap');
	this.deployAnim = this.animations.getAnimation('anim_deploy');
	this.shootAnim = this.animations.getAnimation('anim_shoot');
	this.ultiAnim = this.animations.getAnimation('anim_ultimate');

	// Add callback
	this.shootAnim.onComplete.add(this.shootCallback, this);
	this.trapAnim.onComplete.add(this.shootCallback, this);
	this.deployAnim.onComplete.add(this.shootCallback, this);
	//this.ultiAnim.onComplete.add(this.shootCallback, this);

	// Default attack
	this.weapon = this.game.add.weapon(5, 'slimeball');	
    this.weapon.fireAngle = 0;												
    this.weapon.fireRate = 0;					
    this.weapon.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;		
    this.weapon.bulletLifespan = 500;	
    this.weapon.bulletSpeed = 1200;											
    this.weapon.bulletGravity = new Phaser.Point(0, -this.refMP.gravity);	
    this.weapon.trackSprite(this, 0, -50);			
    this.weapon.bullets.setAll('anchor.x', 0.5);
    this.weapon.bullets.setAll('anchor.y', 0.5);
    this.weapon.bullets.setAll('scale.x', 0.4);							
    this.weapon.bullets.setAll('scale.y', 0.4);
    this.weapon.setBulletBodyOffset(40, 40, 200, 200);

    // Trap
    this.trap = this.game.add.weapon(4, 'effects_sprite');
	this.trap.addBulletAnimation('anim_1', Phaser.Animation.generateFrameNames('slime_idle (', 1, 10, ')'), 16, true);
    this.trap.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;				
    this.trap.bulletLifespan = 10000;
    this.trap.bulletSpeed = 1000;											
    this.trap.bulletGravity = new Phaser.Point(0, -2000);					
    this.trap.trackSprite(this, 0, 0);										
    this.trap.bullets.setAll('scale.x', 0.7);								
    this.trap.bullets.setAll('scale.y', 0.7);
    this.trap.bullets.setAll('body.maxVelocity.x', 500);
    this.trap.bullets.setAll('body.drag.x', 1000);
    this.trap.setBulletBodyOffset(70, 80, 220, 220);
        
    // Mite
    this.mite = this.game.add.weapon(4, 'mite_sprite');
    this.mite.addBulletAnimation('walk', Phaser.Animation.generateFrameNames('Anim_Mite_Walk_00', 0, 9), 16, true);
    this.mite.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;				
    this.mite.bulletLifespan = 3000;
    this.mite.bulletSpeed = 1500;											
    this.mite.bulletGravity = new Phaser.Point(0, -3000);					
    this.mite.trackSprite(this, 0, 0);
    this.mite.bullets.setAll('scale.x', 0.7);			
    this.mite.bullets.setAll('scale.y', 0.7);
    this.mite.bullets.setAll('body.bounce.x', 0);
    this.mite.bullets.setAll('body.bounce.y', 1.1);
    this.mite.bullets.setAll('anchor.x', 0.5);
    this.mite.bullets.setAll('anchor.y', 0.5);
    this.mite.bullets.setAll('body.maxVelocity.x', 500);
    this.mite.bullets.setAll('body.maxVelocity.y', 1500);
    this.mite.setBulletBodyOffset(100, 20, 20, 50);
	this.mite.fireAngle = 0;
    BasicGame.miteCG = this.mite.bullets;

	// Health pack
    this.pack = this.game.add.weapon(4, 'grenade');
    this.pack.bulletKillType = Phaser.Weapon.KILL_LIFESPAN;				
    this.pack.bulletLifespan = 10000;
    this.pack.bulletSpeed = 1500;											
    this.pack.bulletGravity = new Phaser.Point(0, -2000);					
    this.pack.trackSprite(this, 0, -60);										
    this.pack.bullets.setAll('scale.x', 1);								
    this.pack.bullets.setAll('scale.y', 1);
    this.pack.bullets.setAll('body.maxVelocity.x', 1000);
    this.pack.bullets.setAll('body.drag.x', 1000);
    this.pack.setBulletBodyOffset(50, 40, 10, 10);

     // Explosion group
    this.explosionGroup = this.game.add.group(); 
    for (var i = 0; i < 10; i++) {
    	var proj = new BasicGame.Effect(this.game, 'slime', 1, 0.3, false);
    	this.explosionGroup.add(proj);
    }

    this.mite.onFire.add(function(mite) {
    	mite.angle = 0;
    	mite.scale.x = 0.7 * this.facingRight;
    	mite.body.gravity.x = 500 * this.facingRight;
    }, this);

    this.trap.onFire.add(function(trap) {
    	trap.angle = 0;
    }, this);

    this.pack.onFire.add(function(pack) {
    	pack.angle = 0;
    }, this);

    // Add onKill listener
    this.weapon.onKill.add(function(bullet) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_2', bullet.x, bullet.y);
	}, this);

    this.mite.onKill.add(function(mite) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_2', mite.x, mite.y);
	}, this);

    this.trap.onKill.add(function(trap) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_2', trap.x, trap.y);
	}, this);

    this.pack.onKill.add(function(bullet) {
    	this.explosionGroup.getFirstExists(false).playUntracked('anim_1', bullet.x, bullet.y);
	}, this);

	this.ultEffect = new BasicGame.Effect(this.game, 'beam', 50, 0.5, false);
	this.ultEffect2 = new BasicGame.Effect(this.game, 'ice', 50, 0.5, false);
	this.ultEffect2.animations.getAnimation('anim_1').reverse();
	this.canRevive = false;

	this.muzzle = new BasicGame.Effect(this.game, 'slime', 50, 0.4, true);

	// Audio
    var volume = 0.1;
	this.skillASFX = this.game.add.audio('gunner_skillA', volume);
	this.skillBSFX = this.game.add.audio('gunner_skillB', volume);
	this.skillCSFX = this.game.add.audio('gunner_skillC', volume);
	this.skillDSFX = this.game.add.audio('gunner_skillD', volume);	
	this.skillESFX = this.game.add.audio('gunner_skillE', volume);
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
	//this.game.debug.body(this);

	// Collide with map
	this.refMP.physics.arcade.collide(this.weapon.bullets, this.refMP.mapLayer, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.trap.bullets, this.refMP.mapLayer);
	this.refMP.physics.arcade.collide(this.mite.bullets, this.refMP.mapLayer);
	this.refMP.physics.arcade.collide(this.pack.bullets, this.refMP.mapLayer);

	// Collide with other players
	this.refMP.physics.arcade.overlap(this.attackCollider, BasicGame.playerCG, this.reviveCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.weapon.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.trap.bullets, BasicGame.playerCG, this.trapCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.mite.bullets, BasicGame.playerCG, this.bulletCallback.bind(this));
	this.refMP.physics.arcade.overlap(this.pack.bullets, BasicGame.playerCG, this.healthPackCallback.bind(this));

	// Collide with shield
	this.refMP.physics.arcade.collide(this.weapon.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.trap.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));
	this.refMP.physics.arcade.collide(this.mite.bullets, BasicGame.shieldCG, this.collideCallback.bind(this));

	// Collide with mite
	this.refMP.physics.arcade.overlap(this.weapon.bullets, BasicGame.miteCG, this.miteCallback, null, { this: this, team: this.myTeam});
	this.refMP.physics.arcade.overlap(this.trap.bullets, BasicGame.miteCG, this.miteCallback, null, { this: this, team: this.myTeam});
	this.refMP.physics.arcade.overlap(this.mite.bullets, BasicGame.miteCG, this.miteCallback, null, { this: this, team: this.myTeam});

	//this.weapon.debug(0, 0, true);
	//this.trap.debug(0, 100, true);
	//this.mite.debug(0, 200, true);
	//this.game.debug.body(this.attackCollider);
};

BasicGame.HeroGunnerMP.prototype.healthPackCallback = function(obj1, obj2) {
	if (obj2.curHealth < obj2.maxHealth && !obj2.isDead && this.myTeam == obj2.myTeam) {
		obj2.curHealth += (this.healthAmt * this.heroLevel);
		obj1.kill();
	}
};

BasicGame.HeroGunnerMP.prototype.trapCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID && this.myTeam != obj2.myTeam) {
		obj2.applyBuff("BUFF_SLOW", 300 + (this.heroLevel * 10), 5000 + (this.heroLevel * 100), 0);
		obj1.kill();
	}
};


BasicGame.HeroGunnerMP.prototype.reviveCallback = function(obj1, obj2) {
	// If not colliding with yourself && same team
	if (obj2.ID != this.ID && this.myTeam == obj2.myTeam) {
		// If can revive and target is dead
		if (this.canRevive && obj2.isDead) {
			obj2.curHealth = obj2.maxHealth;
			obj2.animations.play('anim_idle');
			obj2.isDead = false;
			obj2.isRevived = true;
		}
	}
};

BasicGame.HeroGunnerMP.prototype.bulletCallback = function(obj1, obj2) {
	// If not colliding with yourself
	if (obj2.ID != this.ID && this.myTeam != obj2.myTeam) {
		// Kill the projectile
		obj1.kill();
		// Call get hit of other person
		obj2.getHit(5 + (this.heroLevel * this.attack), 0, 0, this);	
	}
};

BasicGame.HeroGunnerMP.prototype.collideCallback = function(obj1, obj2) {
	obj1.kill();
};

BasicGame.HeroGunnerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer && this.skillsEnabled) {
		// Default ranged attack
		if (this.facingRight == 1) {
			this.weapon.fireAngle = 0;
			this.weapon.trackOffset.x = 80;	
		} else {
			this.weapon.fireAngle = 180;
			this.weapon.trackOffset.x = -80;
		}

    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 250);
    	tween.onStart.add(function() {
    		this.weapon.fire();

    		this.muzzle.play('anim_5', this, 130, -50);

			this.skillASFX.play();
    	}, this);

    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillATimer = this.game.time.now + this.skillACooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer && this.skillsEnabled) {
		// Deploy mite
		this.skillBSFX.play();

    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 500); 
    	tween.onStart.add(function() {
    		this.mite.fire(null, this.x + this.facingRight * 100, this.y - 10);

    		this.muzzle.play('anim_5', this, 50, 20);
    	}, this);

    	// Play the animation
    	this.animations.play('anim_deploy');
    	this.animations.currentAnim.frame = 0;

		this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillC = function() {
	if (this.cursor.skillC && this.game.time.now > this.skillCTimer && this.skillsEnabled) {
		// Trap
		this.skillCSFX.play();

		if (this.facingRight == 1) {
			this.trap.fireAngle = -30;			
		} else {
			this.trap.fireAngle = 210;
		}

    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 500); 
    	tween.onStart.add(function() {
    		this.trap.fire();

    		this.muzzle.play('anim_5', this, 50, 20);
    	}, this);

    	// Play the animation
    	this.animations.play('anim_trap');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillCTimer = this.game.time.now + this.skillCCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillD = function() {
	if (this.cursor.skillD && this.game.time.now > this.skillDTimer && this.skillsEnabled) {
		// Health pack
		this.skillDSFX.play();

		if (this.facingRight == 1) {
			this.pack.fireAngle = -30;			
			this.pack.trackOffset.x = 80;
		} else {
			this.pack.fireAngle = 210;
			this.pack.trackOffset.x = -80;
		}

    	var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 250); 
    	tween.onStart.add(function() {
    		this.pack.fire();

    		this.muzzle.play('anim_5', this, 130, -50);
    	}, this);


    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillDTimer = this.game.time.now + this.skillDCooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + this.skillCooldown;
	}
};

BasicGame.HeroGunnerMP.prototype.handleSkillE = function(){ 
	if (this.cursor.skillE && this.game.time.now > this.skillETimer && this.skillsEnabled) {
		// Revive
    	this.ultEffect.playLooped('anim_1');
    	this.ultEffect2.playLooped('anim_1');

		if (this.facingRight == 1) {
			this.ultEffect.scale.x = 0.5;
		} else {
			this.ultEffect.scale.x = -0.5;
		}

		var tween = this.game.add.tween(this).to({0: 0}, 100, Phaser.Easing.Linear.None, true, 0, 20); 

		var count = 0;
		var gunNum = 0;

		this.attackCollider.activate();

    	tween.onRepeat.add(function() {
    		this.ultEffect2.x = this.x + 250 * this.facingRight;
    		this.ultEffect2.y = this.y - 40;
    		if (gunNum == 0) {
	    		this.ultEffect.x = this.x + 30 * this.facingRight;
	    		this.ultEffect.y = this.y - 40;
	    		this.ultEffect.angle = 20 * this.facingRight;
    		} else if (gunNum == 1) {
				this.ultEffect.x = this.x + 110 * this.facingRight;
	    		this.ultEffect.y = this.y + 40;
	    		this.ultEffect.angle = 0 * this.facingRight;
    		} else if (gunNum == 2) {
				this.ultEffect.x = this.x + 40 * this.facingRight;
		    	this.ultEffect.y = this.y + 40;
		    	this.ultEffect.angle = 5 * this.facingRight;
	    	}

    		if (count % 2 == 0) {
    			gunNum++;
				this.skillESFX.play();
    		}
    		if (gunNum > 2) {
    			gunNum = 0;
    		}
    		count++;
    		if (count > 15) {
    			this.canRevive = true;
    		}
    	}, this);

    	tween.onComplete.add(function() {
    		this.canRevive = false;
    		this.ultEffect.killAnim();
    		this.ultEffect2.killAnim();
    		this.isAttacking = false;
    		this.attackCollider.deactivate();
    	}, this);

    	// Play the animation
    	this.animations.play('anim_ultimate');
		this.isAttacking = true;
		this.skillETimer = this.game.time.now + this.skillECooldown; 
		this.skillsEnabled = false;
		this.skillTimer = this.game.time.now + 2000;
	}
};