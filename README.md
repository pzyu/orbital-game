# zero+
![](/images/github_title.gif)
zero+ is a HTML5 browser based online multiplayer arena game built on Phaser. Players can choose up to 4 heroes with different attributes and skills to pit against others in the arena. 

Current features:
- Game states 
- Character select screen
- Spritesheet and spritemap support
- Tilemap support
- Hero movement and skills
- Hit box and collision detection
- HUD with skill cooldowns and health
- Multiplayer on a persistent server
 
Planned features:
- Hosting and joining of game sessions
- Game modes: 
    - Deathmatch
    - Team deathmatch
    - Survival
- Mobile port

Todos:
- Complete hero skills and attributes
- Change character select screen
- Complete Options and Credits screen
- Add music and sound effects
- Add single player mode
- Tweak multiplayer 

### Installation
zero+ uses the following to work properly:

* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework
* [engine.io] - implementation of transport-based cross-browser/cross-device bi-directional communication layer for socket.io
* [eureca.io] - a node.js bidirectional RPC library using Primus.io as a network layer.

Install [node.js] and the following:
```sh
$ npm install express
$ npm install engine.io
$ npm install eureca.io
````
To run the game, navigate to /core, run "node server.js" in your terminal and open up "localhost:8000" in your browser.

### Tools used
- [Tiled]
    - For generating tilemap json files
    - Tile layer format must be set to "CSV"
    - Tile size should be the same when creating a new map and when importing new tilesets
    - Important to keep track of the name of the layers as they are referenced when creating a layer in Phaser, can check with json file to make sure.
- [Leshy SpriteSheet Tool]
    - For generating spritesheets and spritemaps
    - Json file type must be set to "JSON-TP-Array"
    - Naming convention should be standardized as Phaser can generate frome names automatically by providing the correct suffix such as "Anim_Run" and a range of numbers. For example, for example ('Anim_Run', 0, 9) will produce an array ['Anim_Run0', 'Anim_Run1', ... ... ,'Anim_Run9'] so adding it to the animations is a lot simpler.


[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [node.js]: <http://nodejs.org>
   [express]: <http://expressjs.com>
   [engine.io]: <https://github.com/socketio/engine.io>
   [eureca.io]: <http://eureca.io>
   [Tiled]: <http://www.mapeditor.org/>
   [Leshy SpriteSheet Tool]: <https://www.leshylabs.com/apps/sstool/>

