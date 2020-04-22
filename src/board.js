/*
 * Copyright 2020 Michael Rogenmoser
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
// import BoardSection from "./boardSection";
// import CardDeck from "./cardDeck";
// import MyCards from "./myCards";
import Card from "./card";
import {checkForPossibleMoves, getPossibleMoves} from "./validMoves";
const params = require('./params.json');

function Circle(props) {
    let rotate = props.rotate
    if (rotate == null) {
        rotate = 0
    }
    return <div key={props.id} className={"circle circle-"+props.color + ((props.selectable) ? " selectable" : "")} style={{
        left: props.x+"px",
        top: props.y+"px",
        // background: props.color,
        borderColor: props.borderColor,
        borderWidth: props.borderWidth,
        fontSize: (params.circleSize*0.8)+"px",
        transform: "translate(-50%, -50%) rotate(" + rotate + "deg)",
        width: params.circleSize+"px",
        height: params.circleSize+"px",
    }} onClick={props.onClick}>{props.text}</div>
}

class Board extends React.Component {
    static propTypes = {
        G: PropTypes.any.isRequired,
        ctx: PropTypes.any.isRequired,
        moves: PropTypes.any.isRequired,
        playerID: PropTypes.string,
        isActive: PropTypes.bool,
        isMultiplayer: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        this.cardToBePlayed = -1;
        this.switchPosition = [-1,-1];
        this.projected = [];
        this.projectedDistance = [];
        this.intendedPlayer = [-1,-1];
        this.possibleMoves = [];
    }

    isActive(id) {
        if (!this.props.isActive) return false;
        return true;
    }

    attemptStart() {
        if (!this.isActive(this.myPlayerID)){return false}
        if (this.props.G.blocking[this.myPlayerID]) { return false; }
        if (!["A", "K", "Joker"].includes(this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value)) {return false;}

        this.props.moves.playCard(this.cardToBePlayed, {sectionID: this.myPlayerID, positionID: -1});
        this.cardToBePlayed = -1;
        return true;
    }

    attemptMove(sectionID, positionID, distance) {
        // console.log(this.cardToBePlayed);
        if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "J") {
            return false;
        }
        this.props.moves.playCard(this.cardToBePlayed, {sectionID: sectionID, positionID: positionID}, distance)
        this.cardToBePlayed = -1;
        return true
    }

    attemptSwitch(sectionID, positionID) {
        if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value !== "J") {return false}
        console.log("playing Jack with: " + sectionID+ " and " + positionID)
        console.log("switchPosition is: " + this.switchPosition[0] + " and " + this.switchPosition[1])
        if (this.switchPosition[0] < 0) {
            console.log("changing switchPosition")
            this.switchPosition = [sectionID, positionID]
            return false;
        } else {
            console.log("executing switch")
            this.props.moves.playJackCard(this.cardToBePlayed, {"sectionID":this.switchPosition[0], "positionID": this.switchPosition[1]}, {"sectionID":sectionID, "positionID": positionID})
            this.switchPosition = [-1,-1]
            return true;
        }
    }

    onClickCard(id) {

        if (this.props.ctx.phase === "ExchangeCards") {
            // console.log("in exchange")
            this.props.moves.selectExchange(this.myPlayerID, id);
            this.instructions = null;
            this.setState({...this.instructions})
            return;
        }
        this.cardToBePlayed = id;

        this.setState({...this.cardToBePlayed});

        let possibilities = this.possibleMoves.filter(function(move){
            return move.cardIndex === id;
        });
        this.projected = []
        for (let i = 0; i < possibilities.length; i++) {
            this.projected.push(possibilities[i].position)
        }

        this.setState({...this.projected});
        // console.log(this.checkForPossibleMoves());
    }

    onClickPosition(sectionID, positionID) {
        // console.log("testing: "+sectionID+" "+positionID);

        // Ensure a card is selected
        if (this.cardToBePlayed >=0 && this.cardToBePlayed < this.props.G.players[this.myPlayerID].myCards.length) {
            if (this.attemptSwitch(sectionID, positionID)) {return}
            if (sectionID === this.myPlayerID && positionID === -1) {
                // console.log("at home players")
                // console.log(this.cardToBePlayed);
                if(this.attemptStart()) {
                    this.projected = []
                    return
                }
            }
            if (this.props.G.positions[sectionID][positionID] === this.myPlayerID) {
                console.log("selected my own player")
                // console.log("PlayerID: " + this.myPlayerID);
                // console.log("card: " + this.cardToBePlayed);

                let selectedCard = this.cardToBePlayed
                // console.log(this.possibleMoves)
                let possibilities = this.possibleMoves.filter(function(move){
                    return move.cardIndex === selectedCard && move.position[0] === sectionID && move.position[1] === positionID;
                });
                console.log(possibilities)
                // this.projected = []

                if (possibilities.length === 1) {
                    if (this.attemptMove(sectionID, positionID)) {
                        this.projected = [];
                        return
                    }
                } else {
                    console.log("in here")
                    this.projected = [];
                    this.projectedDistance = [];
                    this.intendedPlayer = [sectionID, positionID]
                    for (let i = 0; i < possibilities.length; i++) {
                        this.projected.push([(Math.floor(sectionID+(positionID+possibilities[i].cardValue)/16))%4, (positionID+possibilities[i].cardValue)%16])
                        this.projectedDistance.push(possibilities[i].cardValue)
                    }
                    this.setState({...this.projected});
                    // console.log(this.projected)
                    // console.log(this.projectedDistance)
                }
            }
            // console.log(this.projected.some(e => e[0] === sectionID && e[1] === positionID))
            // console.log(this.projected)
            // console.log([sectionID, positionID])
            // console.log(this.projectedDistance.length)
            if (this.projectedDistance.length !== 0 && this.projected.some(e => e[0] === sectionID && e[1] === positionID)) {
                // if (this.attemptMove())
                console.log("something")
                console.log(this.projected.findIndex(e => e[0] === sectionID && e[1] === positionID))
                if (this.attemptMove(this.intendedPlayer[0], this.intendedPlayer[1], this.projectedDistance[this.projected.findIndex(e => e[0] === sectionID && e[1] === positionID)])) {
                    this.projected = [];
                    return
                }
            }
            if (positionID - 20 >= 0) {
                console.log("are we winning?")
            }
        }
    }

    getBoardSection(playerID, screenPos, orientation) {
        const items = []

        for (let i = 0; i < 16; i++) {
            if(i===9){
                items.push(<Circle
                    key={parseInt(playerID)*100+i}
                    x={params.positions[i][0]*params.positionDelta}
                    y={params.positions[i][1]*params.positionDelta}
                    color={""+params.playerColors[this.props.G.positions[playerID][i]]}
                    borderWidth={"5px"}
                    borderColor={params.playerColors[playerID]}
                    onClick={this.onClickPosition.bind(this, playerID, i)}
                    selectable={this.projected.some(e => e[0] === playerID && e[1] === i)}

                />)
            } else {
                items.push(<Circle
                    key={parseInt(playerID)*100+i}
                    x={params.positions[i][0]*params.positionDelta}
                    y={params.positions[i][1]*params.positionDelta}
                    color={""+params.playerColors[this.props.G.positions[playerID][i]]}
                    onClick={this.onClickPosition.bind(this, playerID, i)}
                    selectable={this.projected.some(e => e[0] === playerID && e[1] === i)}
                />)
            }
            // console.log(this.projected.some(e => e[0] === 3 && e[1] === 11))
        }

        items.push(<Circle
            key={900+playerID}
            x={params.homePosition[0]*params.positionDelta}
            y={params.homePosition[1]*params.positionDelta}
            color={params.playerColors[playerID]}
            borderColor={params.playerColors[playerID]}
            text={this.props.G.atHome[playerID]}
            rotate={-orientation}
            onClick={this.onClickPosition.bind(this, playerID, -1)}
            selectable={this.projected.some(e => e[0] === playerID && e[1] === -1)}
        />)

        for (let i = 0; i < 4; i++) {
            items.push(<Circle
                key={500+100*playerID+i}
                x={params.winPositions[i][0]*params.positionDelta}
                y={params.winPositions[i][1]*params.positionDelta}
                color={""+params.playerColors[this.props.G.winPositions[playerID][i]]}
                borderWidth={"4px"}
                borderColor={params.playerColors[playerID]}
                onClick={this.onClickPosition.bind(this, playerID, 20+i)}
                selectable={this.projected.some(e => e[0] === 10+playerID && e[1] === i)}
            />)
        }

        return (
            <div key={1000+playerID} style={{position: "absolute", left: screenPos[0]+"px", top: screenPos[1], transform: `rotate(`+ orientation + `deg)`}}>
                {items}
                {/*<h2 style={{position: "absolute", left: 200}}>{this.props.playerID}</h2>*/}
            </div>
        )
    }

    render() {



        if (parseInt(this.props.playerID) < 10) {
            this.myPlayerID = parseInt(this.props.playerID);
            // this.orientingID0 = parseInt(this.props.playerID) + 0;
            // this.orientingID1 = (parseInt(this.props.playerID)+1)%4;
            // this.orientingID2 = (parseInt(this.props.playerID)+2)%4;
            // this.orientingID3 = (parseInt(this.props.playerID)+3)%4;
        } else {
            this.myPlayerID = parseInt('0');
            // this.orientingID0 = '0';
            // this.orientingID1 = '1';
            // this.orientingID2 = '2';
            // this.orientingID3 = '3';
        }

        this.myCards = this.props.G.players[this.myPlayerID].myCards;

        // for (let i = 0; i < myCards.length; i++) {
        //     myCards[i].selected = false;
        //     if (this.props.G.players[this.myPlayerID].cardToBePlayed === i) {
        //         myCards[i].selected = true;
        //     }
        // }

        let items = [];

        for (let i = 0; i < this.myCards.length; i++) {
            items.push(
                <div
                    key={410+i}
                    style={{
                        position: "absolute",
                        left: ((11.5)*params.positionDelta+(60*(i-this.myCards.length/2)))+"px",
                        top: 20*params.positionDelta+"px"
                    }}
                    onClick={this.onClickCard.bind(this, i)}
                >
                    <Card suit={this.myCards[i].suit} value={this.myCards[i].value} selected={this.cardToBePlayed === i} id={400+i}/>
                </div>
            )
        }

        // this.instructions = "myText"

        if (this.props.ctx.phase === "ExchangeCards") {
            if (this.props.G.secret.newCard[(this.myPlayerID+(this.props.ctx.numPlayers/2))%this.props.ctx.numPlayers] === null) {
                this.instructions = "Select Card to Exchange";
            } else {
                this.instructions = "Please wait for other Players"
            }
        } else {
            if (this.isActive(this.myPlayerID)) {
                this.possibleMoves = getPossibleMoves(this.props.G, this.myPlayerID)
                console.log(this.possibleMoves)
                if (!checkForPossibleMoves(this.props.G, this.myPlayerID)) {
                    this.instructions = "No moves available - Press 'Cannot Play'"
                } else if (this.cardToBePlayed === -1) {
                    this.instructions = "Select Card"
                } else {
                    // TODO change for starting card
                    if (
                            (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "Joker" ||
                            this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "K" ||
                            this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "A") &&
                        this.props.G.atHome[this.myPlayerID] !== 0 &&
                        this.props.G.positions[this.myPlayerID][9] !== this.myPlayerID
                    ) {
                        this.instructions = "Select Player or Start"
                    } else {
                        this.instructions = "Select Player"
                    }
                }
            } else {
                // this.projected = []
                this.instructions = "Please wait for other Players"
            }
        }

        let cannotPlay = <button
            onClick={() => this.props.moves.doNothing()}
            style={{
                position: "absolute",
                left: ((18)*params.positionDelta)+"px",
                top: 18.5*params.positionDelta+"px"
            }}
        >Cannot Play</button>

        let instructionBox = <div
            style={{
                position: "absolute",
                left: ((15.5)*params.positionDelta)+"px",
                top: 17*params.positionDelta+"px"
            }}
        >{this.instructions}</div>

        // console.log(parseInt(this.props.G.players[this.orientingID0].cardToBePlayed) === 3);
        // if (this.props.G.players[this.myPlayerID].myCards.length === 0 && this.isActive(this.myPlayerID)) {
        //     this.props.moves.doNothing();
        // }

        let boardSections = [];
        for (let i = 0; i < this.props.ctx.numPlayers; i++) {
            boardSections.push(
                this.getBoardSection(
                    (this.myPlayerID+i)%this.props.ctx.numPlayers,
                    [
                        params.boardOffsets[(2*Math.ceil(this.props.ctx.numPlayers/2))][i][0]*params.positionDelta,
                        params.boardOffsets[(2*Math.ceil(this.props.ctx.numPlayers/2))][i][1]*params.positionDelta
                    ],
                    params.boardOffsets[(2*Math.ceil(this.props.ctx.numPlayers/2))][i][2]
                )
            )
        }

        return(
            <div>
                {boardSections}

                {this.props.G.players[this.myPlayerID].myCards.map((value, index) => {
                    return <div
                        key={410+index}
                        style={{
                            position: "absolute",
                            left: ((11.5)*params.positionDelta+(60*(index-this.myCards.length/2)))+"px",
                            top: 20*params.positionDelta+"px"
                        }}
                        onClick={this.onClickCard.bind(this, index)}
                    >
                        <Card suit={value.suit} value={value.value} selected={this.cardToBePlayed === index} id={400+index}/>
                    </div>
                })}
                <div style={{position: "absolute", left: (11.5*params.positionDelta-30)+"px", top: (9.5*params.positionDelta-30)+"px"}}>
                    <Card id={904} suit={this.props.G.centerCard.suit} value={this.props.G.centerCard.value} />
                </div>
                {cannotPlay}
                {instructionBox}
            </div>

        );
    }
}

export default Board;