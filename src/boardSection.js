import React from 'react';
import './board.css';
const params = require('./params.json');

// class Circle extends React.Component {
//     render() {
//         return (
//             <span class="circle" style={{position: "absolute", left: "500px"}}></span>
//         )
//     }
// }

function Circle(props) {
    return <span className="circle" style={{
        position: "absolute",
        left: props.x+"px",
        top: props.y+"px",
        background: props.color,
        border: props.border,
        textAlign: "center",
        color: "white",
        fontSize: "24px",
        transform: `translate(-50%, -50%)`
    }}>{props.text}</span>
}

const positions = [
    [0,0],
    [50,0],
    [50,50],
    [50,100],
    [50,150],
    [50,200],
    [100,200],
    [150,200],
    [200,200],
    [248,198],
    [250,150],
    [250,100],
    [250,50],
    [250,0],
    [300,0],
    [350,0],
]

class BoardSection extends React.Component {


    render(){

        const items = []
        const screenPos = this.props.screenPos

        for (let i = 0; i < 16; i++) {
            if(i===9){
                items.push(<Circle x={params.positions[i][0]} y={params.positions[i][1]} color={""+params.playerColors[this.props.positions[i]]} border={"5px solid "+params.playerColors[this.props.playerID]}/>)
            } else {
                items.push(<Circle x={params.positions[i][0]} y={params.positions[i][1]} color={""+params.playerColors[this.props.positions[i]]}/>)
            }
        }

        items.push(<Circle x={params.homePosition[0]} y={params.homePosition[1]} color={params.playerColors[this.props.playerID]} border={"3px solid "+params.playerColors[this.props.playerID]} text={this.props.atHome}/>)

        for (let i = 0; i < 4; i++) {
            items.push(<Circle x={params.winPositions[i][0]} y={params.winPositions[i][1]} color={""+params.playerColors[this.props.winPositions[i]]} border={"4px solid "+params.playerColors[this.props.playerID]}/>)
        }

        return (
            <div style={{position: "absolute", left: screenPos[0]+"px", top: screenPos[1], transform: `rotate(`+ this.props.orientation + `deg)`}}>
                {items}
                {/*{this.props.playerID}*/}

            </div>
        )
    }
}

export default BoardSection;