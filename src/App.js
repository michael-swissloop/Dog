import React from 'react'
import { Client } from 'boardgame.io/react';
import Dog from "./game";
import Board from "./board";
import { Local, SocketIO } from "boardgame.io/multiplayer"

const DogClient = Client({
    game: Dog,
    numPlayers: 4,
    board: Board,
    multiplayer: SocketIO({ server: 'http://localhost:8000/' }),
    // debug: false,
});

const App = () => (
    <div>
        <div>
            Player 0
            <DogClient playerID={'0'} />
        </div>
        <div style={{transform: "translate(800px, 0px)"}}>
            Player 1
            <DogClient playerID={'1'} />
        </div>
        <div style={{transform: "translate(0px, 800px)"}}>
            Player 2
            <DogClient playerID={'2'} />
        </div>
        <div style={{transform: "translate(800px, 800px)"}}>
            Player 3
            <DogClient playerID={'3'} />
        </div>
    </div>
)

// const App = Client({
//     game: Dog,
//     numPlayers: 4,
//     board: Board,
// });

export default App;
