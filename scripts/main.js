// So called "parent" of all the states
var BasicGame = {
  gameWidth: 1280,
  gameHeight: 720,
  projectileCG: null,
  colliderCG: null,
  shieldCG: null,
  playerCG: null,
  selectedChar: null,
  musicPlayer: null,
  // On over style
  onOver: function (target) {
    target.fill = "#CCE8FF";
    target.stroke = "rgba(255,255,255,1)";
  },

  // On out style
  onOut: function (target) {
    target.fill = "white";
    target.stroke = "rgba(0,0,0,0)";
  }

};     

var config = {  width: BasicGame.gameWidth,  height: BasicGame.gameHeight,  renderer: Phaser.AUTO, forceSetTimeOut: false};

// Global Variables
var game = new Phaser.Game(config);

BasicGame.Main = function() {
};

BasicGame.Main.prototype = {
  // Load whatever we need for Boot first
  preload: function () {
    this.load.image('splashLogo', 'images/splash_logo.png');
    this.load.script('boot_scr',  'states/Boot.js');
  },

  create: function () {
    // activate inputbox plugin
    game.add.plugin(Fabrique.Plugins.InputField); // for full API, go to : https://github.com/orange-games/phaser-input
    // Add only boot at this state, and start
    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');
  }
};

game.state.add('Main', BasicGame.Main);
game.state.start('Main');