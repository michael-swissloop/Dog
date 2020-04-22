
export function getPossibleMoves(G, playerID) {
    // Check if starting is an option
    let handContainsStart = false;
    let StartsInHand = [];
    let lowestPossibleMove = 100;
    let possibleTravel = [];
    let handContainsSwitch = [];

    let possibleMoves = []

    for (let i = 0; i < G.players[playerID].myCards.length; i++) {
        if (G.players[playerID].myCards[i].value === "Joker" ||
            G.players[playerID].myCards[i].value === "K" ||
            G.players[playerID].myCards[i].value === "A"
        ) {
            // console.log(G.players[playerID].myCards[i].value)
            handContainsStart=true
            StartsInHand.push(i)
        }
        if (G.players[playerID].myCards[i].value === "J" ||
            G.players[playerID].myCards[i].value === "Joker"
        ) {handContainsSwitch.push(i)}
        if (!isNaN(parseInt(G.players[playerID].myCards[i].value))) {
            possibleTravel.push({"cardIndex": i, "cardValue": parseInt(G.players[playerID].myCards[i].value)})
            lowestPossibleMove = Math.min(lowestPossibleMove, parseInt(G.players[playerID].myCards[i].value))
            if (G.players[playerID].myCards[i].value === "4") {
                possibleTravel.push({"cardIndex": i, "cardValue": -4})
                lowestPossibleMove = -4;
            }
        } else if (G.players[playerID].myCards[i].value === "A") {
            possibleTravel.push({"cardIndex": i, "cardValue": 1})
            possibleTravel.push({"cardIndex": i, "cardValue": 11})
            lowestPossibleMove = Math.min(lowestPossibleMove, 1)
        } else if (G.players[playerID].myCards[i].value === "K") {
            possibleTravel.push({"cardIndex": i, "cardValue": 13})
            lowestPossibleMove = Math.min(lowestPossibleMove, 13)
        } else if (G.players[playerID].myCards[i].value === "Q") {
            possibleTravel.push({"cardIndex": i, "cardValue": 12})
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
    ) {
        for (let i = 0; i < StartsInHand.length; i++) {
            possibleMoves.push({"cardIndex": StartsInHand[i], "cardValue": G.players[playerID].myCards[StartsInHand[i]].value, "position": [playerID, -1]})
        }
    }

    // Iterate through gameboard (because I'm too lazy)
    for (let i = 0; i < G.positions.length; i++) {
        for (let j = 0; j < 16; j++) {
            // Check if Switching is an option


            // Check if Moving is an option
            if (G.positions[i][j] === playerID && lowestPossibleMove < 100) {
                for (let k = 0; k < possibleTravel.length; k++) {
                    if (checkForBlock(G, i, j, possibleTravel[k].cardValue)) {
                        possibleMoves.push({"cardIndex": possibleTravel[k].cardIndex, "cardValue": possibleTravel[k].cardValue, "position": [i, j]})
                    }
                }

                // if (checkForBlock(G, i, j, lowestPossibleMove)) {
                //     possibleMoves.push({"cardIndex": 0, "cardValue": lowestPossibleMove, "position": [i, j]})
                // }
            }

        }
    }

    return possibleMoves;
}

export function checkForPossibleMoves(G, playerID) {
    return getPossibleMoves(G, playerID).length !== 0
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
    if (distance < 0) {
        for (let i = 0; i < distance; i--) {
            let newPos = [(Math.floor(sectionID+(positionID+i-1)/16))%4, (positionID+i-1)%16]

            if (newPos[1] === 9 &&
                newPos[0] === G.positions[newPos[0]][newPos[1]] &&
                G.blocking[newPos[0]]
            ) {
                return false
            }
        }
    }

    return true;
}

export function checkSwitchAllowed(G, playerID, pawnPosition1, pawnPosition2) {
    if (G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === -1) {return false;}
    if (G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] === -1) {return false;}
    if (G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]) {return false;}
    if (pawnPosition1.positionID === 9 &&
        pawnPosition1.sectionID === G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] &&
        G.blocking[G.positions[pawnPosition1.sectionID][pawnPosition1.positionID]]) {return false;}
    if (pawnPosition2.positionID === 9 &&
        pawnPosition2.sectionID === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] &&
        G.blocking[G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]]) {return false;}
    return true;
}