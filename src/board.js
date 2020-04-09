/*
 * Copyright 2020 Michael Rogenmoser
 */

import React from 'react';
import PropTypes from 'prop-types';
import './board.css';
import BoardSection from "./boardSection";


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
        return(
            <div>
                <BoardSection
                    playerID={(this.props.playerID+0)%4}
                    screenPos={[800,800]}
                    orientation={0}
                    positions={this.props.G.positions[(this.props.playerID+0)%4]}
                    winPositions={this.props.G.winPositions[(this.props.playerID+0)%4]}
                    atHome={this.props.G.atHome[(this.props.playerID+0)%4]}
                />
                <BoardSection
                    playerID={(this.props.playerID+1)%4}
                    screenPos={[1150,750]}
                    orientation={-90}
                    positions={this.props.G.positions[(this.props.playerID+1)%4]}
                    winPositions={this.props.G.winPositions[(this.props.playerID+1)%4]}
                    atHome={this.props.G.atHome[(this.props.playerID+1)%4]}
                />
                <BoardSection
                    playerID={(this.props.playerID+2)%4}
                    screenPos={[1100,400]}
                    orientation={180}
                    positions={this.props.G.positions[(this.props.playerID+2)%4]}
                    winPositions={this.props.G.winPositions[(this.props.playerID+2)%4]}
                    atHome={this.props.G.atHome[(this.props.playerID+2)%4]}
                />
                <BoardSection
                    playerID={(this.props.playerID+3)%4}
                    screenPos={[750,450]}
                    orientation={90}
                    positions={this.props.G.positions[(this.props.playerID+3)%4]}
                    winPositions={this.props.G.winPositions[(this.props.playerID+3)%4]}
                    atHome={this.props.G.atHome[(this.props.playerID+3)%4]}
                />
            </div>

        );
    }
}

export default Board;