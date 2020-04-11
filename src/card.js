import React from "react";
import './cardDeck.css';

const Card = (props) => {
    if(props.value === "Joker") {
        return (
            <div className="card card-black" style={props.selected ? {backgroundColor: 'lightblue'} : {}} key={props.id}>
                <div className="card-joker">
                    <div style={{fontSize: "32px"}}>
                        {props.value}
                    </div>
                </div>
            </div>
        );
    } else if (props.suit === "heart" || props.suit === "♦︎" || props.suit === "diamond" || props.suit === "♥") {
        let suit = props.suit;
        if(props.suit === "heart"){ suit = "♥︎"};
        if(props.suit === "diamond"){ suit = "♦︎"};
        return (
            <div className="card card-red" style={props.selected ? {backgroundColor: 'lightblue'} : {}} key={props.id}>
                <div className="card-tl">
                    <div className="card-value">
                        {props.value}
                    </div>
                    <div className="card-suit">
                        {suit}
                    </div>
                </div>
                <div className="card-br">
                    <div className="card-value">
                        {props.value}
                    </div>
                    <div className="card-suit">
                        {suit}
                    </div>
                </div>
            </div>
        );
    } else {
        let suit = props.suit;
        if(props.suit === "spade"){ suit = "♠︎"};
        if(props.suit === "club"){ suit = "♣︎"};
        return (
            <div className="card card-black"  style={props.selected ? {backgroundColor: 'lightblue'} : {}} key={props.id}>
                <div className="card-tl">
                    <div className="card-value">
                        {props.value}
                    </div>
                    <div className="card-suit">
                        {suit}
                    </div>
                </div>
                <div className="card-br">
                    <div className="card-value">
                        {props.value}
                    </div>
                    <div className="card-suit">
                        {suit}
                    </div>
                </div>
            </div>
        );
    }
};

export default Card;