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
const params = require('./params.json');

function Circle(props) {
    let rotate = props.rotate
    if (rotate == null) {
        rotate = 0
    }
    return <div key={props.id} className={"circle circle-"+props.color} style={{
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

    onClickCard(id) {

        if (this.props.ctx.phase === "ExchangeCards") {
            // console.log("in exchange")
            this.props.moves.selectExchange(this.myPlayerID, id);
            return;
        }
        this.cardToBePlayed = id;

        this.setState({...this.cardToBePlayed});
        // console.log(this.checkForPossibleMoves());
    }

    onClickPosition(sectionID, positionID) {
        console.log("testing: "+sectionID+" "+positionID);
        if (sectionID===this.myPlayerID && positionID===-1) {
            console.log("at home players")
            if (this.cardToBePlayed >=0 && this.cardToBePlayed < this.props.G.players[this.myPlayerID].myCards.length) {
                // console.log(this.cardToBePlayed);
                this.attemptStart();
            }
        }
        if (this.props.G.positions[sectionID][positionID] === this.myPlayerID) {
            console.log("selected my own player")
            console.log("PlayerID: "+this.myPlayerID);
            console.log("card: "+this.cardToBePlayed);
            if (this.cardToBePlayed >=0 && this.cardToBePlayed < this.props.G.players[this.myPlayerID].myCards.length) {
                console.log(this.cardToBePlayed);
                this.props.moves.playCard(this.cardToBePlayed, {sectionID: sectionID, positionID: positionID})
            }
        }
        if (positionID-20>=0) {
            console.log("are we winning?")
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
                />)
            } else {
                items.push(<Circle
                    key={parseInt(playerID)*100+i}
                    x={params.positions[i][0]*params.positionDelta}
                    y={params.positions[i][1]*params.positionDelta}
                    color={""+params.playerColors[this.props.G.positions[playerID][i]]}
                    onClick={this.onClickPosition.bind(this, playerID, i)}
                />)
            }
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
            />)
        }

        return (
            <div style={{position: "absolute", left: screenPos[0]+"px", top: screenPos[1], transform: `rotate(`+ orientation + `deg)`}}>
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

        let cannotPlay = <button
            onClick={() => this.props.moves.doNothing()}
            style={{
                position: "absolute",
                left: ((18)*params.positionDelta)+"px",
                top: 18.5*params.positionDelta+"px"
            }}
        >Cannot Play</button>

        // console.log(parseInt(this.props.G.players[this.orientingID0].cardToBePlayed) === 3);
        // if (this.props.G.players[this.myPlayerID].myCards.length === 0 && this.isActive(this.myPlayerID)) {
        //     this.props.moves.doNothing();
        // }

        return(
            <div>
                {this.getBoardSection(this.myPlayerID, [8.8*params.positionDelta,14.8*params.positionDelta], 0)}
                {this.getBoardSection((this.myPlayerID+1)%4, [16.7*params.positionDelta,13*params.positionDelta], -90)}
                {this.getBoardSection((this.myPlayerID+2)%4, [14.9*params.positionDelta,5.2*params.positionDelta], 180)}
                {this.getBoardSection((this.myPlayerID+3)%4, [7*params.positionDelta,7*params.positionDelta], 90)}

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
            </div>

        );
    }
}

export default Board;