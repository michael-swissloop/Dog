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
    let rotate = props.rotate
    if (rotate == null) {
        rotate = 0
    }
    return <span className="circle" style={{
        position: "absolute",
        left: props.x+"px",
        top: props.y+"px",
        background: props.color,
        border: props.border,
        textAlign: "center",
        color: "white",
        fontSize: (params.circleSize*0.8)+"px",
        transform: "translate(-50%, -50%) rotate(" + rotate + "deg)",
        width: params.circleSize+"px",
        height: params.circleSize+"px",
    }}>{props.text}</span>
}

class BoardSection extends React.Component {


    render(){

        const items = []
        const screenPos = this.props.screenPos

        for (let i = 0; i < 16; i++) {
            if(i===9){
                items.push(<Circle x={params.positions[i][0]*params.positionDelta} y={params.positions[i][1]*params.positionDelta} color={""+params.playerColors[this.props.positions[i]]} border={"5px solid "+params.playerColors[this.props.playerID]}/>)
            } else {
                items.push(<Circle x={params.positions[i][0]*params.positionDelta} y={params.positions[i][1]*params.positionDelta} color={""+params.playerColors[this.props.positions[i]]}/>)
            }
        }

        items.push(<Circle x={params.homePosition[0]*params.positionDelta} y={params.homePosition[1]*params.positionDelta} color={params.playerColors[this.props.playerID]} border={"3px solid "+params.playerColors[this.props.playerID]} text={this.props.atHome} rotate={-this.props.orientation}/>)

        for (let i = 0; i < 4; i++) {
            items.push(<Circle x={params.winPositions[i][0]*params.positionDelta} y={params.winPositions[i][1]*params.positionDelta} color={""+params.playerColors[this.props.winPositions[i]]} border={"4px solid "+params.playerColors[this.props.playerID]}/>)
        }

        return (
            <div style={{position: "absolute", left: screenPos[0]+"px", top: screenPos[1], transform: `rotate(`+ this.props.orientation + `deg)`}}>
                {items}
                {/*<h2 style={{position: "absolute", left: 200}}>{this.props.playerID}</h2>*/}

            </div>
        )
    }
}

export default BoardSection;