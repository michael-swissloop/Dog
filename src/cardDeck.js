
export function getNewCardDeck(size = 1) {
    let deck = [];
    for (let i = 0; i < size; i++) {
        const suits = ["spade", "heart", "club", "diamond"];
        const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

        suits.forEach(function(suitItem, suitIndex) {
            values.forEach(function(valueItem, valueIndex) {
                deck.push({suit:suitItem, value:valueItem});
            });
        });
        deck.push({value:"Joker"});
        deck.push({value:"Joker"});
    }
    console.log(deck)
    return deck;
}

export function shuffleDeck(deck) {

    let clone = deck.slice(0);
    let srcIndex = deck.length;
    let dstIndex = 0;
    let shuffled = new Array(srcIndex);

    while (srcIndex) {
        let randIndex = (srcIndex * Math.random()) | 0;
        shuffled[dstIndex++] = clone[randIndex];
        clone[randIndex] = clone[--srcIndex];
    }

    return shuffled;
}