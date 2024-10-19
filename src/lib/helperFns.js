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
				bgImg: suit.img
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

export const getWinningHand = (players, board) => {
	let CURRENT_HIGHSCORE = 0
	let WINNER_HAND = { player: null, hand: 0 }
	for (let i = 0; i < players.length; i++) {
		const CURRENT_PLAYER = players[i]
		const COMPLETE_PLAYER_HAND = CURRENT_PLAYER.playerHand.concat(board)
		const SCORED_HAND = evaluateHand(COMPLETE_PLAYER_HAND)
		if (SCORED_HAND.score > CURRENT_HIGHSCORE) {
			CURRENT_HIGHSCORE = SCORED_HAND.score
			WINNER_HAND = { player: CURRENT_PLAYER, score: SCORED_HAND }
		}
	}

	return WINNER_HAND
}

const evaluateHand = (hand) => {
	const WITH_REPEATS = checkForRepeats(hand)
	if (WITH_REPEATS) {
		return WITH_REPEATS
	}
	return { score: 0 }
}

const checkForRepeats = (hand) => {
	const CARD_FACE_COUNT = {}
	hand.forEach(card => {
		const FACE = card.cardFace
		if (CARD_FACE_COUNT[FACE]) {
			CARD_FACE_COUNT[FACE]++
		} else {
			CARD_FACE_COUNT[FACE] = 1
		}
	})

	let PAIRS = []

	// Check for Four of a Kind
	for (const face in CARD_FACE_COUNT) {
		if (CARD_FACE_COUNT[face] === 4) {
			return { score: 400, text: "Four of a Kind", value: face }
		}
	}

	// Check for Three of a Kind
	for (const face in CARD_FACE_COUNT) {
		if (CARD_FACE_COUNT[face] === 3) {
			return { score: 300, text: "Three of a Kind", value: face }
		}
	}

	// Check for Two Pairs and One Pair
	for (const face in CARD_FACE_COUNT) {
		if (CARD_FACE_COUNT[face] === 2) {
			PAIRS.push(face)
		}
	}

	// If there are two pairs, return "Two Pairs"
	if (PAIRS.length === 2) {
		return { score: 200, text: "Two Pairs", values: PAIRS }
	}

	// If there is one pair, return "One Pair"
	if (PAIRS.length === 1) {
		return { score: 100, text: "One Pair", value: PAIRS[0] }
	}

	// If none of the conditions match, return null
	return null
}