
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
        } else if (G.players[playerID].myCards[i].value === "Joker") {
            possibleTravel.push({"cardIndex": i, "cardValue": -4})
            possibleTravel.push({"cardIndex": i, "cardValue": 1})
            possibleTravel.push({"cardIndex": i, "cardValue": 2})
            possibleTravel.push({"cardIndex": i, "cardValue": 3})
            possibleTravel.push({"cardIndex": i, "cardValue": 4})
            possibleTravel.push({"cardIndex": i, "cardValue": 5})
            possibleTravel.push({"cardIndex": i, "cardValue": 6})
            possibleTravel.push({"cardIndex": i, "cardValue": 7})
            possibleTravel.push({"cardIndex": i, "cardValue": 8})
            possibleTravel.push({"cardIndex": i, "cardValue": 9})
            possibleTravel.push({"cardIndex": i, "cardValue": 10})
            possibleTravel.push({"cardIndex": i, "cardValue": 11})
            possibleTravel.push({"cardIndex": i, "cardValue": 12})
            possibleTravel.push({"cardIndex": i, "cardValue": 13})
            lowestPossibleMove = -4
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
            possibleMoves.push({"cardIndex": StartsInHand[i], "cardValue": G.players[playerID].myCards[StartsInHand[i]].value, "position": [playerID, -1], "home":false})
        }
    }

    let myOutPlayers = []
    let otherOutPlayers = []

    // Iterate through gameboard (because I'm too lazy)
    for (let i = 0; i < G.positions.length; i++) {
        for (let j = 0; j < 16; j++) {
            // Check if Switching is an option
            if (handContainsSwitch.length !== 0) {
                if (G.positions[i][j] === playerID) {
                    if (G.blocking[playerID] && playerID === i && j === 9) {}
                    else {myOutPlayers.push([i,j])}
                }
                else if (G.positions[i][j] !== -1) {
                    if (G.blocking[i] && G.positions[i][j] === i && j === 9) {}
                    else {otherOutPlayers.push([i,j])}
                }
            }

            // Check if Moving is an option
            if (G.positions[i][j] === playerID && lowestPossibleMove < 100) {
                for (let k = 0; k < possibleTravel.length; k++) {
                    if (checkForBlock(G, i, j, possibleTravel[k].cardValue)) {
                        possibleMoves.push({"cardIndex": possibleTravel[k].cardIndex, "cardValue": possibleTravel[k].cardValue, "position": [i, j], "home":false})
                        if (
                            checkHomePossible(G, playerID, {"sectionID":i, "positionID":j}, possibleTravel[k].cardValue)
                        ) {
                            possibleMoves.push({"cardIndex": possibleTravel[k].cardIndex, "cardValue": possibleTravel[k].cardValue, "position": [i, j], "home":true})
                        }
                    }
                }
            }

        }
    }

    for (let i = 0; i < 3; i++) {
        if (G.winPositions[playerID][i] === playerID) {
            for (let k = 0; k < possibleTravel.length; k++) {
                if (possibleTravel[k].cardValue < 4-i && possibleTravel[k].cardValue > 0) {
                    let maybe = true
                    for (let j = 0; j < possibleTravel[k].cardValue; j++) {
                        if (G.winPositions[playerID][i + j + 1] === playerID) {
                            maybe = false
                        }
                    }
                    if (maybe) {
                        possibleMoves.push({"cardIndex": possibleTravel[k].cardIndex, "cardValue": possibleTravel[k].cardValue, "position": [playerID, 20+i], "home":true})
                    }
                }
            }
        }
    }

    if (handContainsSwitch.length !== 0) {
        for (let jack = 0; jack < handContainsSwitch.length; jack++) {
            for (let i = 0; i < myOutPlayers.length; i++) {
                for (let j = 0; j < otherOutPlayers.length; j++) {
                    possibleMoves.push({"cardIndex": handContainsSwitch[jack], "cardValue": "J", "position": myOutPlayers[i], "target": otherOutPlayers[j], "home":false})
                }
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
        let newPos = [(Math.floor(sectionID+(positionID+i+1)/16))%G.positions.length, (positionID+i+1)%16]

        if (newPos[1] === 9 &&
            newPos[0] === G.positions[newPos[0]][newPos[1]] &&
            G.blocking[newPos[0]]
        ) {
            return false
        }
    }
    if (distance < 0) {
        for (let i = 0; i < distance; i--) {
            let newPos = [(Math.floor(sectionID+(positionID+i-1)/16))%G.positions.length, (positionID+i-1)%16]

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
    if (!(G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] >= 0)) {return false;}
    if (!(G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] >= 0)) {return false;}
    if (G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]) {return false;}
    if (pawnPosition1.positionID === 9 &&
        pawnPosition1.sectionID === G.positions[pawnPosition1.sectionID][pawnPosition1.positionID] &&
        G.blocking[G.positions[pawnPosition1.sectionID][pawnPosition1.positionID]]) {return false;}
    if (pawnPosition2.positionID === 9 &&
        pawnPosition2.sectionID === G.positions[pawnPosition2.sectionID][pawnPosition2.positionID] &&
        G.blocking[G.positions[pawnPosition2.sectionID][pawnPosition2.positionID]]) {return false;}
    return true;
}

export function checkHomePossible(G, playerID, pawnPosition, distance) {
    let newPos = [(Math.floor(pawnPosition.sectionID+(pawnPosition.positionID+distance)/16))%G.positions.length, (pawnPosition.positionID+distance)%16]
    if (newPos[0] !== playerID) {return false}
    if (newPos[1] > 13) {return false}
    if (newPos[1] < 10) {return false}
    if (pawnPosition.sectionID === playerID && pawnPosition.positionID === 9 && !G.allowedHome[playerID]) {return false}
    if (pawnPosition.sectionID === playerID && pawnPosition.positionID > 9) {return false}
    if (pawnPosition.sectionID === (playerID+1)%G.positions.length) {return false}
    for (let i = 0; i < newPos[1]-10; i++) {
        if (G.winPositions[playerID][i] !== -1) {return false}
    }
    return true
}