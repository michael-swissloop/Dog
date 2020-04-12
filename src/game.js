/*
 * Copyright 2020 Michael Rogenmoser
 */

import getNewCardDeck from './cardDeck';
// import {Game, PlayerView} from "boardgame.io/core";
import {ActivePlayers, INVALID_MOVE} from "boardgame.io/core";


function StartPawn(G, currentPlayer) {
    if (G.positions[parseInt(currentPlayer)][9] !== -1) {
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

function checkForPossibleMoves(G, ctx) {
    // Check if starting is an option
    let handContainsStart = false;
    for (let i = 0; i < G.players[ctx.currentPlayer].myCards.length; i++) {
        if (G.players[ctx.currentPlayer].myCards[i].value === "Joker" ||
            G.players[ctx.currentPlayer].myCards[i].value === "K" ||
            G.players[ctx.currentPlayer].myCards[i].value === "A"
        ) {
            console.log(G.players[ctx.currentPlayer].myCards[i].value)
            handContainsStart=true}
    }
    if(G.atHome[ctx.currentPlayer] !== 0 &&
        G.positions[ctx.currentPlayer][9] !== ctx.currentPlayer &&
        handContainsStart
    ) {return true;}
    // Check if Moving is an option

    return false
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

export function playCard(G, ctx, cardID, pawnPosition) {
    // console.log("currPlayer: "+ctx.currentPlayer);
    // console.log("cardID: "+cardID);
    // console.log("pawnPosition: "+pawnPosition.sectionID + " " + pawnPosition.positionID);
    // console.log("card value: "+G.players[ctx.currentPlayer].myCards[cardID].value);
    if(
        pawnPosition.sectionID === parseInt(ctx.currentPlayer) &&
        pawnPosition.positionID === -1 &&
        G.positions[ctx.currentPlayer][9] !== ctx.currentPlayer &&
        (
            G.players[ctx.currentPlayer].myCards[cardID].value === "A" ||
            G.players[ctx.currentPlayer].myCards[cardID].value === "K" ||
            G.players[ctx.currentPlayer].myCards[cardID].value === "Joker"
        )
    ) {
        StartPawn(G, ctx.currentPlayer);
    } else {
        console.log("something went wrong")
        return INVALID_MOVE;
    }
    G.centerCard = G.players[ctx.currentPlayer].myCards[cardID];
    G.secret.spentCards.push(G.players[ctx.currentPlayer].myCards.splice(cardID,1)[0]);
}

export function selectExchange(G, ctx, playerID, cardID) {
    if (G.secret.newCard[(parseInt(playerID)+2)%4] !== null) {
        return INVALID_MOVE;
    } else {
        G.secret.newCard[(parseInt(playerID)+2)%4] = G.players[playerID].myCards.splice(cardID, 1)[0];
    }
}

export function doNothing(G, ctx) {
    // check if moves can be made, otherwise throw away cards
    if (!checkForPossibleMoves(G, ctx)) {
        G.secret.spentCards = G.secret.spentCards.concat(G.players[ctx.currentPlayer].myCards);
        G.players[ctx.currentPlayer].myCards = [];
    }
    if (G.players[ctx.currentPlayer].myCards.length === 0) {
        console.log("attempted endTurn");
    }
    if (G.players[ctx.currentPlayer].myCards.length === 0) {
        return;
    } else {
        return INVALID_MOVE;
    }
}

const Dog = {
    name: "Dog",

    setup: (ctx, setupData) => {
        let positions = Array.from({length:4},()=>((Array.from({length:16},()=>(-1)))));
        // for (let i = 0; i<4; i++) {
        //     positions[i][9] = i;
        // }
        let deck = getNewCardDeck(2);
        deck = ctx.random.Shuffle(deck);

        let players = {'0':{myCards:[]}, '1':{myCards:[]}, '2':{myCards:[]}, '3':{myCards:[]}};
        for (let i = 0; i<4; i++) {
            for (let j=0; j<6; j++) {
                players[i].myCards.push(deck.pop());
            }
        }

        return{
            positions: positions,
            winPositions: Array(4).fill(Array(4).fill(-1)),
            atHome: Array(4).fill(4),
            blocking: Array(4).fill(null).map(()=>(false)),
            centerCard: {},
            secret: {
                deck: deck,
                spentCards: [],
                newCard: {'0':null, '1':null, '2':null,'3':null},
            },
            players: players,
            roundCounter: 0,
        }
        // deck;
    },

    events: {
        endTurn: true,
    },

    phases: {
        // Exchange Cards with Partner
        ExchangeCards: {
            moves: { selectExchange },
            next: 'PlayCards',
            onEnd: (G, ctx) => {
                for (let i = 0; i < ctx.numPlayers; i++) {
                    G.players[i].myCards.push(G.secret.newCard[i]);
                }
                G.secret.newCard = {'0':null, '1':null, '2':null,'3':null}

            },
            start: true,
            turn: {
                activePlayers: ActivePlayers.ALL_ONCE,
                onMove: (_,ctx) => {
                    if (ctx.activePlayers === null) {
                        ctx.events.endPhase();
                    }
                }

            }
        },
        PlayCards: {
            moves: { playCard, doNothing },
            next: "ExchangeCards",
            turn: {
                moveLimit: 1,
                order: {
                    first: (G) => (G.roundCounter)%4,
                    next: (G, ctx) => {
                        let nextPlayer = (ctx.playOrderPos + 1) % 4
                        for (let i = 0; i < ctx.numPlayers; i++) {
                            if (G.players[nextPlayer].myCards.length === 0) {
                                nextPlayer = (nextPlayer + 1) % 4
                            } else {
                                break;
                            }
                        }
                        return nextPlayer
                    }
                },
                onBegin: (G, ctx) => {
                    console.log("in onBegin")
                    // Check if there are still cards, if not end phase
                    let check = true;
                    for (let i = 0; i < 4; i++) {
                        if (G.players[i].myCards.length !== 0) {check = false;}
                    }
                    if (check) {
                        ctx.events.endPhase();
                    }
                },
                // endIf: (G, ctx) => {
                //     return G.players[ctx.currentPlayer].myCards.length === 0;
                // }
            },
            onEnd: (G, ctx) => {
                G.roundCounter++;
            }

        }
    },

    // turn: {
    //     moveLimit: 1,
    // },

    // moves: {
    //     // playCardWithClick(G, ctx, id) {
    //     //     if (id==="A" || id==="K") {
    //     //         StartPawn(G, ctx.currentPlayer);
    //     //         return
    //     //     }
    //     //     playerSearch:
    //     //     for (let i = 0; i < 4; i++) {
    //     //         for (let j = 0; j < 16; j++) {
    //     //             if (G.positions[i][j] === parseInt(ctx.currentPlayer)) {
    //     //
    //     //                 movePawn(G, parseInt(ctx.currentPlayer), [i,j],parseInt(id));
    //     //                 break playerSearch;
    //     //             }
    //     //
    //     //         }
    //     //     }
    //     // },
    //     playCard,
    // },

    // playerView: (G, ctx, playerID) => {
    //     return PlayerView.STRIP_SECRETS(G, playerID);
    // },

    endIf: (G, ctx) => {
        if (isVictory(G.winPositions,ctx.currentPlayer)) {
            return { winner: ctx.currentPlayer };
        }
    },

}



export default Dog;
