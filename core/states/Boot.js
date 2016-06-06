

// For every state, you just call BasicGame.StateName
BasicGame.Boot = function (game) {
    this.splashLogo = null;
    this.ready = false;
    this.status = "PLS WAIT . . .";
    this.loadingText = "PLS WAIT . . .";
};

BasicGame.Boot.prototype = {
    loadScripts: function() {
        // Load whatever scripts we need
        this.load.script('mainmenu_scr', 'states/MainMenu.js');
        this.load.script('game_scr', 'states/MainGame.js');
        this.load.script('hero_scr', 'states/Hero.js');
        
        this.load.script('herodes_scr', 'states/HeroDestroyer.js');
        this.load.script('herotrooper_scr', 'states/HeroTrooper.js');
        this.load.script('herogunner_scr', 'states/HeroGunner.js');

        this.load.script('charselect_scr', 'states/CharSelect.js');
        this.load.script('effect_scr', 'states/Effect.js');
        this.load.script('proj_scr', 'states/Projectile.js');
        this.load.script('multiplayer_scr', 'states/Multiplayer.js');
        this.load.script('collider_scr', 'states/Collider.js');

        // For webfonts
        this.load.script('WebFont', 'scripts/webfontloader.js');
        // For greying
        this.load.script('gray', 'scripts/Gray.js');
    },

    loadImages: function() {  
        // Load background image
        this.load.image('menu_background', 'images/menu_background.gif');

        // For char select
        this.load.image('char_select_0', 'images/char_select_0.png');
        this.load.image('char_select_1', 'images/char_select_1.png');
        this.load.image('char_select_2', 'images/char_select_2.png');
        this.load.image('char_select_3', 'images/char_select_3.png');

        // Tilemap spritesheet json and png
        this.load.tilemap('map', 'images/tiles_spritesheet.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'images/sheet.png');
        this.load.image('background_tiles', 'images/building_sheet.png');
        this.load.image('tiles_spritesheet', 'images/tiles_spritesheet.png');

        // Player atlas
        this.load.atlas('player_ninja', 'images/sprites/ninja/ninja.png', 'images/sprites/ninja/ninja.json');
        this.load.atlas('player_robot', 'images/sprites/robot/robot.png', 'images/sprites/robot/robot.json');
        this.load.atlas('player_jack', 'images/sprites/jack/jack.png', 'images/sprites/jack/jack.json');
        this.load.atlas('player_knight', 'images/sprites/knight/knight.png', 'images/sprites/knight/knight.json');
        this.load.atlas('player_cowgirl', 'images/sprites/cowgirl/cowgirl.png', 'images/sprites/cowgirl/cowgirl.json');

        this.load.atlas('player_destroyer', 'images/sprites/destroyer.png', 'images/sprites/destroyer.json');
        this.load.atlas('player_trooper', 'images/sprites/trooper.png', 'images/sprites/trooper.json');
        this.load.atlas('player_gunner', 'images/sprites/gunner.png', 'images/sprites/gunner.json');


        // Effect atlas
        this.load.atlas('blood_effect_sprite', 'images/sprites/effects/blood_spritesheet.png', 'images/sprites/effects/blood_spritemap.json');
        this.load.atlas('bolt_effect_sprite', 'images/sprites/effects/bolt_spritesheet.png', 'images/sprites/effects/bolt_spritemap.json');
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

    loadCharSelect: function() {
        BasicGame.charSelect_1 = new Phaser.Sprite(this.game, -100, -100, 'player_ninja', 0);
        BasicGame.charSelect_2 = new Phaser.Sprite(this.game, -100, -100, 'player_cowgirl', 0);
        BasicGame.charSelect_3 = new Phaser.Sprite(this.game, -100, -100, 'player_knight', 0);
        BasicGame.charSelect_4 = new Phaser.Sprite(this.game, -100, -100, 'player_robot', 0);

        BasicGame.charSelect_1.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
        BasicGame.charSelect_1.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
        BasicGame.charSelect_2.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
        BasicGame.charSelect_2.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
        BasicGame.charSelect_3.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
        BasicGame.charSelect_3.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
        BasicGame.charSelect_4.animations.add('anim_idle', Phaser.Animation.generateFrameNames('Idle ', 1, 10), 16, true);
        BasicGame.charSelect_4.animations.add('anim_attack', Phaser.Animation.generateFrameNames('Attack ', 1, 10), 16, true);
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
        this.state.add('Multiplayer', BasicGame.Multiplayer);
    },

    // Create function to start the actual preloader
    create: function () {
        this.addGameStates();
        //this.loadCharSelect();

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
