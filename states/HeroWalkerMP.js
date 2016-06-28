'use strict';
BasicGame.HeroWalkerMP = function (id, game, x, y) {
	Phaser.Sprite.call(this, game, x, y, 'player_walker', 0);
	this.ID = id;
	console.log('creating walker');
	
	this.cursor = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false,
		x: 0,
		y: 0
	}

	this.myInput = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false,
		x: 0,
		y: 0,
		hp: 0
	}

	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 1;
	this.jumpTimer = 0;
	this.jumpStrength = -2000;
	this.moveSpeed = 500;
	this.facingRight = 1;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;
	this.isDead = false;

	// Skills
	this.skillACooldown = 500;
	this.skillBCooldown = 500;
	this.skillCCooldown = 1000;
	this.skillDCooldown = 5000;	
	this.skillATimer = 0;
	this.skillBTimer = 0;
	this.skillCTimer = 0;
	this.skillDTimer = 0;

	// Set invidual scale and collider
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	// Enable physics
	this.game.physics.arcade.enableBody(this);
	this.body.setSize(160, 200, 44, 24);
	this.body.maxVelocity.y = 3000;
	this.body.drag.x = 5000;

	// Animations
	this.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Anim_Walker_Idle_00', 0, 9), 16, true);
	this.animations.add('anim_run', Phaser.Animation.generateFrameNames('Anim_Walker_Walk_00', 0, 9), 16, true);
	this.animations.add('anim_backdash', Phaser.Animation.generateFrameNames('Anim_Walker_Backdash_00', 0, 9), 16, false);
	this.animations.add('anim_shoot', Phaser.Animation.generateFrameNames('Anim_Walker_Shoot_00', 0, 9), 16, false);
	this.animations.add('anim_jump', Phaser.Animation.generateFrameNames('Anim_Walker_Jump_00', 0, 9), 16, false);
	this.animations.add('anim_dead', Phaser.Animation.generateFrameNames('Anim_Walker_Dead_00', 0, 9), 16, false);
	this.animations.add('anim_ultimate', Phaser.Animation.generateFrameNames('Anim_Walker_Ultimate_00', 0, 9), 16, false);

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

	// Each hero will have an effect object which basically plays whatever effect they have
	this.effect = new BasicGame.Effect(this.game, 100, 1000, 'bolt_effect_sprite', false, 0);
	this.game.add.existing(this.effect);

	// Attack collider
    this.attackCollider = new BasicGame.Collider(this.game, this,  100, 100, 100, -40, 1000);
    this.game.add.existing(this.attackCollider);
    BasicGame.colliderCG.add(this.attackCollider);
    console.log(BasicGame.colliderCG.length);

    this.bulletGroup = this.game.add.group();
    for (var i = 0; i < 20; i++) {
    	var proj = new BasicGame.Projectile(this.game, 'bolt_effect_sprite', 1);
    	BasicGame.projectileCG.add(proj);
    }

	// Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);

	// Add this object into existing game
	this.game.add.existing(this);
	BasicGame.playerCG.add(this);

	this.refMP = this.game.state.states['Multiplayer'];
	this.stepTimer = 0;
	this.timeStep = this.refMP.timeStep;
	this.delta = this.refMP.delta;

	this.spawn();
}

// Kind of like inherts Sprite
BasicGame.HeroWalkerMP.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroWalkerMP.prototype.constructor = BasicGame.Player;

BasicGame.HeroWalkerMP.prototype.spawn = function() {
	var ref = this;
	if (this.isDead) {
		ref.body.velocity.x = ref.body.velocity.y = 0;
		var tween = this.game.add.tween(this).to({0: 0}, 5000, Phaser.Easing.Linear.None, true, 0, 0);
		tween.onStart.add(function(){
			console.log("Play dying animation");
			ref.animations.play('anim_dead');
		});
		tween.onComplete.add(function(){
			var index = ref.game.rnd.integerInRange(0, ref.refMP.spawnPoints.length - 1);
			ref.x = ref.refMP.spawnPoints[index].x;
			ref.y = ref.refMP.spawnPoints[index].y;
			ref.curHealth = ref.maxHealth;
			ref.animations.play('anim_idle');
			ref.isDead = false;
		});
	} else {
		var index = ref.game.rnd.integerInRange(0, this.refMP.spawnPoints.length - 1);
		this.x = this.refMP.spawnPoints[index].x;
		this.y = this.refMP.spawnPoints[index].y;
	}
};

BasicGame.HeroWalkerMP.prototype.update = function() {
	if (!this.isDead) {
		this.handleControls();
	}
	// this.game.debug.body(this);
};


BasicGame.HeroWalkerMP.prototype.handleControls = function() {
	// Sending input to server
	this.myInput.left = this.cursors.left.isDown;
	this.myInput.right = this.cursors.right.isDown;
	this.myInput.up = this.cursors.up.isDown;
	this.myInput.down = this.cursors.down.isDown;
	this.myInput.skillA = this.skillA.isDown;
	this.myInput.skillB = this.skillB.isDown;
	this.myInput.skillC = this.skillC.isDown;
	this.myInput.skillD = this.skillD.isDown;

	var myInputChanged = (
		this.cursor.left != this.myInput.left ||
		this.cursor.right != this.myInput.right ||
		this.cursor.up != this.myInput.up ||
		this.cursor.down != this.myInput.down ||
		this.cursor.skillA != this.myInput.skillA ||
		this.cursor.skillB != this.myInput.skillB ||
		this.cursor.skillC != this.myInput.skillC ||
		this.cursor.skillD != this.myInput.skillD
	);

	if (myInputChanged) {
		if (this.ID == this.refMP.myID) {
			this.myInput.x = this.x;
			this.myInput.y = this.y;

			this.refMP.eurecaServer.handleKeys(this.myInput);
		}
	}	

	// Every time step, update all clients of local position
	if (this.game.time.now > this.stepTimer) {

		if (this.ID == this.refMP.myID) {
			this.stepTimer = this.game.time.now + this.timeStep;
			this.myInput.x = this.x;
			this.myInput.y = this.y;
			this.myInput.hp = this.curHealth;

			this.refMP.eurecaServer.compensate(this.myInput);
		}
	}

	// If moving left
	if (this.cursor.left && !this.isAttacking) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}

	} else if (this.cursor.right && !this.isAttacking) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	} 
	//console.log(jumpCount);

	// If jump is pressed, body is on floor, and jump timer is over&& this.body.onFloor()
 	if (this.cursor.up  && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit && !this.isAttacking)
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
    this.step(this.delta);
};

BasicGame.HeroWalkerMP.prototype.handleSkillA = function() {
	if (this.cursor.skillA && this.game.time.now > this.skillATimer) {
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

BasicGame.HeroWalkerMP.prototype.handleSkillB = function() {
	if (this.cursor.skillB && this.game.time.now > this.skillBTimer) {
    	// Play the animation
    	this.animations.play('anim_shoot');
    	this.animations.currentAnim.frame = 0;
		this.isAttacking = true;
		this.skillBTimer = this.game.time.now + this.skillBCooldown; 

		//console.log(BasicGame.projectileCG.getFirstExists(false));
    	BasicGame.projectileCG.getFirstExists(false).play('anim_1', this, 1000, 0, 0, 175, 0);
	}
};

BasicGame.HeroWalkerMP.prototype.handleSkillC = function() {
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
		var offsetX = 175;
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

BasicGame.HeroWalkerMP.prototype.handleSkillD = function() {
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

BasicGame.HeroWalkerMP.prototype.attackCallback = function() {
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroWalkerMP.prototype.shootCallback = function() {
	console.log('shoot callback');
	this.isAttacking = false;
};

BasicGame.HeroWalkerMP.prototype.getHit = function(knockback) {
	this.effect.play('anim_4', this);
	// Can only get hit if not dead
	if (!this.isDead) {
		var ref = this;
		var cur = 0;
		var tween = this.game.add.tween(this).to({tint: 0xff0000}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);
		tween.onRepeat.add(function() {
			cur++;
			if (cur > 4) {	
				tween.stop();
				ref.tint = 0xffffff;
			}
		});

		this.body.velocity.x += knockback * this.facingRight;
		this.body.velocity.y -= knockback;
		this.curHealth -= 10;

		// If dead, respawn
		if (this.curHealth <= 0) {
			this.curHealth = 0;
			this.isDead = true;
			console.log("Dead");
			this.spawn();
			this.refMP.broadcast(this.ID + " has been killed!", 2);
		}
	}
};

BasicGame.HeroWalkerMP.prototype.render = function() {
	game.debug.bodyInfo(this, 32, 32);
	game.debug.body(this);
};

BasicGame.HeroWalkerMP.prototype.getSkillA = function() {
	return this.game.math.clamp((this.game.time.now - this.skillATimer) / this.skillACooldown, -1, 0);
};

BasicGame.HeroWalkerMP.prototype.getSkillB = function() {
	return this.game.math.clamp((this.game.time.now - this.skillBTimer) / this.skillBCooldown, -1, 0);
};

BasicGame.HeroWalkerMP.prototype.getSkillC = function() {
	return this.game.math.clamp((this.game.time.now - this.skillCTimer) / this.skillCCooldown, -1, 0);
};

BasicGame.HeroWalkerMP.prototype.getSkillD = function() {
	return this.game.math.clamp((this.game.time.now - this.skillDTimer) / this.skillDCooldown, -1, 0);
};

BasicGame.HeroWalkerMP.prototype.getHP = function() {
	return this.curHealth / this.maxHealth;
};

BasicGame.HeroWalkerMP.prototype.interpolateTo = function (dataX, dataY, duration) {
	// Calculates amount to step based on duration, then sets target to step to
	this.stepValueX = this.game.math.difference(dataX, this.x) / duration;
	this.targetX = dataX;

	this.stepValueY = this.game.math.difference(dataY, this.y) / duration;
	this.targetY = dataY;
};

BasicGame.HeroWalkerMP.prototype.step = function(delta) {
	// Steps to target with respect to delta
	if (this.x < this.targetX) {
		this.x += delta * this.stepValueX;
	} else if (this.x > this.targetX) {
		this.x -= delta * this.stepValueX;
	}

	if (this.y < this.targetY) {
		this.y += delta * this.stepValueY;
	} else if (this.y > this.targetY) {
		this.y -= delta * this.stepValueY;
	}
};

