

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
        this.load.script('game_scr', 'states/MainGame.js');
        this.load.script('charselect_scr', 'states/CharSelect.js');
        this.load.script('options_scr', 'states/Options.js');
        this.load.script('lobbymulti_scr', 'states/LobbyMP.js');
        this.load.script('lobbyroom_scr', 'states/LobbyRoom.js');
        this.load.script('credits_scr', 'states/Credits.js');
        this.load.script('effect_scr', 'states/Effect.js');
        this.load.script('proj_scr', 'states/Projectile.js');
        this.load.script('multiplayer_scr', 'states/Multiplayer.js');
        this.load.script('collider_scr', 'states/Collider.js');
        
        // For single player mode, but probably will change
        this.load.script('herobase_scr', 'states/HeroBase.js');
        // this.load.script('herodes_scr', 'states/HeroDestroyer.js');
        // this.load.script('herotrooper_scr', 'states/HeroTrooper.js');
        // this.load.script('herogunner_scr', 'states/HeroGunner.js');
        // this.load.script('herowalker_scr', 'states/HeroWalker.js');

        // Multiplayer
        this.load.script('herodesmp_scr', 'states/HeroDestroyerMP.js');
        this.load.script('herotroopermp_scr', 'states/HeroTrooperMP.js');
        this.load.script('herogunnermp_scr', 'states/HeroGunnerMP.js');
        this.load.script('herowalkermp_scr', 'states/HeroWalkerMP.js');

        // For webfonts
        this.load.script('WebFont', 'scripts/webfontloader.js');
        // Text input
        //this.load.script('textinput_src', 'node_modules/phaser-input/build/phaser-input.js');

        // Grey filter
        this.load.script('gray', 'scripts/Gray.js');
    },

    loadImages: function() {  
        // Load background image
        this.load.image('menu_background', 'images/menu_background.gif');

        // Tilemap spritesheet json and png
        this.load.tilemap('map', 'images/tiles_spritesheet.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'images/sheet.png');
        this.load.image('background_tiles', 'images/building_sheet.png');
        this.load.image('tiles_spritesheet', 'images/tiles_spritesheet.png');

        // Player atlas
        this.load.atlas('player_destroyer', 'images/sprites/heroes/destroyer.png', 'images/sprites/heroes/destroyer.json');
        this.load.atlas('player_trooper', 'images/sprites/heroes/trooper.png', 'images/sprites/heroes/trooper.json');
        this.load.atlas('player_gunner', 'images/sprites/heroes/gunner.png', 'images/sprites/heroes/gunner.json');
        this.load.atlas('player_walker', 'images/sprites/heroes/walker.png', 'images/sprites/heroes/walker.json');
        
        // Destroyer assets
        this.load.image('walker_shield', 'images/sprites/heroes/walker_shield.png');
        this.load.image('walker_rocket', 'images/sprites/effects/rocket.png');

        // HUD
        this.load.image('skill', 'images/sprites/heroes/skill.png');
        this.load.image('hpEmpty', 'images/sprites/heroes/hpEmpty.png');
        this.load.image('hpFull', 'images/sprites/heroes/hpFull.png');

        // Effect atlas
        this.load.atlas('blood_effect_sprite', 'images/sprites/effects/blood_spritesheet.png', 'images/sprites/effects/blood_spritemap.json');
        this.load.atlas('bolt_effect_sprite', 'images/sprites/effects/bolt_spritesheet.png', 'images/sprites/effects/bolt_spritemap.json');
        this.load.atlas('muzzle_effect_sprite', 'images/sprites/effects/muzzle.png', 'images/sprites/effects/muzzle.json');
        this.load.atlas('explosion_effect_sprite', 'images/sprites/effects/explosion.png', 'images/sprites/effects/explosion.json');
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

        // Set splash logo to middle of screen
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
        this.state.add('LobbyMulti', BasicGame.LobbyMulti);
        this.state.add('LobbyRoom', BasicGame.LobbyRoom);
        this.state.add('Multiplayer', BasicGame.Multiplayer);
        this.state.add('Options', BasicGame.Options);
        this.state.add('Credits', BasicGame.Credits);
    },

    // Create function to start the actual preloader
    create: function () {
        this.addGameStates();

        // Set text here
        this.status.setText(this.loadingText);
    },

    update: function () {
        // Rotate splash logo
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
