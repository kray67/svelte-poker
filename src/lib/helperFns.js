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
	const WITH_FLUSH = checkForFlush(hand)
	const WITH_STRAIGHT = checkForStraight(hand)
	// Four of a kind
	if (WITH_REPEATS && WITH_REPEATS.score >= 600) return WITH_REPEATS
	// Flush
	if (WITH_FLUSH) return WITH_FLUSH
	// Straight
	if (WITH_STRAIGHT) return WITH_STRAIGHT
	// Three of a Kind / Two Pairs / One Pair
	if (WITH_REPEATS) return WITH_REPEATS
	// High Card
	return checkForHighCard(hand)
}

const checkForFlush = (hand) => {
	const CARD_SUIT_COUNT = {}
	hand.forEach(card => {
		const SUIT = card.cardSuit
		if (CARD_SUIT_COUNT[SUIT]) {
			CARD_SUIT_COUNT[SUIT]++
		} else {
			CARD_SUIT_COUNT[SUIT] = 1
		}
	})

	// Check for a Flush
	for (const suit in CARD_SUIT_COUNT) {
		if (CARD_SUIT_COUNT[suit] > 4) {
			// Filter flush cards
			const FLUSH_CARDS = hand.filter((card) => card.cardSuit === suit)
			// Get high card
			let highCard = 0
			FLUSH_CARDS.forEach(card => {
				if (card.cardScore > highCard) highCard = card.cardScore
			})
			
			return { score: (500 + parseFloat(highCard)), text: `${suit} Flush`, value: FLUSH_CARDS }
		}
	}

	return null
}

const checkForStraight = (hand) => {
	// Sort the array and remove duplicates
	const SORTED_CARDS = [...new Set(hand)].sort((a, b) => a.cardScore - b.cardScore)

	// Check for at least 5 consecutive numbers
	let STRAIGHT_CARDS = []

	for (let i = 0; i < SORTED_CARDS.length - 1; i++) {
		if (STRAIGHT_CARDS.length === 0) {
			// if it is the first card, push to array
			STRAIGHT_CARDS.push(SORTED_CARDS[i])
		} else {
			if (SORTED_CARDS[i].cardScore === SORTED_CARDS[i - 1].cardScore + 1) {
				// if it is the card immediately after the last, push to array
				STRAIGHT_CARDS.push(SORTED_CARDS[i])
			} else {
				// if not, empty array and push to array
				STRAIGHT_CARDS = []
				STRAIGHT_CARDS.push(SORTED_CARDS[i])
			}
		}
	}

	if (STRAIGHT_CARDS >= 5) {
		// Get high card
		let highCard = { cardScore: 0 }
		STRAIGHT_CARDS.forEach(card => {
			if (card.cardScore > highCard) highCard = card
		})
		return { score: (400 + parseFloat(highCard.cardScore)), text: `${highCard.cardFace} High Straight`, value: STRAIGHT_CARDS }
	}

	return null
}

const checkForRepeats = (hand) => {
	const CARD_SCORE_COUNT = {}
	hand.forEach(card => {
		const SCORE = card.cardScore
		if (CARD_SCORE_COUNT[SCORE]) {
			CARD_SCORE_COUNT[SCORE]++
		} else {
			CARD_SCORE_COUNT[SCORE] = 1
		}
	})

	let PAIRS = []

	// Check for Four of a Kind
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 4) {
			const CARD = hand.find(card => card.cardScore === parseFloat(score))
			return { score: (700 + parseFloat(score)), text: "Four of a Kind", value: CARD }
		}
	}

	// Check for Three of a Kind
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 3) {
			const CARD = hand.find(card => card.cardScore === parseFloat(score))
			return { score: (300 + parseFloat(score)), text: "Three of a Kind", value: CARD }
		}
	}

	// Check for Two Pairs and One Pair
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 2) {
			PAIRS.push(score)
		}
	}

	// If there are two pairs, return "Two Pairs"
	if (PAIRS.length === 2) {
		let highestScore = 0
		for (let i = 0; i < PAIRS.length; i++) {
			if (parseFloat(PAIRS[i]) > highestScore) highestScore = parseFloat(PAIRS[i])
		}
		return { score: (200 + highestScore), text: "Two Pairs", values: PAIRS }
	}

	// If there is one pair, return "One Pair"
	if (PAIRS.length === 1) {
		const CARD = hand.find(card => card.cardScore === parseFloat(PAIRS[0]))
		return { score: (100 + parseFloat(PAIRS[0])), text: "One Pair", value: CARD }
	}

	// If none of the conditions match, return null
	return null
}

const checkForHighCard = (hand) => {
	let highCard = 0
	hand.forEach(card => {
		if (card.cardScore > highCard) highCard = card.cardScore
	})
	return { score: parseFloat(highCard), text: "High Card", value: highCard }
}