const suits = ['SPADES', 'CLUBS', 'DIAMONDS', 'HEARTS'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const generateDeck = () => {
	const deck = [];

	// Loop through each suit and value to create the cards
	suits.forEach(suit => {
		values.forEach(value => {
			const card = {
				id: `${value}_${suit}`,         // Example: 'A_SPADES', '10_HEARTS'
				cardSuit: suit,                 // Card suit, e.g., 'SPADES', 'HEARTS'
				cardValue: value                // Card value, e.g., 'A', '10', 'K'
			};
			deck.push(card);
		});
	});

	return deck;
}

const shuffleDeck = (deck) => {
	for (let i = deck.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[deck[i], deck[j]] = [deck[j], deck[i]];
	}
	console.log('here');
	return deck;
};

// Generate the full deck
export const cards = shuffleDeck(generateDeck())