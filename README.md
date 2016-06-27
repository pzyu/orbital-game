# zero+
![](/images/github_title.gif)
zero+ is a HTML5 browser based online multiplayer arena game built on Phaser. Players can choose up to 4 heroes with different attributes and skills to pit against others in the arena. 

Current features:
- Basic game states: Boot, Main menu, Options, Credits, Character select, Multiplayer
- Tilemap and spritesheets support, anyone can create their own maps and characters by using the tools noted in our documentation
- Four fully animated heroes, each with unique animations to suit their characters
- Basic hero mechanics such as movement, health, skills, cool downs, damage, respawn system
- Hero HUD showing health and skill cool downs
- Simple free for all where everyone's objective is just to kill everyone else
- Bare minimum tutorial where players are shown the controls in the character select screen
- Online multiplayer hosted on Azure, currently serves as a persistent server where players can join in whenever they want.
- Server broadcast messages where every player will be notified when someone has joined or left the game, or if they have died.
- Dummy leaderboard that shows the list of players and their current health
 
Planned features:
- Skills and balance for all heroes
- Team deathmatch game mode (MVP)
- Team mechanics
- Game mechanics
- Hero and skill levels
- Lobby hosting and joining game sessions
- Allowing users to create their own game room where they could play privately with friends.
- Cross platform
    - Providing support to mobile devices for the game
    - Allowing users on mobile device to play with users on web platforms.
    - Can explore electron

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

