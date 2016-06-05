// Global Variables
var
  game = new Phaser.Game(1024, 768, Phaser.AUTO, 'game'),
  gameOptions = {
    playSound: true,
    playMusic: true
  },
  musicPlayer;


var BasicGame = {
  score: 0,
  projectileCG: null,
  colliderCG: null,
  playerCG: null,
  selectCG: null,
  selectedChar: null,
  charSelect_1: null,
  charSelect_2: null,
  charSelect_3: null,
  charSelect_4: null,
};     // So called "parent" of all the states

BasicGame.Main = function() {

};

BasicGame.Main.prototype = {
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