'use strict';
BasicGame.HeroBase = function (id, game, x, y, sprite, team, nick) {
	// Takes in ID, game reference, x, y, sprite key, and team
	Phaser.Sprite.call(this, game, x, y, sprite, 0);
	this.ID = id;
	this.nick = nick;
	this.myTeam = team;
	this.lastHitBy = "";
	
	this.cursor = {
		left: false,
		right: false,
		up: false,
		down: false,
		skillA: false,
		skillB: false,
		skillC: false,
		skillD: false,
		skillE: false,
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
		skillE: false,
		x: 0,
		y: 0,
		hp: 0,
		inCircle: false
	}

	this.anchor.setTo(0.5, 0.5);

	// Movement
	this.jumpCount = 0;
	this.jumpLimit = 2;
	this.jumpTimer = 0;
	this.jumpStrength = -1500;
	this.moveSpeed = 1000;
	this.defaultMoveSpeed = 1000;
	this.facingRight = 1;
	this.maxHealth = 100;
	this.curHealth = this.maxHealth;
	this.isDead = false;
	this.isRevived = false; 		// Check if has been revived
	this.isBuffed = false;
	this.inCircle = false;
	this.inShield = false;
	
	// Hero Levels
	this.heroLevel = 1;
	this.heroExp = 0;
	this.heroToNextLevel = 80;

	// Hero Stats
	this.constituition = 0;
	this.attack = 0;
	this.atkSpeed = 0;
	this.movSpeed = 0;


	// Skills
	this.skillACooldown = 1000;
	this.skillBCooldown = 1000;
	this.skillCCooldown = 1000;
	this.skillDCooldown = 1000;	
	this.skillECooldown = 1000;
	this.skillATimer = 0;
	this.skillBTimer = 0;
	this.skillCTimer = 0;
	this.skillDTimer = 0;
	this.skillETimer = 0;

	this.skillCooldown = 500;
	this.skillTimer = 0;
	this.skillsEnabled = true;

	// Set invidual scale and collider
	this.scaleX = 1;
	this.scaleY = 1;
	this.scale.x = this.scaleX;
	this.scale.y = this.scaleY;

	// Enable physics
	this.game.physics.arcade.enableBody(this);
	this.body.setSize(100, 100, 0, 0);
	//this.body.gravity.y = 1000;
	this.body.maxVelocity.y = 2500;
	this.body.drag.x = 5000;
	this.body.drag.y = 100;
    this.isAttacking = false;

    // Hit effect assigned in child classes
	this.effect;
	this.hitAnim;

	// Buff effect
	this.hasteEffect = new BasicGame.Effect(this.game, 'bolt', 50, 0.5, true);
	this.slowEffect = new BasicGame.Effect(this.game, 'summon', 50, 0.5, true);
	//this.game.add.existing(this.buffEffect);

	// Keep track of jump anim
	this.jumpAnim;

    // Controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.skillA = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
	this.skillB = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
	this.skillC = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
	this.skillD = this.game.input.keyboard.addKey(Phaser.Keyboard.F);
	this.skillE = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

	// Add this object into existing game
	this.game.add.existing(this);
	BasicGame.playerCG.add(this);

	// Multiplayer stuff
	if (id == "SoloKid" || id == "retard_Bot") {
		this.refMP = this.game.state.states['MainGame'];
	} else {
		this.refMP = this.game.state.states['Multiplayer'];
	}
	this.stepTimer = 0;
	this.timeStep = this.refMP.timeStep;
	this.delta = this.refMP.delta;

	var teamFill = (team == BasicGame.myTeam) ? "#9AFEFF" : "red";
	var text = this.game.add.text(0, -this.height/2 - 10, this.nick + " " + this.heroLevel, { font: '12pt myfont', align: 'left', fill: teamFill, align: 'center'});
	text.anchor.setTo(0.5, 0);
	this.addChild(text);

	this.spawn();
}

// Kind of like inherts Sprite
BasicGame.HeroBase.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.HeroBase.prototype.constructor = BasicGame.HeroBase;

BasicGame.HeroBase.prototype.spawn = function() {
	if (this.isDead) {
		this.body.velocity.x = this.body.velocity.y = 0;
		this.isAttacking = false;
		var spawnTime = 5000 + (this.heroLevel * 1000);
		var tween = this.game.add.tween(this).to({0: 0}, spawnTime, Phaser.Easing.Linear.None, true, 0, 0);
		tween.onStart.add(function(){
			this.animations.play('anim_dead');
		}, this);
		tween.onComplete.add(function(){
			// If not dead
			if (this.isDead && !this.isRevived) {
				console.log('spawning ')
				if (this.myTeam == null) {
					this.myTeam = 1;
				}
				// Spawn points based on team index
				this.x = this.refMP.spawnPoints[this.myTeam].x;
				this.y = this.refMP.spawnPoints[this.myTeam].y;
				this.curHealth = this.maxHealth;
				this.animations.play('anim_idle');
				this.isDead = false;
			}
			// If got revived, reset
			if (this.isRevived) {
				this.isRevived = false;
			}
		}, this);
	} else {
		//var index = this.game.rnd.integerInRange(0, this.refMP.spawnPoints.length - 1);
		if (this.myTeam == null) {
			this.myTeam = 1;
		}
		this.x = this.refMP.spawnPoints[this.myTeam].x;
		this.y = this.refMP.spawnPoints[this.myTeam].y;
	}

};

BasicGame.HeroBase.prototype.handleControls = function() {
	// Sending input to server
	this.myInput.left = this.cursors.left.isDown;
	this.myInput.right = this.cursors.right.isDown;
	this.myInput.up = this.cursors.up.isDown;
	this.myInput.down = this.cursors.down.isDown;
	this.myInput.skillA = this.skillA.isDown;
	this.myInput.skillB = this.skillB.isDown;
	this.myInput.skillC = this.skillC.isDown;
	this.myInput.skillD = this.skillD.isDown;
	this.myInput.skillE = this.skillE.isDown;

	var myInputChanged = (
		this.cursor.left != this.myInput.left ||
		this.cursor.right != this.myInput.right ||
		this.cursor.up != this.myInput.up ||
		this.cursor.down != this.myInput.down ||
		this.cursor.skillA != this.myInput.skillA ||
		this.cursor.skillB != this.myInput.skillB ||
		this.cursor.skillC != this.myInput.skillC ||
		this.cursor.skillD != this.myInput.skillD ||
		this.cursor.skillE != this.myInput.skillE
	);

	// If input has changed
	if (myInputChanged) {
		if (this.ID == BasicGame.myID) {
			// multiplayer
			this.myInput.x = this.x;
			this.myInput.y = this.y;
			if (this.ID == "SoloKid") {
				// Single Player
				BasicGame.MainGame.prototype.updateState("SoloKid", this.myInput);
			} else {
				// Multiplayer
				BasicGame.eurecaServer.handleKeys(this.myInput, BasicGame.roomID);
			}
		}
	}
	
	// Every time step, update all clients of local position
	if (this.game.time.now > this.stepTimer) {

		if (this.ID == BasicGame.myID) {
			this.stepTimer = this.game.time.now + this.timeStep;
			this.myInput.x = this.x;
			this.myInput.y = this.y;
			this.myInput.hp = this.curHealth;
			this.myInput.lvl = this.heroLevel;
			this.myInput.expNext = this.heroToNextLevel;
			this.myInput.exp = this.heroExp;
			this.myInput.inCircle = this.inCircle;

			if (this.ID != "SoloKid") {
				BasicGame.eurecaServer.compensate(this.myInput, BasicGame.roomID);
			}
		}
	}

	// Limit skill usage
	if (this.game.time.now > this.skillTimer) {
		this.skillsEnabled = true;
	}

	// Local client
	if (this.cursor.left && !this.isAttacking && !this.inShield) {
		this.facingRight = -1;
    	this.scale.x = -this.scaleX;
		this.body.velocity.x = -this.moveSpeed;

		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}

	} else if (this.cursor.right && !this.isAttacking && !this.inShield) {
		this.facingRight = 1;
    	this.scale.x = this.scaleX;
		this.body.velocity.x = this.moveSpeed;
		
		if (this.body.onFloor()) {
			this.animations.play('anim_run');	
		}
	} 

	// If jump is pressed, body is on floor, and jump timer is over && not attacking
 	if (this.cursor.up && this.game.time.now > this.jumpTimer && this.jumpCount < this.jumpLimit && !this.isAttacking)
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
    else if (this.body.velocity.x == 0 && this.body.onFloor()  && !this.isAttacking) {
    	this.animations.play('anim_idle');
    	this.jumpCount = 0;
    } 
    else if (this.body.onFloor()) {
    	this.jumpCount = 0;
    }
    this.inShield = false;
};

BasicGame.HeroBase.prototype.getHit = function(damage, knockbackX, knockbackY, killerInfo) {
	this.effect.play(this.hitAnim, this, 0, 0);

	// Can only get hit if not dead
	if (!this.isDead) {
		var cur = 0;
		var tween = this.game.add.tween(this).to({tint: 0xff0000}, 100, Phaser.Easing.Linear.None, true, 0, 5, true);
		tween.onRepeat.add(function() {
			cur++;
			if (cur > 4) {	
				tween.stop();
				this.tint = 0xffffff;
			}
		}, this);

		this.body.velocity.x += knockbackX;
		this.body.velocity.y -= knockbackY;
		this.curHealth -= Math.round(damage);

		// If dead, respawn
		if (this.curHealth <= 0) {
			this.curHealth = 0;
			this.isDead = true; // kill confirmed

			// If local client is the killer then send to server,
			// otherwise every client will be incrementing score 
			if (BasicGame.myID == killerInfo.ID || BasicGame.myID == "SoloKid") {
				// credit kill to killerID
				if (BasicGame.myID == "SoloKid") {
					// Single Player kill handling
					if(killerInfo.ID == "SoloKid") {
						this.refMP.teamScores[1]++; // add to teamscore
					} else {
						this.refMP.teamScores[2]++; // add to teamscore
					}
				} else {
					BasicGame.eurecaServer.playerKillTDM(killerInfo.myTeam, BasicGame.roomID); // Credit score to killer's team on server
				}
			}

			// Calculate exp to credit to the killer based on killer's hero level and level difference. if level difference is more than 10
			// credit a base 100 exp. else change exp given by 0.1x per level difference
			var levelDiff = this.heroLevel - killerInfo.heroLevel;
			var expToGive = (levelDiff >= 10) ? 100 : (50 * killerInfo.heroLevel * (1 + (levelDiff / 10)));

			creditExp(killerInfo, Math.round(expToGive)); // give exp to killer

			console.log("Dead");
			this.spawn();

			// broadcast kill feed
			this.refMP.broadcast(this.nick + " has been killed by " + killerInfo.nick, 2);
		}
	}
};

BasicGame.HeroBase.prototype.getSkillA = function() {
	return this.game.math.clamp((this.game.time.now - this.skillATimer) / this.skillACooldown, -1, 0);
};

BasicGame.HeroBase.prototype.getSkillB = function() {
	return this.game.math.clamp((this.game.time.now - this.skillBTimer) / this.skillBCooldown, -1, 0);
};

BasicGame.HeroBase.prototype.getSkillC = function() {
	return this.game.math.clamp((this.game.time.now - this.skillCTimer) / this.skillCCooldown, -1, 0);
};

BasicGame.HeroBase.prototype.getSkillD = function() {
	return this.game.math.clamp((this.game.time.now - this.skillDTimer) / this.skillDCooldown, -1, 0);
};

BasicGame.HeroBase.prototype.getSkillE = function() {
	return this.game.math.clamp((this.game.time.now - this.skillETimer) / this.skillECooldown, -1, 0);
};

BasicGame.HeroBase.prototype.getHP = function() {
	return this.curHealth / this.maxHealth;
};

BasicGame.HeroBase.prototype.getExp = function() {
	return this.heroExp / this.heroToNextLevel;
};

BasicGame.HeroBase.prototype.kill = function() {
	this.destroy();
};

BasicGame.HeroBase.prototype.attackCallback = function() {
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroBase.prototype.shootCallback = function() {
	this.isAttacking = false;
	this.attackCollider.deactivate();
};

BasicGame.HeroBase.prototype.miteCallback = function(obj1, obj2, team) {
	// If not the same team, then destroy
	if (this.myTeam != this.team ) {//|| this.team == null) {
		// If projectile then destroy projectile
		if (obj1.key == "walker_rocket" || obj1.key == "walker_rocket" ||
		obj1.key == "grenade" || obj1.key == "laser_blue" || obj1.key == "laser_red" || obj1.key == "slimeball" || obj1.key == "mite_sprite") {
			obj1.kill();
		}
		if (obj1.key != "effects_sprite") {
			obj2.kill();
		}
	}
};

BasicGame.HeroBase.prototype.magicCircleCallback = function() {
	this.inCircle = true;
};

BasicGame.HeroBase.prototype.applyBuff = function(buffName, amount, duration, delay, clientTeam) {
	if (buffName == "BUFF_SLOW" || buffName == "BUFF_HASTE") {
		var tween = this.game.add.tween(this).to({0: 0}, duration, Phaser.Easing.Linear.None, true, delay);
		tween.onStart.add(function() {
			this.isBuffed = true;
			this.moveSpeed = amount;
		}, this);
		tween.onComplete.add(function() {
			this.isBuffed = false;
			this.moveSpeed = this.defaultMoveSpeed;
		}, this);

		//this.buffEffect.playTimed(buffName, this, 0, 0, duration);
		if (buffName == "BUFF_SLOW") {
			this.slowEffect.playTimed('anim_1', this, 0, 0, duration);
		} else {
			this.hasteEffect.playTimed('anim_1', this, 0, 0, duration);
		}
	} 

	if (buffName == "BUFF_FURY") {
		var fury = this.game.add.tween(this).to({0: 0}, duration, Phaser.Easing.Linear.None, true, delay);
		fury.onStart.add(function() {
			this.isBuffed = true;
			this.skillACooldown = amount;
		}, this);
		fury.onComplete.add(function() {
			this.isBuffed = false;
			this.skillACooldown = this.defaultAS;
		}, this);
	}

	if (buffName == "BUFF_INVIS") {
		var invis = this.game.add.tween(this).to({alpha: 0.05}, 500, Phaser.Easing.Linear.None, true, delay);

		if(this.myTeam != clientTeam) {
			var invis = this.game.add.tween(this).to({alpha: 0.00}, 500, Phaser.Easing.Linear.None, true, delay);
		} else {
			var invis = this.game.add.tween(this).to({alpha: 0.2}, 500, Phaser.Easing.Linear.None, true, delay);
		}
		
		invis.onStart.add(function() {
			this.isBuffed = true;
		}, this);
		var invisEnd = this.game.add.tween(this).to({alpha: 1}, 500, Phaser.Easing.Linear.None, false, duration);
		invisEnd.onComplete.add(function() {
			this.isBuffed = false;
		}, this);
		invis.chain(invisEnd);
	}
};

// function to handle exp
function creditExp(targetPlayer, exp) {
	console.log("adding exp to " + targetPlayer.ID)
	targetPlayer.heroExp += exp;
	while (targetPlayer.heroExp >= targetPlayer.heroToNextLevel) {
		onLevelUp(targetPlayer); // perform levelup on target player
	}
};

// on level up event, update stats
function onLevelUp(targetPlayer) {
	if (targetPlayer.heroLevel < 25) { //Level Limit
		var originalHPPercent = targetPlayer.curHealth / targetPlayer.maxHealth;

		targetPlayer.heroLevel ++;
		// Hero attributes
		targetPlayer.moveSpeed += targetPlayer.movSpeed; // update movement speed
		targetPlayer.defaultMoveSpeed += targetPlayer.movSpeed;
		targetPlayer.maxHealth += (targetPlayer.constituition * 5); // update max hp
		targetPlayer.curHealth = Math.round(originalHPPercent * targetPlayer.maxHealth);
		 // update atk speed with a limiter tied to it (Best Atk speed = 0.2s per hit)
		targetPlayer.skillACooldown = (targetPlayer.skillACooldown - (targetPlayer.atkSpeed * 2) <= 200) ? 200 : targetPlayer.skillACooldown - (targetPlayer.atkSpeed * 2);

		// Update Cooldown
		targetPlayer.defaultAS = (targetPlayer.defaultAS - (targetPlayer.atkSpeed * 2) <= 200) ? 200 : targetPlayer.defaultAS - (targetPlayer.atkSpeed * 2);
		targetPlayer.skillBCooldown -= targetPlayer.skillBLvl;
		targetPlayer.skillCCooldown -= targetPlayer.skillCLvl;
		targetPlayer.skillDCooldown -= targetPlayer.skillDLvl;
		targetPlayer.skillECooldown -= targetPlayer.skillELvl;

		// post levelup calculation
		targetPlayer.heroExp -= targetPlayer.heroToNextLevel; // update remaining exp
		targetPlayer.heroToNextLevel = targetPlayer.heroLevel * 80 // calculate next levelup requirement
	}
};

