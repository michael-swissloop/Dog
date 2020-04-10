/*
 * Copyright 2020 Michael Rogenmoser
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import BoardSection from "./boardSection";
// import CardDeck from "./cardDeck";
// import MyCards from "./myCards";
import Card from "./card";
const params = require('./params.json');

class Board extends React.Component {
    static propTypes = {
        G: PropTypes.any.isRequired,
        ctx: PropTypes.any.isRequired,
        moves: PropTypes.any.isRequired,
        playerID: PropTypes.string,
        isActive: PropTypes.bool,
        isMultiplayer: PropTypes.bool,
    };
    //
    // onClick = id => {
    //     if (this.isActive(id)) {
    //         this.props.moves.clickCell(id);
    //     }
    // };
    //
    // isActive(id) {
    //     if (!this.props.isActive) return false;
    //     if (this.props.G.cells[id] !== null) return false;
    //     return true;
    // }

    render() {

        // let myDeck = CardDeck();
        // console.log(myDeck.deck);

        let orientingID0
        let orientingID1
        let orientingID2
        let orientingID3

        if (parseInt(this.props.playerID) < 10) {
            orientingID0 = parseInt(this.props.playerID) + 0;
            orientingID1 = (parseInt(this.props.playerID)+1)%4;
            orientingID2 = (parseInt(this.props.playerID)+2)%4;
            orientingID3 = (parseInt(this.props.playerID)+3)%4;
        } else {
            orientingID0 = '0';
            orientingID1 = '1';
            orientingID2 = '2';
            orientingID3 = '3';
        }

        let myCards = this.props.G.players[orientingID0].myCards;

        let items = [];

        for (let i = 0; i < myCards.length; i++) {
            items.push(
                <div style={{position: "absolute", left: ((10.5)*params.positionDelta+(60*(i-myCards.length/2)))+"px", top: 20*params.positionDelta+"px"}}>
                    <Card suit={myCards[i].suit} value={myCards[i].value} selected={myCards[i].selected} />
                </div>
            )
        }


        return(
            <div>
                <BoardSection
                    playerID={(orientingID0)}
                    screenPos={[8*params.positionDelta,14*params.positionDelta]}
                    orientation={0}
                    positions={this.props.G.positions[(orientingID0)]}
                    winPositions={this.props.G.winPositions[(orientingID0)]}
                    atHome={this.props.G.atHome[(orientingID0)]}
                />
                <BoardSection
                    playerID={(orientingID1)}
                    screenPos={[15*params.positionDelta,13*params.positionDelta]}
                    orientation={-90}
                    positions={this.props.G.positions[(orientingID1)]}
                    winPositions={this.props.G.winPositions[(orientingID1)]}
                    atHome={this.props.G.atHome[(orientingID1)]}
                />
                <BoardSection
                    playerID={orientingID2}
                    screenPos={[14*params.positionDelta,6*params.positionDelta]}
                    orientation={180}
                    positions={this.props.G.positions[orientingID2]}
                    winPositions={this.props.G.winPositions[orientingID2]}
                    atHome={this.props.G.atHome[orientingID2]}
                />
                <BoardSection
                    playerID={orientingID3}
                    screenPos={[7*params.positionDelta,7*params.positionDelta]}
                    orientation={90}
                    positions={this.props.G.positions[orientingID3]}
                    winPositions={this.props.G.winPositions[orientingID3]}
                    atHome={this.props.G.atHome[orientingID3]}
                />
                {items}
                <div style={{position: "absolute", left: (10.5*params.positionDelta-30)+"px", top: (9.5*params.positionDelta-30)+"px"}}>
                    <Card suit={this.props.G.centerCard.suit} value={this.props.G.centerCard.value} />
                </div>
            </div>

        );
    }
}

export default Board;