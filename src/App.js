import React from 'react'
import { Client } from 'boardgame.io/react';
import Dog from "./game";
import Board from "./board";
import { Local } from "boardgame.io/multiplayer"

// const DogClient = Client({
//     game: Dog,
//     numPlayers: 4,
//     board: Board,
//     // multiplayer: Local(),
// });
//
// const App = () => (
//     <div>
//         {/*<DogClient playerID={'0'} />*/}
//         <DogClient playerID={'0'} />
//     </div>
// )

const App = Client({
    game: Dog,
    numPlayers: 4,
    board: Board,
});

export default App;
