BasicGame.MainGame = function (game) {
	this.playerList;					// Player list
	this.playerListHUD;
	this.logo;
	this.selectedChar = '';				// Selected character
	this.team = '';						// Selected Team
	this.teamScores = [0, 0, 0];			// Single Player Team Score
	this.winState = false;				// win condition not met

	this.gravity = 5000;				// Gravity
	this.spawnX = 1000;					// Starting spawn
	this.spawnY = 1000;

	this.mapLayer;

	this.timeStep = 350;				// Time step for interpolation (Needed to prevent null entry in HeroBase.js)
	this.delta = 5;						// Delta for smoothing (Needed to prevent game from breaking)

	this.spawnPoints = [				// Array of spawn points, set in each hero class
		{x: 1000,  y: 250},
		{x: 360,  y: 500},				// Team 1 spawn
		{x: 2800, y: 500},				// Team 2 spawn
		{x: 2500,  y: 500}
	];

	this.teamScores = [
		0, 
		0,
		0
	];

	this.magicSpawnPoints = [			// Array of magic circle spawn points
		{x: 490,  y: 635},
		{x: 1750,  y: 700},
		{x: 1750, y: 1260},
		{x: 3010,  y: 640}
	];

	this.AIList = [						// Predefined list of AI id in the format "AI_Bot" + Hero + number + team
		'AI_Bot_trooper_1_2',  	 // Ace
		'AI_Bot_destroyer_1_2',  // Destroyer
		'AI_Bot_gunner_1_2',  // Disruptor
		'AI_Bot_walker_1_2'      // Walker
	];

	this.teamAHUD;
	this.teamBHUD;
	this.playerHUD;
};

BasicGame.MainGame.prototype.init = function() {
	// Initialize BasicGame core info
	BasicGame.myID = "SoloKid";
	BasicGame.myNick = "Trainee";
  	BasicGame.myTeam = 1;
};

BasicGame.MainGame.prototype.preload = function() {
	// variables setting
	var ref = this;	

	BasicGame.MainGame.prototype.updateState = function(id, state) {
		// Update state sends local remote input to every client 
		var curPlayer = ref.playerList[id][0];
		if (curPlayer) {
			// Update player's cursor with state
			curPlayer.cursor = state;
			//curPlayer.update();
		}
	};

	BasicGame.MainGame.prototype.compensate = function(id, state) {
		// Compensate corrects server side position, does not touch local client
		var curPlayer = ref.playerList[id][0];
		if (curPlayer && BasicGame.myID != id) {
			//console.log('compensating');
			curPlayer.x = state.x;
			curPlayer.y = state.y;
			curPlayer.curHealth = state.hp;
			curPlayer.heroLevel = state.lvl;
			curPlayer.heroExp = state.exp;
			//curPlayer.interpolateTo(state.x, state.y, 1000);
		}
		//console.log(BasicGame.myID, id);
		if (curPlayer && BasicGame.myID == id) {
			curPlayer.inCircle = state.inCircle;
			// console.log(curPlayer.ID +  " " + curPlayer.inCircle);
			if (curPlayer.inCircle) {
				creditExp(curPlayer, 20);
			}
		}
		ref.updatePlayerList();
	};	

	BasicGame.MainGame.prototype.setIndex = function(index) {
		// Return player's selected character
		// if (ref.magicCircle != null) {
		// 	ref.magicCircle.position = ref.magicSpawnPoints[index];
		// 	console.log('setting magic circle to: ' + ref.magicCircle.position.x + ' ' + ref.magicCircle.position.y);
		// 	ref.broadcast("The sigil of Antares has appeared", 2);
		// }
	};

	this.preloadGame();
};


BasicGame.MainGame.prototype.preloadGame = function() {
	this.physics.startSystem(Phaser.Physics.ARCADE);
	this.physics.arcade.gravity.y = this.gravity;

	// Set background color
	this.stage.backgroundColor = '#787878';

	// Add tilemap
	map = this.add.tilemap('single_player');					// 'map' must be same as the one in Boot.js
	map.addTilesetImage('lab_tilesheet', 'lab_tiles');			// 'sheet' must be the same also

	// map = this.add.tilemap('graveyard');					// 'map' must be same as the one in Boot.js
	// map.addTilesetImage('graveyard', 'graveyard_tiles');			// 'sheet' must be the same also
	// map.addTilesetImage('graveyard_bg', 'graveyard_background');

	var background = map.createLayer('background');	// 'Background' must be the same in the json file
	background.resizeWorld();
	background.wrap = true;

	layer = map.createLayer('level');				// 'Level 1' must be the same in the json file
	layer.resizeWorld();
	layer.wrap = true;

	this.mapLayer = layer;

	map.setCollisionBetween(17, 38, true, layer);	// Set collision layers between json tile representation

	this.physics.arcade.TILE_BIAS = 60;				// The higher the tile bias, the more unlikely it is the player will fall through

    //this.inputField = this.game.plugins.add(Fabrique.Plugins.InputField);
    //this.nineSlice = this.game.plugins.add(Fabrique.Plugins.NineSlice);

    // Uncomment for chat
	//this.chatBox = this.game.add.inputField(260, 680, {
	//	width: 260,
	//	height: 20,
	//	placeHolder: 'Type something here'
	//});
	//this.chatBox.fixedToCamera = true;

	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.enter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);


	// Chat
	var test =  { font: '16pt myfont', align: 'center', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 400};
	this.playerText = this.game.add.text(-100, -100, "Default", test);
	this.textTimer = 0;

	this.createGame(); // preload complete, start to create game
	//this.spawnAI("AI_Bot_walker_1_1", 500, 1000, "player_walker", "Ally Walker(AI)", 1, 5); // ALLY WALKER COMMAND
	this.shuffleArray(this.AIList);
	this.spawnRandomAIFromList(1, 2);
};

BasicGame.MainGame.prototype.spawnRandomAIFromList = function(initLvl, team) {
	var teamUnitcount = 0;
	for (var idx in this.playerList) {
		if (this.playerList[idx][2] == team) {
			teamUnitcount++;
		}
	}
	if (this.AIList[enemyCount] != null) { // spawn if the enemy limit has not been reached
		// AI have not been spawned
		var AIPropertySplit = this.AIList[teamUnitcount].split("_"); // Decode list info
		console.log(AIPropertySplit);
		if (AIPropertySplit[2] == "trooper") {
			var AIname = "Ace";
			var AIMessage = "The enemy has brought out their Ace, good luck surviving.";
		} else if (AIPropertySplit[2] == "destroyer") {
			var AIname = "Destroyer";
			var AIMessage = "Destroyer, incoming!";
		} else if (AIPropertySplit[2] == "walker") {
			var AIname = "Walker";
			var AIMessage = "Enemy Walker wants to fight!";
		} else if (AIPropertySplit[2] == "gunner") {
			var AIname = "Disruptor";
			var AIMessage = "Enemy support has arrived!";
		}

		this.spawnAI(this.AIList[teamUnitcount], 500, 1000, "player_" + AIPropertySplit[2], "Enemy " + AIname + "(AI)", AIPropertySplit[4], initLvl);
		this.broadcast(AIMessage, 2);
	}
}

BasicGame.MainGame.prototype.scriptAIAce = function(target, me) {
	// function script which react base on target's behaviour
	if (target != null) {
		if (me.curHealth / me.maxHealth < 0.15 || target.isDead) {
			// low hp, go heal
			me.hpTrigger = true;
		} else if (me.curHealth / me.maxHealth > 0.85) {
			me.hpTrigger = false;
		}

		if (me.hpTrigger) {
			// go back base to heal
			if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else {
				if (me.myTeam == 1) {
					me.cursor.right = false;
					me.cursor.left = true;
				} else if (me.myTeam == 2) {
					me.cursor.right = true;
					me.cursor.left = false;
				}
				me.cursor.up = true;
				me.cursor.skillA = false;
			}
		} else {
			// Go and fight the target
			if (!target.isDead && !me.isDead) {
				var distDiff = target.x - me.x;
				// hunt down the target
				if(distDiff > 150) {
					// target is on the right
					me.cursor.skillA = false;
					me.cursor.left = false;
					me.cursor.right =  true;
				} else if(distDiff < -150) {
					me.cursor.skillA = false;
					me.cursor.right = false;
					me.cursor.left  = true;
				} else {
					// target is within attack range
					me.cursor.up = false;
					me.cursor.left = false;
					me.cursor.right = false
					if (target.x > me.x) {
						// face right
						me.facingRight = 1;
	    				me.scale.x = me.scaleX;
					} else {
						// face left
						me.facingRight = -1;
	    				me.scale.x = -me.scaleX;
					}
					me.cursor.skillA = true;
				}

				if (target.y < me.y - 40) {
					// target is above me
					me.cursor.up = true; // jump
				} else {
					// target is below or same level as me
					me.cursor.up = false;
				}

				if (target.x - me.x > 1200 || target.x - me.x < -1200) {
					// long range behaviour
					if (me.game.time.now > me.skillBTimer) {
						// second skill is available. use skill first
						me.cursor.skillB = true;
					} else {
						me.cursor.skillB = false;
					}

					if (me.game.time.now > me.skillCTimer) {
						// second skill is available. use skill first
						me.cursor.skillC = true;
					} else {
						me.cursor.skillC = false;
					}

					if (me.game.time.now > me.skillETimer) {
						// second skill is available. use skill first
						me.cursor.skillE = true;
					} else {
						me.cursor.skillE = false;
					}
				}

				if (me.game.time.now > me.skillDTimer && me.curHealth / me.maxHealth < 0.7) {
					// second skill is available. use skill first
					me.cursor.skillD = true;
				} else {
					me.cursor.skillD = false;
				}
			} else {
				// target is dead. go back to heal up/rest
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillE = false;
			}
		}
	} else {
		// no targets assigned, go back base to heal
		if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else {
			if (me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.left = true;
			} else if (me.myTeam == 2) {
				me.cursor.right = true;
				me.cursor.left = false;
			}
			me.cursor.up = true;
			me.cursor.skillA = false;
		}
	}
};

BasicGame.MainGame.prototype.scriptAIWalker = function(target, me) {
	// function script which react base on target's behaviour
	if (target != null) {
		if (me.curHealth / me.maxHealth < 0.15 || target.isDead) {
			// low hp, go heal
			me.hpTrigger = true;
		} else if (me.curHealth / me.maxHealth > 0.85) {
			me.hpTrigger = false;
		}

		if (me.hpTrigger) {
			// go back base to heal
			if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else {
				if (me.myTeam == 1) {
					me.cursor.right = false;
					me.cursor.left = true;
				} else if (me.myTeam == 2) {
					me.cursor.right = true;
					me.cursor.left = false;
				}
				me.cursor.up = true;
				me.cursor.skillA = false;
			}
		} else {
			// Go and fight the target
			if (!target.isDead && !me.isDead) {
				var distDiff = target.x - me.x;
				// hunt down the target
				if(distDiff > 150) {
					// target is on the right
					me.cursor.skillA = false;
					me.cursor.left = false;
					me.cursor.right =  true;
				} else if(distDiff < -150) {
					me.cursor.skillA = false;
					me.cursor.right = false;
					me.cursor.left  = true;
				} else {
					// target is within attack range
					me.cursor.skillB = false;
					me.cursor.up = false;
					me.cursor.left = false;
					me.cursor.right = false
					if (target.x > me.x) {
						// face right
						me.facingRight = 1;
	    				me.scale.x = me.scaleX;
					} else {
						// face left
						me.facingRight = -1;
	    				me.scale.x = -me.scaleX;
					}
					me.cursor.skillA = true;
				}

				if (target.y < me.y - 36) {
					// target is above me
					me.cursor.up = true; // jump
				} else {
					// target is below or same level as me
					me.cursor.up = false;
				}

				if (Math.abs(distDiff) < 600) {
					// use twin missile
					if (me.game.time.now > me.skillCTimer) {
						// second skill is available. use skill first
						me.cursor.skillB = false;
						me.cursor.skillC = true;
						me.cursor.skillA = false;
					} else {
						me.cursor.skillC = false;
					}
				}

				if (Math.abs(distDiff) < 50) {
					// evasion when below half hp
					if (me.game.time.now > me.skillDTimer) {
						// second skill is available. use skill first
						me.cursor.skillB = false;
						me.cursor.skillD = true;
						me.cursor.skillC = false; // overwrites missile attack
						me.cursor.skillA = false;
					} else {
						me.cursor.skillD = false;
					}
				}

				if (Math.abs(distDiff) > 250 && (target.cursor.skillA || target.cursor.skillB || target.cursor.skillC || target.cursor.skillD || target.cursor.skillE)) {
					// shield logic
					if (me.game.time.now > me.skillDTimer && !me.shieldActive) {
						// shield ready. use it to defend
						me.cursor.skillD = false;
						me.cursor.skillB = true;
						me.cursor.skillC = false; // overwrites missile attack
						me.cursor.skillA = false;
					} else {
						me.cursor.skillB = false;
					}
				} else if (Math.abs(distDiff) < 220) {
					// shield deactivate
					if (me.game.time.now > me.skillDTimer && me.shieldActive) {
						me.cursor.skillD = false;
						me.cursor.skillB = true;
						me.cursor.skillC = false; // overwrites missile attack
						me.cursor.skillA = false;
					}
				}

				if (Math.abs(distDiff) < 550 && Math.abs(distDiff) > 300 && me.body.velocity.y > 30) {
					if (me.game.time.now > me.skillETimer && !me.shieldActive) {
						// ultimate is available. use skill first (Overwrites everything else)
						me.cursor.skillA = false;
						me.cursor.skillB = false;
						me.cursor.skillC = false;
						me.cursor.skillD = false;
						me.cursor.skillE = true;
						me.cursor.up = false;
					} else {
						me.cursor.skillE = false;
					}
				}
			} else {
				// target is dead. go back to heal up/rest
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = false;
				me.cursor.skillE = false;
			}
		}
	} else {
		// no targets assigned, go back base to heal
		if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else {
			if (me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.left = true;
			} else if (me.myTeam == 2) {
				me.cursor.right = true;
				me.cursor.left = false;
			}
			me.cursor.up = true;
			me.cursor.skillA = false;
			me.cursor.skillB = false;
			me.cursor.skillC = false;
			me.cursor.skillD = false;
			me.cursor.skillE = false;
		}
	}
};

BasicGame.MainGame.prototype.scriptAIDestroyer = function(target, me) {
	// function script which react base on target's behaviour
	if (target != null) {
		if (me.curHealth / me.maxHealth < 0.15 || target.isDead) {
			// low hp, go heal
			me.hpTrigger = true;
		} else if (me.curHealth / me.maxHealth > 0.85) {
			me.hpTrigger = false;
		}

		if (me.hpTrigger) {
			// go back base to heal
			me.cursor.skillA = false; // disable all combat
			me.cursor.skillB = false;
			me.cursor.skillC = false;
			me.cursor.skillD = false;
			me.cursor.skillE = false;
			if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else {
				if (me.myTeam == 1) {
					me.cursor.right = false;
					me.cursor.left = true;
				} else if (me.myTeam == 2) {
					me.cursor.right = true;
					me.cursor.left = false;
				}
				me.cursor.up = true;
			}
		} else {
			// Go and fight the target
			if (!target.isDead && !me.isDead) {
				var distDiff = target.x - me.x;
				// hunt down the target
				if(distDiff > 300) {
					// target is on the right
					me.cursor.left = false;
					me.cursor.right =  true;
				} else if(distDiff < -300) {
					// target is on the left
					me.cursor.right = false;
					me.cursor.left  = true;
				} else {
					// target is within critical range
					me.cursor.right = false;
					me.cursor.left  = false;
					if (target.x > me.x) {
						// target is at the right, face right
						me.facingRight = 1;
	    				me.scale.x = me.scaleX;
					} else {
						// target is at the left, face left
						me.facingRight = -1;
	    				me.scale.x = -me.scaleX;
					}

					// use rifle charge if nearby
					if (me.game.time.now > me.skillBTimer) {
						me.cursor.skillA = false;
						me.cursor.skillB = true;
					} else {
						me.cursor.skillB = false;
					}

					if (me.game.time.now > me.skillCTimer) {
						// use shotgun if rifle charge is used
						me.cursor.skillA = false;
						me.cursor.skillC = true;
					} else {
						me.cursor.skillC = false;
					}
				}

				if (me.game.time.now > me.skillDTimer && target.x - me.x < 600 && target.x - me.x >= 0) {
					// third skill is available. use skill first
					me.cursor.skillA = false;
					me.cursor.skillB = false;
					me.cursor.skillC = false;
					me.cursor.skillD = true;
				} else if (me.game.time.now > me.skillDTimer && target.x - me.x > -600 && target.x - me.x <= 0) {
					me.cursor.skillA = false;
					me.cursor.skillB = false;
					me.cursor.skillC = false;
					me.cursor.skillD = true;
				} else {
					me.cursor.skillD = false;
				}

				if (me.game.time.now < me.skillBTimer && me.game.time.now < me.skillCTimer && me.game.time.now < me.skillDTimer) { // all other skills are activated
					if (me.game.time.now > me.skillETimer && Math.abs(distDiff) < 90) {
						// use ultimate
						me.cursor.skillA = false;
						me.cursor.skillB = false;
						me.cursor.skillC = false;
						me.cursor.skillD = false;
						me.cursor.skillE = true;
					} else {
						me.cursor.skillE = false;
					}
				}

				// target is within bullet range, start randomly firing
				if (!me.cursor.skillB && !me.cursor.skillC && !me.cursor.skillD && !me.cursor.skillE ) { // disable normal attack to use skills
					if (target.x - me.x < 800 && target.x - me.x >= 0) {
						me.cursor.skillA = true;
					} else if (target.x - me.x > -800 && target.x - me.x <= 0) {
						me.cursor.skillA = true;
					} else {
						me.cursor.skillA = false;
					}
				}

				// jump AI
				if (target.y < me.y - 40) {
					// target is above me
					me.cursor.up = true; // jump
				} else {
					// target is below or same level as me
					me.cursor.up = false;
				}
			} else {
				// target is dead. go back to heal up/rest
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = false;
				me.cursor.skillE = false;
			}
		}
	} else {
		// no targets assigned, go back base to heal
		me.cursor.skillA = false; // disable all combat
		me.cursor.skillB = false;
		me.cursor.skillC = false;
		me.cursor.skillD = false;
		me.cursor.skillE = false;
		if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else {
			if (me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.left = true;
			} else if (me.myTeam == 2) {
				me.cursor.right = true;
				me.cursor.left = false;
			}
			me.cursor.up = true;
		}
	}
};

BasicGame.MainGame.prototype.scriptAIDisruptor = function(target, me) {
	// function script which react base on target's behaviour
	if (target != null) {
		if (me.curHealth / me.maxHealth < 0.15 || target.isDead) {
			// low hp, go heal
			me.hpTrigger = true;
		} else if (me.curHealth / me.maxHealth > 0.85) {
			me.hpTrigger = false;
		}

		for (var idx in this.playerList) {
			if (this.playerList[idx][2] == 2) {
				// same team
				if (this.playerList[idx][0].isDead && me.game.time.now > me.skillETimer) {
					// can use revive, use it
					me.reviveAlly = this.playerList[idx][0];
					break;
				}
			}
			me.reviveAlly = null;
		}

		// reset ulti button incase
		me.cursor.skillE = false;

		if (me.hpTrigger) {
			// go back base to heal
			me.cursor.skillA = false; // disable all combat
			me.cursor.skillB = false;
			me.cursor.skillC = false;
			me.cursor.skillD = false;
			me.cursor.skillE = false;
			if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.up = false;
				me.cursor.left = false;
				me.cursor.skillA = false;
			} else {
				if (me.myTeam == 1) {
					me.cursor.right = false;
					me.cursor.left = true;
				} else if (me.myTeam == 2) {
					me.cursor.right = true;
					me.cursor.left = false;
				}
				me.cursor.up = true;
			}
		} else if (me.reviveAlly != null) {
			// go to ally and revive
			var allyDistDiff = me.reviveAlly.x - me.x;
			if (allyDistDiff > 220) {
				me.cursor.left = false;
				me.cursor.right =  true;
				me.cursor.up = true;
			} else if (allyDistDiff < -220) {
				me.cursor.right = false;
				me.cursor.left  = true;
				me.cursor.up = true;
			} else {
				me.cursor.up = false
				me.cursor.right = false;
				me.cursor.left  = false;
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = false;
				me.cursor.skillE = true;
				if (allyDistDiff > 0) {
					me.facingRight = 1;
		    		me.scale.x = me.scaleX;
				} else {
					me.facingRight = -1;
		    		me.scale.x = -me.scaleX;
				}
			}
		} else {
			// Go and fight the target
			if (!target.isDead && !me.isDead) {
				var distDiff = target.x - me.x;
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = false;
				me.cursor.skillE = false;
				// hunt down the target
				if(distDiff > 550) {
					// target is on the right
					me.cursor.left = false;
					me.cursor.right =  true;
				} else if(distDiff < -550) {
					// target is on the left
					me.cursor.right = false;
					me.cursor.left  = true;
				} else {
					// jump AI (to match target's height)
					if (target.y < me.y - 40) {
						// target is above me
						me.cursor.up = true; // jump
					} else {
						// target is below or same level as me
						me.cursor.up = false;
					}

					// target is within critical range
					if (Math.abs(distDiff) < 400 && me.x < this.spawnPoints[me.myTeam].x) {
						// target can hit in melee range, retreat
						if (Math.abs(distDiff) < 250) {
							// add code to trigger panic jump in case a higher ground is available.
							me.cursor.up = true;
						} else {
							me.cursor.up = false;
						}

						if (target.x > me.x) {
							me.cursor.right = false;
							me.cursor.left  = true;
						} else {
							me.cursor.right = true;
							me.cursor.left  = false;
						}
						me.cursor.skillA = false
					} else {
						// combat movement
						me.cursor.right = false;
						me.cursor.left  = false;
						if (target.x > me.x) {
							// target is at the right, face right
							me.facingRight = 1;
		    				me.scale.x = me.scaleX;
						} else {
							// target is at the left, face left
							me.facingRight = -1;
		    				me.scale.x = -me.scaleX;
						}
						if (target.x <= this.spawnPoints[target.myTeam].x + 200) {
							// target is at spawn. invade base
							if (me.x > this.spawnPoints[target.myTeam].x + 250) {
								me.cursor.left = true;
							}	
						}

						me.cursor.skillA = true; // keep attacking in combat
						
						// use mite when available
						if (me.game.time.now > me.skillBTimer) {
							me.cursor.skillA = false;
							me.cursor.skillB = true;
						} else {
							me.cursor.skillB = false;
						}
						
						// use goo when available
						if (me.game.time.now > me.skillCTimer) {
							me.cursor.skillA = false;
							me.cursor.skillB = false;
							me.cursor.skillC = true;
						} else {
							me.cursor.skillC = false;
						}

					}
				}
			} else {
				// target is dead. go back to heal up/rest
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = false;
				me.cursor.skillE = false;
			}

			// use healthpack whenever disruptor can
			if (me.game.time.now > me.skillDTimer) {
				me.cursor.skillA = false;
				me.cursor.skillB = false;
				me.cursor.skillC = false;
				me.cursor.skillD = true;
				me.cursor.skillE = false;
			} else {
				me.cursor.skillD = false;
			}
		}
	} else {
		// go back base to heal
		me.cursor.skillA = false; // disable all combat
		me.cursor.skillB = false;
		me.cursor.skillC = false;
		me.cursor.skillD = false;
		me.cursor.skillE = false;
		if (me.x >= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 2) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else if (me.x <= this.spawnPoints[me.myTeam].x && me.y >= this.spawnPoints[me.myTeam].y && me.myTeam == 1) {
			me.cursor.right = false;
			me.cursor.up = false;
			me.cursor.left = false;
			me.cursor.skillA = false;
		} else {
			if (me.myTeam == 1) {
				me.cursor.right = false;
				me.cursor.left = true;
			} else if (me.myTeam == 2) {
				me.cursor.right = true;
				me.cursor.left = false;
			}
			me.cursor.up = true;
		}
	}
};


BasicGame.MainGame.prototype.createGame = function() {
	var ref = this;
	var optionStyle = {font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};

	// Assign global groups
	BasicGame.playerCG = this.add.group();
	BasicGame.colliderCG = this.add.group();
	BasicGame.shieldCG = this.add.group();
	BasicGame.miteCG = this.add.group();

	this.playerList = {};

	// Create client's hero
	if (BasicGame.selectedChar == "player_trooper") {
		//console.log(this.game.rnd.integerInRange(0, 3));
		var player = new BasicGame.HeroTrooperMP(BasicGame.myID, this.game, 100, 100, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_walker") {
		var player = new BasicGame.HeroWalkerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_destroyer") {
		var player = new BasicGame.HeroDestroyerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}
	if (BasicGame.selectedChar == "player_gunner") {
		var player = new BasicGame.HeroGunnerMP(BasicGame.myID, this.game, 100, 1000, BasicGame.myTeam, BasicGame.myNick, 1);
	}

	this.playerList[BasicGame.myID] = [player, BasicGame.myNick, BasicGame.myTeam];
	this.camera.follow(player);

	this.player = player;

	// Add collider for spawns
	this.teamA = this.game.add.sprite(140, 700, 'fence');
	this.game.physics.arcade.enableBody(this.teamA);
	this.teamA.body.setSize(350, 100, 0, -40);
	this.teamA.body.allowGravity = false;
	this.game.add.existing(this.teamA);

	this.teamB = this.game.add.sprite(2660, 700, 'fence');
	this.game.physics.arcade.enableBody(this.teamB);
	this.teamB.body.setSize(350, 100, 0, -40);
	this.teamB.body.allowGravity = false;
	this.game.add.existing(this.teamB);

	// Player hud
	this.hud = this.game.add.image(10, 540, 'player_hud');
	this.hud.fixedToCamera = true;

	this.healthBar = this.game.add.image(363, 668, 'player_hud_bar');
	this.healthBar.fixedToCamera = true;
	this.healthBar.anchor.setTo(0, 1);
	this.healthRect = new Phaser.Rectangle(0, 0, this.healthBar.width, this.healthBar.height);

	this.healthBarPercentage = this.game.add.text(505, this.game.height - 65, '0%', { font: '14pt myfont', align: 'right', fill: 'white', stroke: '#7cabd5', strokeThickness: 2});
	this.healthBarPercentage.fixedToCamera = true;
	this.healthBarPercentage.anchor.setTo(0.5, 0.5);

	this.expBar = this.game.add.image(385, 692, 'player_hud_bar');
	this.expBar.fixedToCamera = true;
	this.expBar.anchor.setTo(0, 1);
	this.expRect = new Phaser.Rectangle(0, 0, this.expBar.width, this.expBar.height);

	this.expBarPercentage = this.game.add.text(520, this.game.height - 42, '0%', { font: '14pt myfont', align: 'right', fill: 'white', stroke: '#7cabd5', strokeThickness: 2});
	this.expBarPercentage.fixedToCamera = true;
	this.expBarPercentage.anchor.setTo(0.5, 0.5);

	this.playerLevel = this.game.add.text(360, this.game.height - 98, '[25]', {font: '16pt myfont', align:'right', fill:'white', stroke:'#7cabd5', strokeThickness: 2});
	this.playerLevel.fixedToCamera = true;
	this.playerLevel.anchor.setTo(0, 0.5);

	// Customized skill and portrait
	var char = BasicGame.selectedChar.substring(7);
	// Team gui
	this.logo = this.game.add.image(240, 0, 'score');
	this.teamAHUD = this.game.add.text(BasicGame.gameWidth/2 - 90, 40, 'TeamA', { font: '16pt myfont', align: 'right', fill: 'white'});
	this.teamBHUD = this.game.add.text(BasicGame.gameWidth/2 + 50, 40, 'TeamB', { font: '16pt myfont', align: 'left', fill: 'white'});

	this.logo.fixedToCamera = true;
	this.teamAHUD.fixedToCamera = true;
	this.teamBHUD.fixedToCamera = true;

	// Skills
	this.skillA = this.game.add.image(52, 626, char + '_hud_skillA');
	this.skillB = this.game.add.image(89, 694, char + '_hud_skillB');
	this.skillC = this.game.add.image(128, 626, char + '_hud_skillC');
	this.skillD = this.game.add.image(169, 694, char + '_hud_skillD');
	this.skillE = this.game.add.image(207, 626, char + '_hud_skillE');

	this.skillA.fixedToCamera = true;
	this.skillB.fixedToCamera = true;
	this.skillC.fixedToCamera = true;
	this.skillD.fixedToCamera = true;
	this.skillE.fixedToCamera = true;

	this.skillA.anchor.setTo(0.5, 1);
	this.skillB.anchor.setTo(0.5, 1);
	this.skillC.anchor.setTo(0.5, 1);
	this.skillD.anchor.setTo(0.5, 1);
	this.skillE.anchor.setTo(0.5, 1);

	this.skillAHotkey = this.game.add.text(15, 550, '[A]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillAHotkey.fixedToCamera = true;

	this.skillBHotkey = this.game.add.text(55, 620, '[S]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillBHotkey.fixedToCamera = true;

	this.skillCHotkey = this.game.add.text(95, 550, '[D]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillCHotkey.fixedToCamera = true;

	this.skillDHotkey = this.game.add.text(135, 620, '[F]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillDHotkey.fixedToCamera = true;

	this.skillEHotkey = this.game.add.text(175, 550, '[SPACE]', {font: '12pt myfont', fill: 'white', stroke: 'black', strokeThickness: '2'});
	this.skillEHotkey.fixedToCamera = true;

	// Input
	this.skillA.inputEnabled = true;
	this.skillA.events.onInputDown.add(function() {
		this.player.skillA.isDown = true;
	}, this);
	this.skillA.events.onInputUp.add(function() {
		this.player.skillA.isDown = false;
	}, this);

	this.skillB.inputEnabled = true;
	this.skillB.events.onInputDown.add(function() {
		this.player.skillB.isDown = true;
	}, this);
	this.skillB.events.onInputUp.add(function() {
		this.player.skillB.isDown = false;
	}, this);

	this.skillC.inputEnabled = true;
	this.skillC.events.onInputDown.add(function() {
		this.player.skillC.isDown = true;
	}, this);
	this.skillC.events.onInputUp.add(function() {
		this.player.skillC.isDown = false;
	}, this);

	this.skillD.inputEnabled = true;
	this.skillD.events.onInputDown.add(function() {
		this.player.skillD.isDown = true;
	}, this);
	this.skillD.events.onInputUp.add(function() {
		this.player.skillD.isDown = false;
	}, this);

	this.skillE.inputEnabled = true;
	this.skillE.events.onInputDown.add(function() {
		this.player.skillE.isDown = true;
	}, this);
	this.skillE.events.onInputUp.add(function() {
		this.player.skillE.isDown = false;
	}, this);

	// Portrait
	this.playerHUD = this.game.add.image(264, 648, char + '_portrait');
	this.playerHUD.anchor.setTo(0.5, 0.5);
	this.playerHUD.scale.setTo(0.62, 0.62);
	this.playerHUD.fixedToCamera = true;

	// Team list
	this.playerCount = 0;
	this.playerListHUD = [];
	this.addPlayerName(BasicGame.myID);

	// Mobile controls
	if (this.game.device.android || this.game.device.iOS) { // || this.game.device.desktop) {
		this.leftButton = this.game.add.image(1000, 600, 'arrowLeft');
		this.leftButton.fixedToCamera = true;
		this.leftButton.inputEnabled = true;

		this.rightButton = this.game.add.image(1100, 600, 'arrowRight');
		this.rightButton.fixedToCamera = true;
		this.rightButton.inputEnabled = true;

		this.upButton = this.game.add.image(240, 520, 'arrowUp');
		this.upButton.fixedToCamera = true;
		this.upButton.inputEnabled = true;

		this.leftButton.events.onInputDown.add(function() {
			this.player.cursors.left.isDown = true;
		}, this);
		this.leftButton.events.onInputUp.add(function() {
			this.player.cursors.left.isDown = false;
		}, this);

		this.rightButton.events.onInputDown.add(function() {
			this.player.cursors.right.isDown = true;
		}, this);
		this.rightButton.events.onInputUp.add(function() {
			this.player.cursors.right.isDown = false;
		}, this);

		this.upButton.events.onInputDown.add(function() {
			this.player.cursors.up.isDown = true;
		}, this);
		this.upButton.events.onInputUp.add(function() {
			this.player.cursors.up.isDown = false;
		}, this);
	}

	// Broadcast messages
	var style = {font: '32pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", wordWrap: true, wordWrapWidth: 800, align: 'center'};
	this.message = this.game.add.text(-500, 0, 'Default message', style), 
	this.message.fixedToCamera = true;
	this.message.anchor.setTo(0.5, 0.5);

	// Magic circle
	this.magicCircle = this.game.add.sprite(-500, -500, 'magicCircle');
	this.magicCircle.anchor.setTo(0.5, 0.5);
	this.game.physics.arcade.enableBody(this.magicCircle);
	this.magicCircle.body.setSize(400, 100, 0, -50);
	this.magicCircle.body.allowGravity = false;
	this.game.add.existing(this.magicCircle);

	// Initialize and reset team variables
	this.winState = false;
	this.teamScores = [
		0, 
		0,
		0
	];
};

BasicGame.MainGame.prototype.spawnAI = function(i, x, y, char, nick, team, defLVL) {
	// Spawn enemy at location
	var curX = x;
	var curY = y;
	if (x == 0 || y == 0) {
		curX = this.spawnX;
		curY = this.spawnY;
	}

	console.log('Spawning', i, curX, curY, char, nick, team);

	// If doesn't already exist
	if (this.playerList[i] == null) {
		if (char == "player_trooper") {
			var player = new BasicGame.HeroTrooperMP(i, this.game, curX, curY, team, nick, defLVL);
		} 
		if (char == "player_walker") {
			var player = new BasicGame.HeroWalkerMP(i, this.game, curX, curY, team, nick, defLVL);
		}
		if (char == "player_destroyer") {
			var player = new BasicGame.HeroDestroyerMP(i, this.game, curX, curY, team, nick, defLVL);
		}
		if (char == "player_gunner") {
			var player = new BasicGame.HeroGunnerMP(i, this.game, curX, curY, team, nick, defLVL);
			player.reviveAlly = null;
		}
		player.hpTrigger = true;
		this.playerList[i] = [player, nick, team];
		// Uncomment for team only
		//if (team == BasicGame.myTeam) {
			this.addPlayerName(i);
		//}
	}
	// Every time you add a player, sort the group so local client is always on top
	BasicGame.playerCG.sort('z', Phaser.Group.SORT_DESCENDING);
}

BasicGame.MainGame.prototype.addPlayerName = function(id) {
	// Factory function
	this.playerListHUD[id] = this.game.add.sprite(25, 15 + (this.playerCount * 35), 'playerName');
	var text = this.game.add.text(15, 15, this.playerList[id][1] + " - " + this.playerList[id][0].curHealth + " (" + this.playerList[id][0].heroLevel + ")", { font: '10pt myfont', align: 'left', fill: "white", align: 'left'});
	this.playerListHUD[id].addChild(text);
 	this.playerListHUD[id].fixedToCamera = true;
 	this.playerCount++;
};

BasicGame.MainGame.prototype.removePlayerName = function(id) {
	this.playerCount--;
	this.playerListHUD[id].destroy();
};

BasicGame.MainGame.prototype.updatePlayerList = function() {
	for (id in this.playerListHUD) {
		//console.log(this.playerListHUD[id].children.length);
		if(this.playerListHUD[id].children.length > 0) {
			this.playerListHUD[id].getChildAt(0).setText(this.playerList[id][1] + " - " + this.playerList[id][0].curHealth + " (" + this.playerList[id][0].heroLevel + ") ");
		}
	}
};

BasicGame.MainGame.prototype.broadcast = function(msg, duration) {
	var ref = this;
	console.log(msg, duration);
	var tween = this.game.add.tween(this).to({0: 0}, duration * 1000, Phaser.Easing.Linear.None, true, 0);
	tween.onStart.add(function() {
		ref.message.x = ref.game.width/2;
		ref.message.y = ref.game.height/4;
		ref.message.setText(msg);
		ref.message.fixedToCamera = true;
	});
	tween.onComplete.add(function(){
		ref.message.fixedToCamera = false;
		ref.message.position.x = ref.message.position.y = -50;
	});

};

BasicGame.MainGame.prototype.update = function() {
	// run AI scripts
	if (this.playerList["retard_Bot1"] != null) {
		this.scriptAIWalker(this.playerList["SoloKid"][0], this.playerList["retard_Bot1"][0]); // AI Script activated (Walker - Default)
	}
	if (this.playerList["retard_Bot2"] != null) {
		this.scriptAIDisruptor(this.playerList["SoloKid"][0], this.playerList["retard_Bot2"][0]); // AI Script activated (Disruptor - 2nd)
	}
	if (this.playerList["retard_Bot3"] != null) {
		this.scriptAIDestroyer(this.playerList["SoloKid"][0], this.playerList["retard_Bot3"][0]); // AI Script activated (Disruptor - 2nd)
	}
	if (this.playerList["retard_Bot4"] != null) {
		this.scriptAIAce(this.playerList["SoloKid"][0], this.playerList["retard_Bot4"][0]); // AI Script activated (Disruptor - 2nd)
	}
	this.AIScripthandler();

	// Enable collision between player and layer and shield
	this.physics.arcade.collide(BasicGame.playerCG, layer);
	this.physics.arcade.overlap(BasicGame.playerCG, BasicGame.shieldCG, this.shieldCallback.bind(this));
	// Team colliders
	this.physics.arcade.overlap(this.teamA, BasicGame.playerCG, this.baseCallback.bind(this));	
	this.physics.arcade.overlap(this.teamB, BasicGame.playerCG, this.baseCallback.bind(this));	

	this.handleHUD();
	this.updatePlayerList();
	//this.showPlayerList();
	//this.updatePlayerList();
	// this.game.debug.body(this.teamA);
	// this.game.debug.body(this.teamB);
	//this.chat();
	//this.game.debug.spriteInfo(this.magicCircle, 0, 100);
	//this.game.debug.body(this.magicCircle, 0, 200);

/* auto dc
	// single player win
	if (this.winState && this.game.time.now > this.winTime + 30000) {
		BasicGame.disconnectClient();
		this.game.state.start("MainMenu", true);
	}
*/
};

BasicGame.MainGame.prototype.AIScripthandler = function() {
	// run AI scripts
	for (var hero in this.playerList) {
		// check if hero is a bot
		if (hero.substring(0, 6) == "AI_Bot") {
			// Greedy Algo to find neraest enemy to take out
			var closestTgt = null;
			var closestDist = null;
			for (var target in this.playerList) {
				if (this.playerList[target][2] != this.playerList[hero][2]) { // find enemies only
					var distDiff = Math.abs(this.playerList[target][0].x - this.playerList[hero][0].x);
					// Target is an enemy
					if (closestTgt == null && !this.playerList[target][0].isDead) {
						// AI does not have a target, assign this as target
						closestTgt = this.playerList[target][0];
						closestDist = distDiff;
					} else if (distDiff < closestDist && !this.playerList[target][0].isDead) {
						// current target is closer than prev target
						closestTgt = this.playerList[target][0];
						closestDist = distDiff;
					} else if (this.playerList[hero][2] != this.playerList["SoloKid"][2]) {
						// prioritize player as target
						closestTgt = this.playerList["SoloKid"][0];
						closestDist = Math.abs(this.playerList["SoloKid"][0].x - this.playerList[hero][0].x);
					}
				}
			}

			var AIpropertySplit = hero.split("_");
			if (AIpropertySplit[2] == "trooper") {
				// run ace script
				this.scriptAIAce(closestTgt, this.playerList[hero][0]);
			} else if (AIpropertySplit[2] == "walker") {
				// run walker script
				this.scriptAIWalker(closestTgt, this.playerList[hero][0]);
			} else if (AIpropertySplit[2] == "destroyer") {
				// run destroyer script
				this.scriptAIDestroyer(closestTgt, this.playerList[hero][0]);
			} else if (AIpropertySplit[2] == "gunner") {
				// run disruptor script
				this.scriptAIDisruptor(closestTgt, this.playerList[hero][0]);
			}
		}
	}
};


BasicGame.MainGame.prototype.handleHUD = function() {
	// Level
	this.playerLevel.setText("[" + this.player.heroLevel + "]");

	// Health
	this.healthBarPercentage.setText(this.game.math.floorTo(this.player.getHP() * 100) + "%");
	this.healthRect.width = 269 * this.player.getHP();
	this.healthBar.crop(this.healthRect);

	// Exp
	this.expBarPercentage.setText(this.game.math.floorTo(this.player.getExp() * 100) + "%");
	this.expRect.width = 269 * this.player.getExp();
	this.expBar.crop(this.expRect);

	// Skills
	this.skillA.alpha = this.player.getSkillA() + 1;
	this.skillB.alpha = this.player.getSkillB() + 1;
	this.skillC.alpha = this.player.getSkillC() + 1;
	this.skillD.alpha = this.player.getSkillD() + 1;
	this.skillE.alpha = this.player.getSkillE() + 1;

	this.skillAHotkey.fill = this.skillA.alpha == 1 ? "white" : "grey";
	this.skillBHotkey.fill = this.skillB.alpha == 1 ? "white" : "grey";
	this.skillCHotkey.fill = this.skillC.alpha == 1 ? "white" : "grey";
	this.skillDHotkey.fill = this.skillD.alpha == 1 ? "white" : "grey";
	this.skillEHotkey.fill = this.skillE.alpha == 1 ? "white" : "grey";

	// Update every 500ms so won't be that taxing
	if (this.winState == false && this.game.time.now > this.textTimer) {
		this.textTimer = this.game.time.now + 500;
		this.teamAHUD.setText(this.teamScores[1]);
		this.teamBHUD.setText(this.teamScores[2]);
	}
};

BasicGame.MainGame.prototype.winGame = function() {
	// Apply forced disconnection to lobby to "freeze" game state
	this.winState = true;
	this.winTime = this.game.time.now;
	var winText = "You are defeated!"

	// Show win/lose message
	var winLoseMsg = game.add.text(this.game.width / 2, this.game.height / 4, winText, 
		{font: '64pt myfont', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", boundsAlignH: "center", boundsAlignV: "middle"}); 
	winLoseMsg.fixedToCamera = true;
	winLoseMsg.anchor.setTo(0.5, 0.5);
	winLoseMsg.alpha = 0.1;
	game.add.tween(winLoseMsg).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

	// Add return to menu button
	var returnMenu = game.add.text(this.game.width / 2, this.game.height / 4 + 235,  "Back to Main Menu", 
		{font: '25pt myfont', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white", boundsAlignH: "center", boundsAlignV: "middle"}); 
	returnMenu.inputEnabled = true;
	returnMenu.fixedToCamera = true;
	returnMenu.anchor.setTo(0.5, 0.5);
	returnMenu.events.onInputOver.add(BasicGame.onOver);
	returnMenu.events.onInputOut.add(BasicGame.onOut);

	// Back button clicked
	returnMenu.events.onInputUp.add(function() {
		returnMenu.destroy();
		BasicGame.disconnectClient();
		this.game.state.start("MainMenu", true);
	});
};

BasicGame.MainGame.prototype.chat = function() {
	if (this.enter.isDown && this.game.time.now > this.textTimer) {
		this.textTimer = this.game.time.now + 1000;
		
		var ref = this;
		var tween = this.game.add.tween(this).to({0: 0}, 2000, Phaser.Easing.Linear.None, true, 0);
		tween.onStart.add(function() {
			ref.playerText.x = ref.playerList[BasicGame.myID][0].x + 20;
			ref.playerText.y = ref.playerList[BasicGame.myID][0].y - 50;
			ref.playerText.setText(ref.chatBox.value);
			ref.chatBox.resetText();

			console.log(ref.playerText.x, ref.playerText.y, ref.playerText.text);
		});
		tween.onComplete.add(function(){
			ref.playerText.position.x = ref.playerText.position.y = -50;
		});
	}
}

BasicGame.MainGame.prototype.baseCallback= function(obj1, obj2) {
	if ((obj1 == this.teamA && obj2.myTeam == 1) || (obj1 == this.teamB && obj2.myTeam == 2)) {
		if (obj2.curHealth < obj2.maxHealth && !obj2.isDead) {
			obj2.curHealth++;
		}
	}
};

BasicGame.MainGame.prototype.shieldCallback= function(obj1, obj2) {
	// If not same team, push back
	if (obj1.myTeam != obj2.myTeam) {
		obj1.inShield = true;
		obj1.body.velocity.x = obj2.facingRight * 500;
	}
};

BasicGame.MainGame.prototype.shuffleArray= function(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
};