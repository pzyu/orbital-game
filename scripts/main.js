// So called "parent" of all the states
var BasicGame = {
  gameWidth: 1024,
  gameHeight: 768,
  projectileCG: null,
  colliderCG: null,
  playerCG: null,
  selectedChar: null,
  musicPlayer: null
};     

// Global Variables
var game = new Phaser.Game(BasicGame.gameWidth, BasicGame.gameHeight, Phaser.AUTO, 'game');

BasicGame.Main = function() {
};

BasicGame.Main.prototype = {
  // Load whatever we need for Boot first
  preload: function () {
    this.load.image('splashLogo', 'images/splash_logo.png');
    this.load.script('boot_scr',  'states/Boot.js');
  },

  create: function () {
    // Add only boot at this state, and start
    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');
  }
};

game.state.add('Main', BasicGame.Main);
game.state.start('Main');