// So called "parent" of all the states
var BasicGame = {
  gameWidth: 1280,
  gameHeight: 720,
  projectileCG: null,
  colliderCG: null,
  playerCG: null,
  selectedChar: null,
  musicPlayer: null
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
    // Add only boot at this state, and start
    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');
  }
};

game.state.add('Main', BasicGame.Main);
game.state.start('Main');