
export function checkForPossibleMoves(G, playerID) {
    // Check if starting is an option
    let handContainsStart = false;
    for (let i = 0; i < G.players[playerID].myCards.length; i++) {
        if (G.players[playerID].myCards[i].value === "Joker" ||
            G.players[playerID].myCards[i].value === "K" ||
            G.players[playerID].myCards[i].value === "A"
        ) {
            console.log(G.players[playerID].myCards[i].value)
            handContainsStart=true}
    }
    // console.log(G.positions[ctx.currentPlayer][9])
    // console.log(ctx.currentPlayer)
    // console.log(G.positions[ctx.currentPlayer][9] !== ctx.currentPlayer)
    if(G.atHome[playerID] !== 0 &&
        G.positions[playerID][9] !== parseInt(playerID) &&
        handContainsStart
    ) {return true;}
    // Check if Moving is an option
    return false
}