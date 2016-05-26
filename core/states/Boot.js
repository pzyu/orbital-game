

// For every state, you just call BasicGame.StateName
BasicGame.Boot = function (game) {
    this.splashLogo = null;
    this.ready = false;
    this.status = "";
    this.loadingText = "PLS WAIT . . .";
};

BasicGame.Boot.prototype = {
    loadScripts: function() {
        // Load whatever scripts we need
        this.load.script('mainmenu_scr', 'states/MainMenu.js');
        this.load.script('charselect_scr', 'states/CharSelect.js');
        this.load.script('game_scr', 'states/MainGame.js');
        this.load.script('hero_scr', 'states/Hero.js');

        // For webfonts
        this.load.script('WebFont', 'scripts/webfontloader.js');
        // For greying
        this.load.script('gray', '../filters/Gray.js');
    },

    loadImages: function() {  
        // For char select
        this.load.image('char_select_0', 'images/char_select_0.png');
        this.load.image('char_select_1', 'images/char_select_1.png');
        this.load.image('char_select_2', 'images/char_select_2.png');
        this.load.image('char_select_3', 'images/char_select_3.png');

        // Tilemap spritesheet json and png
        this.load.tilemap('map', 'images/tiles_spritesheet.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'images/sheet.png');

        // Player atlas
        this.load.atlas('player_sprite', 'images/sprites/jack/jack.png', 'images/sprites/jack/jack.json');
    },

    loadAudio: function() {
        // Loading music
        this.load.audio('titleMusic', ['audio/title.mp3']);
    },

    loadFonts: function(){
        // Loading fonts
        WebFontConfig = {
            custom: {
                families: ['myfont'],
                urls: ['fonts/font.css']
            }
        }
    },

    // Init function to for game settings
    init: function () {
        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = true;

        if (this.game.device.desktop)
        {
            //  If you have any desktop specific settings, they can go in here
            this.scale.pageAlignHorizontally = true;
        }
        else
        {
            //  Same goes for mobile settings.
            //  In this case we're saying "scale the game, no lower than 480x260 and no higher than 1024x768"
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.scale.setMinMax(480, 260, 1024, 768);
            this.scale.forceLandscape = true;
            this.scale.pageAlignHorizontally = true;
        }

        // Set splash logo
        this.splashLogo = this.add.sprite(this.world.width/2, this.world.height/2, 'splashLogo');
        this.splashLogo.anchor.setTo(0.5, 0.5);

        // Set loading text
        this.status = this.add.text(this.world.width/2, this.world.height/2 + this.splashLogo.height/2, '', {font: "50px myfont", fill: 'white'});
        this.status.anchor.setTo(0.5, 0.5);

        // On load complete execute onLoadComplete() function
        this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    },

    // Preload function to preload whatever assets needed only for preload page
    preload: function () {
        this.loadScripts();
        this.loadFonts();
        this.loadImages();
        this.loadAudio();
    },

    addGameStates: function() {
        // Add game states
        this.state.add('MainMenu', BasicGame.MainMenu);
        this.state.add('CharSelect', BasicGame.CharSelect);
        this.state.add('MainGame', BasicGame.MainGame);
    },

    // Create function to start the actual preloader
    create: function () {
        this.addGameStates();

        // Set text here
        this.status.setText(this.loadingText);
    },

    update: function () {
        this.splashLogo.rotation += 0.01;

        // Uncomment this instead of the next to decode the music first
        //if (this.cache.isSoundDecoded('titleMusic') && this.ready)
        if (this.ready)
        {
            this.state.start('MainMenu');
        }

    },

    onLoadComplete: function() {
        // Callback to this when loading is done
        this.ready = true;
        console.log("load complete");
    }

};
