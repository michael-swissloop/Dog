
export function checkForPossibleMoves(G, playerID) {
    // Check if starting is an option
    let handContainsStart = false;
    let lowestPossibleMove = 100;
    let handContainsSwitch = false;
    for (let i = 0; i < G.players[playerID].myCards.length; i++) {
        if (G.players[playerID].myCards[i].value === "Joker" ||
            G.players[playerID].myCards[i].value === "K" ||
            G.players[playerID].myCards[i].value === "A"
        ) {
            // console.log(G.players[playerID].myCards[i].value)
            handContainsStart=true}
        if (G.players[playerID].myCards[i].value === "J" ||
            G.players[playerID].myCards[i].value === "Joker"
        ) {handContainsSwitch = true;}
        if (!isNaN(parseInt(G.players[playerID].myCards[i].value))) {
            lowestPossibleMove = Math.min(lowestPossibleMove, parseInt(G.players[playerID].myCards[i].value))
            if (G.players[playerID].myCards[i].value === "4") {
                lowestPossibleMove = -4;
            }
        } else if (G.players[playerID].myCards[i].value === "A") {
            lowestPossibleMove = Math.min(lowestPossibleMove, 1)
        } else if (G.players[playerID].myCards[i].value === "K") {
            lowestPossibleMove = Math.min(lowestPossibleMove, 13)
        } else if (G.players[playerID].myCards[i].value === "Q") {
            lowestPossibleMove = Math.min(lowestPossibleMove, 12)
        }
    }
    // console.log("Lowest Possible: " + lowestPossibleMove)
    // console.log(G.positions[ctx.currentPlayer][9])
    // console.log(ctx.currentPlayer)
    // console.log(G.positions[ctx.currentPlayer][9] !== ctx.currentPlayer)
    if(G.atHome[playerID] !== 0 &&
        G.positions[playerID][9] !== parseInt(playerID) &&
        handContainsStart
    ) {return true;}

    // Iterate through gameboard (because I'm too lazy)
    for (let i = 0; i < G.positions.length; i++) {
        for (let j = 0; j < 16; j++) {
            // Check if Switching is an option


            // Check if Moving is an option
            if (G.positions[i][j] === playerID && lowestPossibleMove < 100) {
                if (checkForBlock(G, i, j, lowestPossibleMove)) {
                    return true;
                }
            }

        }
    }

    return false
}

export function checkForBlock(G, sectionID, positionID, distance) {
    if (distance === null) {return false}
    for (let i = 0; i < distance; i++) {
        let newPos = [(Math.floor(sectionID+(positionID+i+1)/16))%4, (positionID+i+1)%16]

        if (newPos[1] === 9 &&
            newPos[0] === G.positions[newPos[0]][newPos[1]] &&
            G.blocking[newPos[0]]
        ) {
            return false
        }
    }

    return true;
}