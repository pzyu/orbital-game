BasicGame.CharSelect = function (game) {
	this.ninja = null;
	this.robot = null;
	this.jack = null;
	this.knight = null;
};

BasicGame.CharSelect.prototype = {
	preload: function() {
		// Add sprites
		this.ninja = this.add.sprite(0, 0, 'char_select_0');
		this.robot = this.add.sprite(260, 0, 'char_select_1');
		this.jack = this.add.sprite(520, 0, 'char_select_2');
		this.knight = this.add.sprite(760, 0, 'char_select_3');

		this.ninja.scale.setTo(4.2);
		this.robot.scale.setTo(4.2);
		this.jack.scale.setTo(4.2);
		this.knight.scale.setTo(4.2);

		// Initial filters
		var gray = game.add.filter('Gray');

		this.ninja.filters = [gray];
		this.robot.filters = [gray];
		this.jack.filters = [gray];
		this.knight.filters = [gray];

		// On over style
		var onOver = function (target) {
			target.filters = null;
		};

		// On out style
		var onOut = function (target) {
			target.filters = [gray];
		};

		var onClick = function (target) {
			console.log(target.name + " clicked");
		};

		// Add event checkers for each sprite
		this.ninja.inputEnabled = true;
		this.ninja.events.onInputUp.add(onClick);
		this.ninja.events.onInputOver.add(onOver);
		this.ninja.events.onInputOut.add(onOut);

		this.robot.inputEnabled = true;
		this.robot.events.onInputUp.add(onClick);
		this.robot.events.onInputOver.add(onOver);
		this.robot.events.onInputOut.add(onOut);
				
		this.jack.inputEnabled = true;
		this.jack.events.onInputUp.add(onClick);
		this.jack.events.onInputOver.add(onOver);
		this.jack.events.onInputOut.add(onOut);

		this.knight.inputEnabled = true;
		this.knight.events.onInputUp.add(onClick);
		this.knight.events.onInputOver.add(onOver);
		this.knight.events.onInputOut.add(onOut);

		var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};
		var txt = this.add.text(this.world.width - this.world.width/4, this.world.height - 100,  "Start Game", optionStyle);
		txt.inputEnabled = true;
		txt.events.onInputUp.add(function() {
			this.game.state.start("MainGame");
		});

	},

	create: function() {

	},

	update: function() {
	}
};