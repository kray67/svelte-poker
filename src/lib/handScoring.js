import { VALUES } from "./constants"
const VALUES_CONST = VALUES

export const getHandScores = (players, board) => {
	let highScore = 0
	players.map(player => {
		const COMPLETE_PLAYER_HAND = player.playerHand.concat(board);
		const SCORED_PLAYER_HAND = evaluateHand(COMPLETE_PLAYER_HAND);

		// Sort COMPLETE_PLAYER_HAND
		let SORTED_COMPLETE_PLAYER_HAND = [...new Set(COMPLETE_PLAYER_HAND)].sort((a, b) => b.cardScore - a.cardScore)

		let PLAYER_SORTED_FINAL_HAND_LENGTH = 0
		let PLAYER_CARDS_SUMMED_VALUE = 0
		SORTED_COMPLETE_PLAYER_HAND.forEach((card) => {
			if (PLAYER_SORTED_FINAL_HAND_LENGTH === 5) return;
			PLAYER_CARDS_SUMMED_VALUE += card.cardScore;
			PLAYER_SORTED_FINAL_HAND_LENGTH++;
		});

		player.playerScore = SCORED_PLAYER_HAND
		player.playerScore.score += PLAYER_CARDS_SUMMED_VALUE
		if (player.playerScore.score > highScore) highScore = player.playerScore.score
	})

	const winners = players.filter((player) => player.playerScore.score === highScore)
	winners.forEach(player => {
		player.isWinner = true
	})

	return players
}

const evaluateHand = (hand) => {
	const WITH_REPEATS = checkForRepeats(hand)
	const WITH_FLUSH = checkForFlush(hand)
	const WITH_STRAIGHT = checkForStraight(hand)
	// Four of a kind
	if (WITH_REPEATS && WITH_REPEATS.score >= 600) return WITH_REPEATS
	// Flush
	if (WITH_FLUSH) {
		// Check if hand also has a straight
		if (WITH_STRAIGHT) {
			// Check if it is a Royal straight
			if (WITH_STRAIGHT.highCard.cardFace === 'A') {
				return {
					score: (8000000 + parseFloat(WITH_STRAIGHT.highCard.cardScore)),
					text: `${WITH_FLUSH.suit} Royal Straight Flush`,
					value: WITH_FLUSH.value
				}
			}
			return { 
				score: (8000000 + parseFloat(WITH_STRAIGHT.highCard.cardScore)), 
				text: `${WITH_STRAIGHT.highCard.cardText} High ${WITH_FLUSH.suit} Straight Flush`, 
				value: WITH_FLUSH.value 
			}
		} 
		return WITH_FLUSH
	}
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
			let highCard = { cardScore: 0 }
			FLUSH_CARDS.forEach(card => {
				if (card.cardScore > highCard.cardScore) highCard = card
			})
			
			return {
				score: (5000000 + parseFloat(highCard.cardScore)),
				text: `${highCard.cardText} High ${suit} Flush`,
				value: FLUSH_CARDS,
				suit: suit
			}
		}
	}

	return null
}

const checkForStraight = (hand) => {
	// Sort the array and remove duplicates
	let SORTED_CARDS = [...new Set(hand)]
        .sort((a, b) => b.cardScore - a.cardScore)
        .filter((card, index, self) => {
            return index === self.findIndex(c => c.cardScore === card.cardScore)  // Remove duplicates
        })


	// Check for at least 5 consecutive numbers
	let STRAIGHT_CARDS = []

	for (let i = 0; i < SORTED_CARDS.length - 1; i++) {
        // if array has five cards, exit loop
        if (STRAIGHT_CARDS.length === 5) break
        
        // if it is the first card, push to array
		if (STRAIGHT_CARDS.length === 0) {
            STRAIGHT_CARDS.push(SORTED_CARDS[i])
            continue
        }

        if (SORTED_CARDS[i].cardScore === SORTED_CARDS[i - 1].cardScore - 1) {
            // if it is the card immediately after the last, push to array
            STRAIGHT_CARDS.push(SORTED_CARDS[i])
        } else {
            // if not, empty array and push to array
            STRAIGHT_CARDS = []
            STRAIGHT_CARDS.push(SORTED_CARDS[i])
        }
	}

	if (STRAIGHT_CARDS.length >= 5) {
		// Get high card
		let highCard = { cardScore: 0 }
		STRAIGHT_CARDS.forEach(card => {
			if (card.cardScore > highCard.cardScore) highCard = card
		})
		return {
			score: (4000000 + parseFloat(highCard.cardScore)),
			text: `${highCard.cardText} High Straight`,
			value: STRAIGHT_CARDS,
			highCard: highCard
		}
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
			return {
				score: (7000000 + parseFloat(score)),
				text: `Four ${CARD.cardPlural}`,
				value: CARD
			}
		}
	}

	
	// Check for Two Pairs and One Pair
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 2) {
            const CARD = VALUES_CONST.find(card => card.score === parseFloat(score))
			PAIRS.push(CARD)
		}
	}
	
	// Check for Three of a Kind
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 3) {
			const CARD = hand.find(card => card.cardScore === parseFloat(score))
			// check if hand also has a pair and return Full House
			if (PAIRS.length) {
				return {
					score: (6000000 + CARD.cardScore + PAIRS[0].score),
					text: `${CARD.cardPlural} Full of ${PAIRS[0].plural}`,
					value: [CARD, PAIRS[0]]
				}
			}
			return {
				score: (3000000 + CARD.cardScore),
				text: `Trip ${CARD.cardPlural}`,
				value: CARD
			}
		}
	}
	
	// If there are two pairs, return "Two Pairs"
	if (PAIRS.length > 1) {
		let highestPair = { score: 0 }
        let secondHighestPair = { score: 0 }
		for (let i = 0; i < PAIRS.length; i++) {
			if (PAIRS[i].score > highestPair.score) highestPair = PAIRS[i]
		}
        const NEW_PAIRS = PAIRS.filter(pair => pair.score != highestPair.score)
        for (let i = 0; i < NEW_PAIRS.length; i++) {
			if (NEW_PAIRS[i].score > secondHighestPair.score) secondHighestPair = NEW_PAIRS[i]
		}
		return {
			score: (2000000 + highestPair.score + secondHighestPair.score),
			text: `Two Pairs: ${highestPair.plural} and ${secondHighestPair.plural}`,
			values: PAIRS
		}
	}

	// If there is one pair, return "One Pair"
	if (PAIRS.length === 1) {
		const CARD = hand.find(card => card.cardScore === PAIRS[0].score)
		return {
			score: (1000000 + PAIRS[0].score),
			text: `Pair of ${PAIRS[0].plural}`,
			value: CARD
		}
	}

	// If none of the conditions match, return null
	return null
}

const checkForHighCard = (hand) => {
	let highCard = { cardScore: 0 }
    let score = 0
	hand.forEach(card => {
        score += card.cardScore
		if (card.cardScore > highCard.cardScore) highCard = card
	})
	return {
		score: score,
		text: `${highCard.cardText} High Card`,
		value: highCard
	}
}