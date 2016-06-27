// For every state, you just call BasicGame.StateName
BasicGame.Options = function (game) {
	// Game title, just edit from here
	this.gameTitle = "Zero+";
};

var optionStyle = { font: '25pt myfont', align: 'left', stroke: 'rgba(0,0,0,0)', strokeThickness: 2, fill: "white"};

BasicGame.Options.prototype = {
	init: function() {
	},

	preload: function() {
		// Use same background as main menu
		this.background = this.add.sprite(0, 0, 'menu_background');
		this.background.height = this.game.height;
		this.background.width = this.game.width;

		// Use same tittle as main menu
		this.title = this.add.text(50, this.world.height/6, this.gameTitle, {font: "60pt myfont", fill: 'white', align: 'right'});
		this.title.setShadow(3, 3, 'rgba(0,0,0,0.5)', 5);
		this.title.anchor.set(0, 0.5);
	},

	create:  function() {
		var ref = this;
		// Fixed Text
		//this.add.text(100, 300, "Change Control"  + (BasicGame.musicPlayer.volume * 100), optionStyle);

		// Button to go back to main menu
		this.addMenuOption(this.world.width - this.world.width/2.5, this.world.height/2  + 300,  "Back to main menu", function (target) {
			ref.game.state.start("MainMenu", true);
		});

		// Button to increase/decrease volume
		var volTxt = this.add.text(100, 300, "Volume : "  + (BasicGame.musicPlayer.volume * 100), optionStyle);
		var volMinus = this.addMenuOption(700, 300,  "-", function (target) {
			if (BasicGame.musicPlayer.volume > 0) {
				BasicGame.musicPlayer.volume = BasicGame.musicPlayer.volume - 0.25;
				volTxt.setText("Volume : "  + (BasicGame.musicPlayer.volume * 100));
			}
		});
		var volAdd = this.addMenuOption(780, 300,  "+", function (target) {
			if (BasicGame.musicPlayer.volume < 1.0) {
				BasicGame.musicPlayer.volume = BasicGame.musicPlayer.volume + 0.25;
				volTxt.setText("Volume : "  + (BasicGame.musicPlayer.volume * 100));
			}
		});

		// Button to mute volume
		var muteTxt1 = this.add.text(100, 350, "Music : " + (BasicGame.musicPlayer.mute ? "Muted" : "Playing"), optionStyle);
		var muteTxt2 = this.addMenuOption(700, 350,  BasicGame.musicPlayer.mute ? "Unmute" : "Mute", function (target) {
			BasicGame.musicPlayer.mute = !BasicGame.musicPlayer.mute;
			if (BasicGame.musicPlayer.mute) {
				muteTxt1.setText("Music : Muted");
				muteTxt2.setText("Unmute");
			} else {
				muteTxt1.setText("Music : Playing");
				muteTxt2.setText("Mute");
			}
		});
	},

	// Factory function that lets you add options easily
	addMenuOption: function(xPosition, yPosition, text, callback) {
		// Set default text
		var txt = this.add.text(xPosition, yPosition, text, optionStyle);

		// On over style
		var onOver = function (target) {
			target.fill = "#CCE8FF";
			target.stroke = "rgba(255,255,255,1)";
		};

		// On out style
		var onOut = function (target) {
			target.fill = "white";
			target.stroke = "rgba(0,0,0,0)";
		};

		// Default style
		txt.stroke = "rgba(0,0,0,0)";
		txt.strokeThickness = 4;
		txt.inputEnabled = true;
		txt.events.onInputUp.add(callback);
		txt.events.onInputOver.add(onOver);
		txt.events.onInputOut.add(onOut);
		return txt;
	},

	update: function() {
	}
};