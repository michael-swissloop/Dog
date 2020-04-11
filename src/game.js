/*
 * Copyright 2020 Michael Rogenmoser
 */

import getNewCardDeck from './cardDeck';

function GetCards(G,ctx) {

}

function ExchangeCards(G,ctx) {

}

function PlayCard(G,ctx) {

}

function StartPawn(G, currentPlayer) {
    if (G.positions[parseInt(currentPlayer)][9] != -1) {
        G.atHome[G.positions[parseInt(currentPlayer)][9]] ++;
    }
    G.positions[parseInt(currentPlayer)][9] = parseInt(currentPlayer);
    G.atHome[parseInt(currentPlayer)] --;
}

function isVictory(winPositions, currentPlayer) {
    if (winPositions === Array(4).fill(parseInt(currentPlayer))){
        return true;
    } else {
        return false;
    }
}

function movePawn(G, currentPlayer, pawnLocation, distance) {
    let newPos = [(Math.floor(pawnLocation[0]+(pawnLocation[1]+distance)/16))%4, (pawnLocation[1]+distance)%16]
    console.log(distance);
    console.log(pawnLocation);
    console.log(newPos);
    if (G.positions[pawnLocation[0]][pawnLocation[1]] === parseInt(currentPlayer)) {
        // console.log(newPos);
        G.positions[pawnLocation[0]][pawnLocation[1]] = -1;
        if (G.positions[newPos[0]][newPos[1]] < 4 && G.positions[newPos[0]][newPos[1]] >= 0) {
            G.atHome[G.positions[newPos[0]][newPos[1]]]++;
        }
        G.positions[newPos[0]][newPos[1]] = parseInt(currentPlayer);
    }
}

const Dog = {
    name: "Dog",

    setup: (ctx, setupData) => {
        let positions = Array.from({length:4},()=>((Array.from({length:16},()=>(-1)))));
        for (let i = 0; i<4; i++) {
            positions[i][9] = i;
        }
        let deck = getNewCardDeck(2);
        deck = ctx.random.Shuffle(deck);

        let players = {'0':{myCards:[]}, '1':{myCards:[]}, '2':{myCards:[]}, '3':{myCards:[]}};
        for (let i = 0; i<4; i++) {
            for (let j=0; j<6; j++) {
                players[i].myCards.push(deck.pop());
            }
            players[i].cardToBePlayed = null;
        }

        return{
            positions: positions,
            winPositions: Array(4).fill(Array(4).fill(-1)),
            atHome: Array(4).fill(3),
            blocking: Array(4).fill(null).map(()=>(true)),
            centerCard: {},
            secret: {
                deck: deck,
                spentCards: [],
            },
            players: players
        }
        // deck;
    },

    turn: {moveLimit: 1 },

    // phases: {
    //     exchangeCards: {
    //         start: true,
    //     },
    //     normalPlay: {
    //
    //     }
    // },
    //
    //
    // stages: {
    //     selectCard: {
    //         moves: {
    //             pickCard: {
    //                 move: (G, ctx, id) => {
    //
    //                 },
    //                 undoable: true,
    //             }
    //         }
    //     },
    //     selectPlayer: {
    //         moves: {
    //             pickPlayer: {
    //                 move: (G, ctx, section, position) => {
    //
    //                 },
    //                 undoable: true,
    //             }
    //         }
    //     },
    //     selectMovement: {
    //         moves: {
    //             pickTargetSpot: {
    //                 move: (G, ctx, section, position) => {
    //
    //                 },
    //                 undoable: false,
    //             }
    //         }
    //     },
    // },


    moves: {
        playCard(G, ctx, id) {
            if (id==="A" || id==="K") {
                StartPawn(G, ctx.currentPlayer);
                return
            }
            playerSearch:
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 16; j++) {
                    if (G.positions[i][j] === parseInt(ctx.currentPlayer)) {

                        movePawn(G, parseInt(ctx.currentPlayer), [i,j],parseInt(id));
                        break playerSearch;
                    }

                }
            }
        },
        selectCard(G, ctx, id) {
            G.players[ctx.currentPlayer].cardToBePlayed = id;
        }
    },

    cardToBePlayedUpdate: (G, ctx, playerID, cardID) => {
        G.players[playerID].cardToBePlayed = cardID;
    },

    // playerView: (G, ctx, playerID) => {
    //     return StripSecrets(G, playerID);
    // },

    // phases: {
    //     startRound: {
    //         moves: {ExchangeCards},
    //     },
    //     play: {
    //         moves: {PlayCard},
    //     },
    // },

    // playerView: (G, ctx, playerID) => {
    //     return null;
    // }

    endIf: (G, ctx) => {
        if (isVictory(G.winPositions,ctx.currentPlayer)) {
            return { winner: ctx.currentPlayer };
        }
    },

}



export default Dog;
