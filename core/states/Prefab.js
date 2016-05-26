BasicGame.Prefab = function (game_state, position, properties) {
    "use strict";
    Phaser.Sprite.call(this, game_state.game, position.x, position.y, properties.texture);
    
    this.game_state = game_state;
    
    this.game_state.groups[properties.group].add(this);
};
 
BasicGame.Prefab.prototype = Object.create(Phaser.Sprite.prototype);
BasicGame.Prefab.prototype.constructor = BasicGame.Prefab;