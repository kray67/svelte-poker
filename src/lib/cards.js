const SUITS = ['SPADES', 'CLUBS', 'DIAMONDS', 'HEARTS'];
const VALUES = [
	{ face: '2', score: 1 },
	{ face: '3', score: 2 },
	{ face: '4', score: 3 },
	{ face: '5', score: 4 },
	{ face: '6', score: 5 },
	{ face: '7', score: 6 },
	{ face: '8', score: 7 },
	{ face: '9', score: 8 },
	{ face: '10', score: 9 },
	{ face: 'J', score: 10 },
	{ face: 'Q', score: 11 },
	{ face: 'K', score: 12 },
	{ face: 'A', score: 13 }
]

// import { SUITS, VALUES } from './constants'

const generateDeck = () => {
	const DECK = []

	// Loop through each suit and value to create the cards
	SUITS.forEach(suit => {
		VALUES.forEach(value => {
			const card = {
				id: `${value.face}_${suit}`,
				cardSuit: suit,
				cardFace: value.face,
				cardScore: value.score
			};
			DECK.push(card)
		})
	})

	return DECK
}

// const shuffleDeck = (deck) => {
// 	for (let i = deck.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[deck[i], deck[j]] = [deck[j], deck[i]];
// 	}
// 	console.log('here');
// 	return deck;
// };

// Generate the full deck
export const CARDS = generateDeck()