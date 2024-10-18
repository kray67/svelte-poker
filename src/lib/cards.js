import { SUITS, VALUES } from "./constants"

export const generateDeck = () => {
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
// Generate the full deck
// export const CARDS = generateDeck()

// const shuffleDeck = (deck) => {
// 	for (let i = deck.length - 1; i > 0; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[deck[i], deck[j]] = [deck[j], deck[i]];
// 	}
// 	console.log('here');
// 	return deck;
// };

export const getRandomCard = (deck) => {
	// Return null if array is empty
	if (deck.length === 0) {
		return { selectedCard: null, newDeck: deck }
	}
	// Generate a random index
	const randomIndex = Math.floor(Math.random() * deck.length);
	// Get the random object from the array
	const selectedCard = deck[randomIndex]
	// Remove the selected card from the deck
  	const newDeck = [...deck.slice(0, randomIndex), ...deck.slice(randomIndex + 1)]

	return { selectedCard, newDeck }
}