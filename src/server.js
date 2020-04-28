const Server = require('boardgame.io/server').Server;
const Dog = require('./game').default;
const server = Server({ games: [Dog] });
server.run(8000);