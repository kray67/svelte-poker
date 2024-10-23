import { SUITS, VALUES } from "./constants"

export const generateDeck = () => {
	const DECK = []
	// Loop through each suit and value to create the cards
	SUITS.forEach(suit => {
		VALUES.forEach(value => {
			const card = {
				cardID: `${value.face}_${suit.suit}`,
				cardSuit: suit.suit,
				cardFace: value.face,
				cardScore: value.score,
				cardText: value.text,
				cardPlural: value.plural,
				bgImg: suit.img,
				delay: 0
			}
			DECK.push(card)
		})
	})
	return DECK
}

export const getRandomCard = (deck) => {
	// Return null if array is empty
	if (deck.length === 0) {
		return { selectedCard: null, newDeck: deck }
	}
	// Generate a random index
	const randomIndex = Math.floor(Math.random() * deck.length)
	// Get the random object from the array
	const selectedCard = deck[randomIndex]
	// Remove the selected card from the deck
  	const newDeck = [...deck.slice(0, randomIndex), ...deck.slice(randomIndex + 1)]

	return { selectedCard, newDeck }
}