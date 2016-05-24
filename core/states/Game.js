
BasicGame.Game = function (game) {
    console.log("asdasd");
};

BasicGame.Game.prototype = {

    preload: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        //this.map = this.game.add.tilemap('level1');
        //this.map.addTilesetImage('tiles', 'gameTiles');
        console.log("adasd");
    },

    update: function () {

        //  Honestly, just about anything could go here. It's YOUR game after all. Eat your heart out!
        console.log('asdasd');

    },

    quitGame: function (pointer) {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    }

};
