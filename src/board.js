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
import {checkForPossibleMoves, checkSwitchAllowed, getPossibleMoves} from "./validMoves";
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

    attemptMove(sectionID, positionID, distance, home) {
        // console.log(this.cardToBePlayed);
        if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "J") {
            return false;
        }
        console.log("attemptMove: "+ home)
        this.props.moves.playCard(this.cardToBePlayed, {sectionID: sectionID, positionID: positionID}, distance, home)
        this.cardToBePlayed = -1;
        return true
    }

    attemptSwitch(sectionID, positionID) {
        // Check for correct card
        if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value !== "J" &&
            this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value !== "Joker") {return false}
        // Check if a player is at the selected position
        if (!(this.props.G.positions[sectionID][positionID] >= 0)) {return false}

        // evaluate first player select
        if (this.switchPosition[0] < 0) {
            console.log("changing switchPosition")
            this.switchPosition = [sectionID, positionID]
            this.projected = []
            let cardID = this.cardToBePlayed
            let possibilities = this.possibleMoves.filter(function(move){
                return move.cardIndex === cardID &&
                    move.cardValue === "J" &&
                    ((move.position[0] === sectionID && move.position[1] === positionID) ||
                        (move.target[0] === sectionID && move.target[1] === positionID));
            });
            console.log(possibilities)
            for (let i = 0; i < possibilities.length; i++) {
                if (possibilities[i].position[0] === sectionID && possibilities[i].position[1] === positionID) {
                    this.projected.push(possibilities[i].target)
                } else {
                    this.projected.push(possibilities[i].position)
                }
            }
            console.log(this.projected)
            this.setState({...this.projected});
            return false;
        } else {
            console.log("executing switch")
            if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "Joker") {
                // If killing is an option, ask if kill or switch
                if (
                    this.props.G.positions[this.switchPosition[0]][this.switchPosition[1]] === this.myPlayerID &&
                    (((((sectionID*16 + positionID) - (this.switchPosition[0]*16+this.switchPosition[1]))%64)+64)%64 <= 13 ||
                        ((((sectionID*16 + positionID) - (this.switchPosition[0]*16+this.switchPosition[1]))%64)+64)%64 === ((-4+64)%64))
                ) {
                    if (window.confirm("Click OK to kill, cancel to switch (like J)")) {return false;}
                }
            }
            if (checkSwitchAllowed(this.props.G,
                this.myPlayerID,
                {"sectionID": this.switchPosition[0], "positionID": this.switchPosition[1]},
                {"sectionID": sectionID, "positionID": positionID})) {
                this.props.moves.playCard(this.cardToBePlayed, {
                    "sectionID": this.switchPosition[0],
                    "positionID": this.switchPosition[1]
                }, {"sectionID": sectionID, "positionID": positionID})
                this.projected = []
                this.switchPosition = [-1,-1];
                this.setState({...this.projected});
                this.cardToBePlayed = -1;
                return true;
            }
            this.projected = []
            this.switchPosition = [-1,-1];
            this.setState({...this.projected});
            return false;
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
        this.switchPosition = [-1,-1];
        this.projectedDistance = [];
        this.intendedPlayer = [-1,-1];
        for (let i = 0; i < possibilities.length; i++) {
            this.projected.push(possibilities[i].position)
            if (possibilities[i].cardValue === "J") {
                this.projected.push(possibilities[i].target)
            }
        }

        this.setState({...this.projected});

        // if (window.confirm("testWindow")) {console.log("tested")}
    }

    onClickPosition(sectionID, positionID) {

        // Ensure a card is selected
        if (this.cardToBePlayed >=0 && this.cardToBePlayed < this.props.G.players[this.myPlayerID].myCards.length) {
            // Attempt Switch if Jack card
            if (this.attemptSwitch(sectionID, positionID)) {return}
            if (sectionID === this.myPlayerID && positionID === -1) {
                if(this.attemptStart()) {
                    this.projected = []
                    return
                }
            }
            if (this.props.G.positions[sectionID][positionID] === this.myPlayerID) {
                console.log("selected my own player")

                let selectedCard = this.cardToBePlayed
                let possibilities = this.possibleMoves.filter(function(move){
                    return move.cardIndex === selectedCard && move.position[0] === sectionID && move.position[1] === positionID;
                });
                console.log(possibilities)

                if (possibilities.length === 1) {
                    if (this.attemptMove(sectionID, positionID)) {
                        this.projected = [];
                        return
                    }
                } else if (this.props.G.players[this.myPlayerID].myCards[this.cardToBePlayed].value === "J") {

                } else {
                    console.log("in here")
                    this.projected = [];
                    this.projectedDistance = [];
                    this.intendedPlayer = [sectionID, positionID]
                    for (let i = 0; i < possibilities.length; i++) {
                        if (possibilities[i].home) {
                            this.projected.push([(Math.floor(sectionID + (positionID + possibilities[i].cardValue) / 16)) % 4, (positionID + possibilities[i].cardValue) % 16 + 10])
                        } else {
                            this.projected.push([(Math.floor(sectionID + (positionID + possibilities[i].cardValue) / 16)) % 4, (positionID + possibilities[i].cardValue) % 16])
                        }
                        this.projectedDistance.push(possibilities[i].cardValue)
                    }
                    this.setState({...this.projected});
                }
            }
            if (this.projectedDistance.length !== 0 && this.projected.some(e => e[0] === sectionID && e[1] === positionID)) {
                // if (this.attemptMove())
                console.log("something")
                console.log(this.projected.findIndex(e => e[0] === sectionID && e[1] === positionID))
                if (this.attemptMove(this.intendedPlayer[0], this.intendedPlayer[1], this.projectedDistance[this.projected.findIndex(e => e[0] === sectionID && e[1] === positionID)], positionID >= 20)) {
                    this.projected = [];
                    return
                }
            }
            if (positionID - 20 >= 0) {
                console.log("are we winning?")
                if (sectionID === this.myPlayerID && this.props.G.winPositions[this.myPlayerID][positionID-20] === this.myPlayerID) {
                    let selectedCard = this.cardToBePlayed
                    let possibilities = this.possibleMoves.filter(function(move) {
                        return move.cardIndex === selectedCard && move.position[0] === sectionID && move.position[1] === positionID;
                    })
                    console.log(possibilities)
                    if (possibilities.length === 1) {
                        if (this.attemptMove(sectionID, positionID)) {
                            this.projected = [];
                            return;
                        }
                        else {
                            console.log("in here 2")
                            this.projected = []
                            this.projectedDistance = []
                            this.intendedPlayer = [sectionID, positionID]
                            for (let i = 0; i < possibilities.length; i++) {
                                this.projected.push([sectionID][positionID+possibilities[i].cardValue])
                                this.projectedDistance.push(possibilities[i].cardValue)
                            }
                            this.setState({...this.projected});
                        }
                    }
                }
                if (this.projectedDistance.length !== 0 && this.projected.some(e => e[0] === sectionID && e[1] === positionID)) {
                    console.log("mwahahahah")
                    if (this.attemptMove(this.intendedPlayer[0], this.intendedPlayer[1], this.projectedDistance[this.projected.findIndex(e => e[0] === sectionID && e[1] === positionID)], positionID >= 20)) {
                        this.projected = [];
                        return
                    }
                }
            }
        }
    }

    getBoardSection(playerID, screenPos, orientation) {
        const items = []

        // Draw main path
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
        }

        // Draw at home ball
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

        // Draw win positions
        for (let i = 0; i < 4; i++) {
            items.push(<Circle
                key={500+100*playerID+i}
                x={params.winPositions[i][0]*params.positionDelta}
                y={params.winPositions[i][1]*params.positionDelta}
                color={""+params.playerColors[this.props.G.winPositions[playerID][i]]}
                borderWidth={"4px"}
                borderColor={params.playerColors[playerID]}
                onClick={this.onClickPosition.bind(this, playerID, 20+i)}
                selectable={this.projected.some(e => e[0] === playerID && e[1] === i+20)}
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
        } else {
            this.myPlayerID = parseInt('0');
        }

        this.myCards = this.props.G.players[this.myPlayerID].myCards;

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