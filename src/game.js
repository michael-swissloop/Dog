/*
 * Copyright 2020 Michael Rogenmoser
 */

function GetCards(G,ctx) {

}

function ExchangeCards(G,ctx) {

}

function PlayCard(G,ctx) {

}

const Dog = {
    name: "Dog",

    setup: () => ({
        positions: Array(4).fill(Array(16).fill(null)),
        winPositions: Array(4).fill(Array(4).fill(null)),
        atHome: Array(4).fill(4),
        blocking: Array(4).fill(null),
        // deck:
    }),

    turn: {moveLimit: 1 },

    moves: {
        playCard(G, ctx, id) {
            G.positions[ctx.currentPlayer][id] = ctx.currentPlayer;
            G.atHome[ctx.currentPlayer]--;
        },
    }

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

}



export default Dog;
