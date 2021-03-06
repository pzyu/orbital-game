// So called "parent" of all the states
var BasicGame = {
  gameWidth: 1280,
  gameHeight: 720,
  projectileCG: null,
  colliderCG: null,
  shieldCG: null,
  miteCG: null,
  playerCG: null,
  selectedChar: null,
  musicPlayer: null,
  buttonOver: null,
  buttonClick: null,
  eurecaServer: null,
  eurecaClient: null,
  myID: null,
  roomID: null,
  myNick: null,
  myTeam: null,

  // On over style
  onOver: function (target) {
    target.fill = "#CCE8FF";
    target.stroke = "rgba(0,0,0,255)";
    target.scale.setTo(1.01);
    BasicGame.buttonOver.play();
  },

  // On out style
  onOut: function (target) {
    target.fill = "white";
    target.stroke = "rgba(0,0,0,255)";
    target.scale.setTo(1.0);
  },

  onDown: function(target) {
    BasicGame.buttonClick.play();
  },

  disconnectClient: function () {
    BasicGame.eurecaServer = null;
    BasicGame.eurecaClient = null;
    BasicGame.myID = null;
    BasicGame.roomID = null;
    BasicGame.myNick = null;
    BasicGame.myTeam = null;
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
    // Add only boot at this state, and start
    game.state.add('Boot', BasicGame.Boot);
    game.state.start('Boot');
  }
};
game.state.add('Main', BasicGame.Main);
game.state.start('Main');