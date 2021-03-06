

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
        this.load.script('tutorial_scr', 'states/Tutorial.js');
        this.load.script('charselect_scr', 'states/CharSelect.js');
        this.load.script('options_scr', 'states/Options.js');
        this.load.script('lobbymulti_scr', 'states/LobbyMP.js');
        this.load.script('lobbyroom_scr', 'states/LobbyRoom.js');
        this.load.script('winTDM_scr', 'states/winTDM.js');
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
        //this.load.script('textinput_src', 'node_modules/phaser-input/build/phaser-input.js'); // like not needed (already loaded into index.html)

        // Grey filter
        this.load.script('gray', 'scripts/Gray.js');
    },

    loadImages: function() {  
        // Load background image
        this.load.image('menu_background', 'images/background.jpg');

        // Tilemap spritesheet json and png
        this.load.tilemap('map', 'images/map.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'images/sheet.png');
        this.load.image('background_tiles', 'images/building_sheet.png');
        this.load.image('tiles_spritesheet', 'images/tiles_spritesheet.png');

        this.load.tilemap('tutorial', 'images/tutorial.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('lab_tiles', 'images/lab_tilesheet.png');
        this.load.tilemap('single_player', 'images/single_player.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('fence', 'images/sprites/fence.png');

        this.load.tilemap('graveyard', 'images/graveyard.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('graveyard_tiles', 'images/graveyard_tilesheet.png');
        this.load.image('graveyard_background', 'images/graveyard_bg.png');

        // Player atlas
        this.load.atlas('player_destroyer', 'images/sprites/heroes/destroyer.png', 'images/sprites/heroes/destroyer.json');
        this.load.atlas('player_trooper', 'images/sprites/heroes/trooper.png', 'images/sprites/heroes/trooper.json');
        this.load.atlas('player_gunner', 'images/sprites/heroes/gunner.png', 'images/sprites/heroes/gunner.json');
        this.load.atlas('player_walker', 'images/sprites/heroes/walker.png', 'images/sprites/heroes/walker.json');
        
        // Destroyer assets
        this.load.image('walker_shield', 'images/sprites/heroes/walker_shield.png');
        this.load.image('walker_rocket', 'images/sprites/effects/rocket.png');
        this.load.image('laser_blue', 'images/sprites/effects/laser_blue.png');
        this.load.image('laser_red', 'images/sprites/effects/laser_red.png');
        this.load.image('laser_green', 'images/sprites/effects/laser_green.png');
        this.load.image('grenade', 'images/sprites/effects/grenade.png');
        this.load.image('healthkit', 'images/sprites/effects/health_kit.png');
        this.load.image('slimeball', 'images/sprites/effects/slimeball.png');

        // HUD
        this.load.image('player_hud', 'images/player_hud.png');
        this.load.image('player_hud_bar', 'images/player_hud_bar.png');
        this.load.image('score', 'images/score.png');
        this.load.image('playerName', 'images/playerName.png');
        this.load.image('magicCircle', 'images/magiccircle.png');
        this.load.image('exit_button', 'images/exit_button.png');
        
        // Player skills
        this.load.image('destroyer_hud_skillA', 'images/sprites/heroes/skills/destroyer_skillA.png');
        this.load.image('destroyer_hud_skillB', 'images/sprites/heroes/skills/destroyer_skillB.png');
        this.load.image('destroyer_hud_skillC', 'images/sprites/heroes/skills/destroyer_skillC.png');
        this.load.image('destroyer_hud_skillD', 'images/sprites/heroes/skills/destroyer_skillD.png');
        this.load.image('destroyer_hud_skillE', 'images/sprites/heroes/skills/destroyer_skillE.png');

        this.load.image('walker_hud_skillA', 'images/sprites/heroes/skills/walker_skillA.png');
        this.load.image('walker_hud_skillB', 'images/sprites/heroes/skills/walker_skillB.png');
        this.load.image('walker_hud_skillC', 'images/sprites/heroes/skills/walker_skillC.png');
        this.load.image('walker_hud_skillD', 'images/sprites/heroes/skills/walker_skillD.png');
        this.load.image('walker_hud_skillE', 'images/sprites/heroes/skills/walker_skillE.png');

        this.load.image('gunner_hud_skillA', 'images/sprites/heroes/skills/gunner_skillA.png');
        this.load.image('gunner_hud_skillB', 'images/sprites/heroes/skills/gunner_skillB.png');
        this.load.image('gunner_hud_skillC', 'images/sprites/heroes/skills/gunner_skillC.png');
        this.load.image('gunner_hud_skillD', 'images/sprites/heroes/skills/gunner_skillD.png');
        this.load.image('gunner_hud_skillE', 'images/sprites/heroes/skills/gunner_skillE.png');

        this.load.image('trooper_hud_skillA', 'images/sprites/heroes/skills/trooper_skillA.png');
        this.load.image('trooper_hud_skillB', 'images/sprites/heroes/skills/trooper_skillB.png');
        this.load.image('trooper_hud_skillC', 'images/sprites/heroes/skills/trooper_skillC.png');
        this.load.image('trooper_hud_skillD', 'images/sprites/heroes/skills/trooper_skillD.png');
        this.load.image('trooper_hud_skillE', 'images/sprites/heroes/skills/trooper_skillE.png');


        // Effect atlas
        this.load.atlas('beam_effect_sprite', 'images/sprites/effects/beam.png', 'images/sprites/effects/beam.json');
        this.load.atlas('blast_effect_sprite', 'images/sprites/effects/blast.png', 'images/sprites/effects/blast.json');
        this.load.atlas('blood_effect_sprite', 'images/sprites/effects/blood.png', 'images/sprites/effects/blood.json');
        this.load.atlas('bolt_effect_sprite', 'images/sprites/effects/bolt.png', 'images/sprites/effects/bolt.json');
        this.load.atlas('energy_effect_sprite', 'images/sprites/effects/energy.png', 'images/sprites/effects/energy.json');
        this.load.atlas('explosion_effect_sprite', 'images/sprites/effects/explosion.png', 'images/sprites/effects/explosion.json');
        this.load.atlas('fire_effect_sprite', 'images/sprites/effects/fire.png', 'images/sprites/effects/fire.json');
        this.load.atlas('ice_effect_sprite', 'images/sprites/effects/ice.png', 'images/sprites/effects/ice.json');
        this.load.atlas('mite_sprite', 'images/sprites/effects/mite.png', 'images/sprites/effects/mite.json');
        this.load.atlas('muzzle_effect_sprite', 'images/sprites/effects/muzzle.png', 'images/sprites/effects/muzzle.json');
        this.load.atlas('muzzle2_effect_sprite', 'images/sprites/effects/muzzle_1.png', 'images/sprites/effects/muzzle_1.json');
        this.load.atlas('slash_effect_sprite', 'images/sprites/effects/slash.png', 'images/sprites/effects/slash.json');
        this.load.atlas('slime_effect_sprite', 'images/sprites/effects/slime.png', 'images/sprites/effects/slime.json');
        this.load.atlas('slime_sprite', 'images/sprites/effects/slime_idle.png', 'images/sprites/effects/slime_idle.json');
        this.load.atlas('smoke_effect_sprite', 'images/sprites/effects/smoke.png', 'images/sprites/effects/smoke.json');
        this.load.atlas('summon_effect_sprite', 'images/sprites/effects/summon.png', 'images/sprites/effects/summon.json');

        // Character portraits
        this.load.image('destroyer_portrait', 'images/sprites/destroyer_portrait.png');
        this.load.image('gunner_portrait', 'images/sprites/gunner_portrait.png');
        this.load.image('walker_portrait', 'images/sprites/walker_portrait.png');
        this.load.image('trooper_portrait', 'images/sprites/trooper_portrait.png');

        // Char select
        this.load.atlas('stats', 'images/sprites/stats.png', 'images/sprites/stats.json');
        this.load.atlas('skills', 'images/sprites/skills.png', 'images/sprites/skills.json');
        this.load.image('hero_name', 'images/sprites/hero_name.png');
        this.load.image('hero_story', 'images/sprites/hero_story.png');
        this.load.image('team_panel', 'images/sprites/team.png');
        this.load.image('lobby_panel', 'images/sprites/lobby_panel.png');
        this.load.image('lobby_big_panel', 'images/sprites/lobby_big_panel.png');
        this.load.image('lobby_team_panel', 'images/sprites/lobby_team.png');

        // Mobile controls
        this.load.image('arrowLeft', 'images/sprites/arrowLeft.png');
        this.load.image('arrowRight', 'images/sprites/arrowRight.png');
        this.load.image('arrowUp', 'images/sprites/arrowUp.png');
    },

    loadAudio: function() {
        // Loading music
        this.load.audio('titleMusic', ['audio/title.mp3']);
        this.load.audio('buttonOver', ['audio/buttonOver.ogg']);
        this.load.audio('buttonClick', ['audio/buttonClick.ogg']);

        // Hero SFX
        this.load.audio('level_up', 'audio/heroes/levelup.ogg');

        this.load.audio('destroyer_skillA', 'audio/heroes/destroyer/default.ogg');
        this.load.audio('destroyer_skillB', 'audio/heroes/destroyer/thrust.ogg');
        this.load.audio('destroyer_skillC', 'audio/heroes/destroyer/shotgun.ogg');
        this.load.audio('destroyer_skillD', 'audio/heroes/destroyer/grenade_throw.ogg');
        this.load.audio('destroyer_skillD_1', 'audio/heroes/destroyer/grenade_explode.ogg');
        this.load.audio('destroyer_skillE', 'audio/heroes/destroyer/ultimate.ogg');

        this.load.audio('gunner_skillA', 'audio/heroes/gunner/default.ogg');
        this.load.audio('gunner_skillB', 'audio/heroes/gunner/mite.ogg');
        this.load.audio('gunner_skillC', 'audio/heroes/gunner/trap.ogg');
        this.load.audio('gunner_skillD', 'audio/heroes/gunner/health.ogg');
        this.load.audio('gunner_skillE', 'audio/heroes/gunner/ultimate.ogg');

        this.load.audio('trooper_skillA', 'audio/heroes/trooper/default.ogg');
        this.load.audio('trooper_skillB', 'audio/heroes/trooper/haste.ogg');
        this.load.audio('trooper_skillC', 'audio/heroes/trooper/invis.ogg');
        this.load.audio('trooper_skillD', 'audio/heroes/trooper/backtrack.ogg');
        this.load.audio('trooper_skillE', 'audio/heroes/trooper/snipe.ogg');

        this.load.audio('walker_skillA', 'audio/heroes/walker/default.ogg');
        this.load.audio('walker_skillB', 'audio/heroes/walker/shield.ogg');
        this.load.audio('walker_skillC', 'audio/heroes/walker/rocket.ogg');
        this.load.audio('walker_skillD', 'audio/heroes/walker/knockback.ogg');
        this.load.audio('walker_skillE', 'audio/heroes/walker/rocket.ogg');
        this.load.audio('walker_explosion', 'audio/heroes/walker/explosion.ogg');
    },

    loadPlugins: function() {
        this.inputField = this.game.plugins.add(Fabrique.Plugins.InputField);
        //this.nineSlice = this.game.plugins.add(Fabrique.Plugins.NineSlice);
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
        this.loadPlugins();
    },

    addGameStates: function() {
        // Add game states
        this.state.add('MainMenu', BasicGame.MainMenu);
        this.state.add('CharSelect', BasicGame.CharSelect);
        this.state.add('MainGame', BasicGame.MainGame);
        this.state.add('LobbyMulti', BasicGame.LobbyMulti);
        this.state.add('LobbyRoom', BasicGame.LobbyRoom);
        this.state.add('winTDM', BasicGame.winTDM);
        this.state.add('Multiplayer', BasicGame.Multiplayer);
        this.state.add('Options', BasicGame.Options);
        this.state.add('Credits', BasicGame.Credits);
        this.state.add('Tutorial', BasicGame.Tutorial);
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
