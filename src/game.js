/*
 * Copyright 2020 Michael Rogenmoser
 */

import { getNewCardDeck, shuffleDeck } from './cardDeck';
// import {Game, PlayerView} from "boardgame.io/core";
import {ActivePlayers, INVALID_MOVE} from "boardgame.io/core";
import {checkForPossibleMoves, checkForBlock, checkHomePossible} from "./validMoves"

function StartPawn(G, currentPlayer) {
    if (G.positions[parseInt(currentPlayer)][9] !== -1) {
        G.atHome[G.positions[parseInt(currentPlayer)][9]] ++;
    }
    G.positions[parseInt(currentPlayer)][9] = parseInt(currentPlayer);
    G.atHome[parseInt(currentPlayer)] --;
    G.blocking[parseInt(currentPlayer)] = true;
}

function isVictory(winPositions, currentPlayer) {
    if (winPositions === Array(4).fill(parseInt(currentPlayer))){
        return true;
    } else {
        return false;
    }
}

function movePawn(G, currentPlayer, pawnLocation, distance, home) {
    let newPos = [(Math.floor(pawnLocation.sectionID+(pawnLocation.positionID+distance)/16))%4, (pawnLocation.positionID+distance)%16]
    console.log(distance);
    console.log(pawnLocation);
    console.log(newPos);
    if (!checkForBlock(G, pawnLocation.sectionID, pawnLocation.positionID, distance)) {
        return false;
    }
    // Ensure correct player on position
    if (G.positions[pawnLocation.sectionID][pawnLocation.positionID] === parseInt(currentPlayer)) {

        if (home) {
            if (checkHomePossible(G, parseInt(currentPlayer), pawnLocation, distance)) {
                // remove player
                G.positions[pawnLocation.sectionID][pawnLocation.positionID] = -1;
                // place player at target position
                G.winPositions[newPos[0]][newPos[1]-10] = parseInt(currentPlayer);
            } else {
                return false
            }
        }

        else {
            // remove player
            G.positions[pawnLocation.sectionID][pawnLocation.positionID] = -1;
            // remove player at target position
            if (G.positions[newPos[0]][newPos[1]] < 6 && G.positions[newPos[0]][newPos[1]] >= 0) {
                G.atHome[G.positions[newPos[0]][newPos[1]]]++;
            }
            // place player at target position
            G.positions[newPos[0]][newPos[1]] = parseInt(currentPlayer);
        }
    }
    // remove blocking param when moving away from blocking location
    if (pawnLocation.sectionID === parseInt(currentPlayer) && pawnLocation.positionID === 9) {
        G.blocking[parseInt(currentPlayer)] = false;
    }
    // allowedHome logic
    if (newPos[1] === 9) {
        G.allowedHome[newPos[0]] = false;
    }
    if (newPos[0] === parseInt(currentPlayer) && newPos[1] === 9 && distance !== -4) {
        G.allowedHome[parseInt(currentPlayer)] = true;
    }
    if (pawnLocation.sectionID === parseInt(currentPlayer) && pawnLocation.positionID === 9) {
        G.allowedHome[parseInt(currentPlayer)] = false;
    }
    return true;
}

export function playCard(G, ctx, cardID, pawnPosition, additionalParam, home) {
    // console.log("currPlayer: "+ctx.currentPlayer);
    // console.log("cardID: "+cardID);
    // console.log("pawnPosition: "+pawnPosition.sectionID + " " + pawnPosition.positionID);
    // console.log("card value: "+G.players[ctx.currentPlayer].myCards[cardID].value);
    console.log(typeof additionalParam)
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
    }  else if (
        pawnPosition.positionID !== -1 &&
        G.players[ctx.currentPlayer].myCards[cardID].value === "Q"
    ) {
        if(!movePawn(G, ctx.currentPlayer, pawnPosition, 12, home)) {return INVALID_MOVE}
    } else if (
        pawnPosition.positionID !== -1 &&
        G.players[ctx.currentPlayer].myCards[cardID].value === "K"
    ) {
        if(!movePawn(G, ctx.currentPlayer, pawnPosition, 13, home)) {return INVALID_MOVE}
    } else if(
        pawnPosition.positionID !== -1 &&
        G.players[ctx.currentPlayer].myCards[cardID].value === "A"
    ) {
        if (additionalParam === 11) {
            if(!movePawn(G, ctx.currentPlayer, pawnPosition, 11, home)) {return INVALID_MOVE}
        } else {
            if(!movePawn(G, ctx.currentPlayer, pawnPosition, 1, home)) {return INVALID_MOVE}
        }
    } else if (
        pawnPosition.positionID !== -1 &&
        G.players[ctx.currentPlayer].myCards[cardID].value === "Joker" &&
        Number.isInteger(additionalParam)
    ) {
        if(!movePawn(G, ctx.currentPlayer, pawnPosition, additionalParam, home)) {return INVALID_MOVE}
    } else if (
        pawnPosition.positionID !== -1 &&
        G.players[ctx.currentPlayer].myCards[cardID].value === "Joker" &&
        typeof additionalParam === 'object'
    ) {
        if(!switchPlayers(G, ctx, pawnPosition, additionalParam)) {return INVALID_MOVE}
    } else if (
        G.players[ctx.currentPlayer].myCards[cardID].value === "J"
    ) {
        if (!switchPlayers(G, ctx, pawnPosition, additionalParam)) {return INVALID_MOVE}
    } else if (
        pawnPosition.positionID !== -1 &&
        !isNaN(G.players[ctx.currentPlayer].myCards[cardID].value)
    ) {
        if (parseInt(G.players[ctx.currentPlayer].myCards[cardID].value) === 4 && additionalParam === -4) {
            if(!movePawn(G, ctx.currentPlayer, pawnPosition, -4, false)) {return INVALID_MOVE}
        }else if(!movePawn(G, ctx.currentPlayer, pawnPosition, parseInt(G.players[ctx.currentPlayer].myCards[cardID].value), home)) {return INVALID_MOVE}
    } else {
        console.log("something went wrong")
        return INVALID_MOVE;
    }
    G.centerCard = G.players[ctx.currentPlayer].myCards[cardID];
    G.secret.spentCards.push(G.players[ctx.currentPlayer].myCards.splice(cardID,1)[0]);
}

export function selectExchange(G, ctx, playerID, cardID) {
    if (G.secret.newCard[(parseInt(playerID)+2)%ctx.numPlayers] !== null) {
        return INVALID_MOVE;
    } else {
        G.secret.newCard[(parseInt(playerID)+2)%ctx.numPlayers] = G.players[playerID].myCards.splice(cardID, 1)[0];
    }
}

export function doNothing(G, ctx) {
    // check if moves can be made, otherwise throw away cards
    if (!checkForPossibleMoves(G, ctx.currentPlayer)) {
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

export function playJackCard(G, ctx, cardID, pawnPosition1, pawnPosition2) {
    if ((parseInt(ctx.currentPlayer) === G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] ||
        parseInt(ctx.currentPlayer) === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID])
        && G.players[ctx.currentPlayer].myCards[cardID].value === "J"
    ) {
        if (switchPlayers(G, ctx, pawnPosition1, pawnPosition2)) {
            G.centerCard = G.players[ctx.currentPlayer].myCards[cardID];
            G.secret.spentCards.push(G.players[ctx.currentPlayer].myCards.splice(cardID,1)[0]);
            return;
        }
    } else {
        console.log("error 0")
    }
    return INVALID_MOVE;
}

export function switchPlayers(G, ctx, pawnPosition1, pawnPosition2) {
    if (G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === -1) {console.log("error 1");return false;}
    if (G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] === -1) {console.log("error 2");return false;}
    if (G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]) {console.log("error 3");return false;}
    if (pawnPosition1.positionID === 9 &&
        pawnPosition1.sectionID === G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] &&
        G.blocking[G.positions[pawnPosition1.sectionID][pawnPosition1.positionID]]) {console.log("error 4");return false;}
    if (pawnPosition2.positionID === 9 &&
        pawnPosition2.sectionID === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] &&
        G.blocking[G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]]) {console.log("error 5");return false;}
    if (!(parseInt(ctx.currentPlayer) === G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] ||
        parseInt(ctx.currentPlayer) === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID])) {console.log("error 0");return false;}

    let temp = G.positions[pawnPosition1.sectionID][pawnPosition1.positionID]
    G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] = G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]
    G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] = temp

    if (pawnPosition1.positionID === 9 && G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === pawnPosition1.sectionID) {
        G.allowedHome[pawnPosition1.sectionID] = true
    }
    if (pawnPosition2.positionID === 9 && G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] === pawnPosition2.sectionID) {
        G.allowedHome[pawnPosition2.sectionID] = true
    }
    return true
}

const Dog = {
    name: "Dog",

    setup: (ctx, setupData) => {
        let positions = Array.from({length:(2*Math.ceil(ctx.numPlayers/2))},()=>((Array.from({length:16},()=>(-1)))));
        // for (let i = 0; i<ctx.numPlayers; i++) {
        //     positions[i][9] = i;
        // }
        let deck = getNewCardDeck(2);
        deck = shuffleDeck(deck);
        // deck = ctx.random.Shuffle(deck);

        let players = {}
        for (let i = 0; i < ctx.numPlayers; i++) {
            players[i] = {myCards:[]}
        }

        return{
            positions: positions,
            winPositions: Array((2*Math.ceil(ctx.numPlayers/2))).fill(Array(4).fill(-1)),
            atHome: Array(ctx.numPlayers).fill(4),
            blocking: Array(ctx.numPlayers).fill(null).map(()=>(false)),
            allowedHome: Array(ctx.numPlayers).fill(null).map(()=>(false)),
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
            onBegin: (G, ctx) => {
                // Reshuffle complete deck at start of phase
                G.secret.deck = shuffleDeck(G.secret.deck.concat(G.secret.spentCards))
                G.secret.spentCards = [];

                //distribute cards
                let numCards = 6-(G.roundCounter%5)
                for (let i = 0; i<ctx.numPlayers; i++) {
                    for (let j=0; j<numCards; j++) {
                        G.players[i].myCards.push(G.secret.deck.pop());
                    }
                }
            },
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
            moves: { playCard, playJackCard, doNothing },
            next: "ExchangeCards",
            turn: {
                moveLimit: 1,
                order: {
                    first: (G, ctx) => (G.roundCounter)%ctx.numPlayers,
                    next: (G, ctx) => {
                        let nextPlayer = (ctx.playOrderPos + 1) % ctx.numPlayers
                        for (let i = 0; i < ctx.numPlayers; i++) {
                            if (G.players[nextPlayer].myCards.length === 0) {
                                nextPlayer = (nextPlayer + 1) % ctx.numPlayers
                            } else {
                                break;
                            }
                        }
                        return nextPlayer
                    }
                },
                onBegin: (G, ctx) => {
                    // console.log("in onBegin")
                    // Check if there are still cards, if not end phase
                    let check = true;
                    for (let i = 0; i < ctx.numPlayers; i++) {
                        if (G.players[i].myCards.length !== 0) {check = false;}
                    }
                    if (check) {
                        ctx.events.endPhase();
                    }
                },
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
