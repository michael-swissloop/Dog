import { Client } from 'boardgame.io/react';
import Dog from "./game";
import Board from "./board";

const App = Client({
    game: Dog,
    numPlayers: 4,
    board: Board });

export default App;
