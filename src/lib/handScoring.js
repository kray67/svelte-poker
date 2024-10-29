import { VALUES } from "./constants"
const VALUES_CONST = VALUES

export const getHandScores = (players, board) => {
	let highScore = 0;
	players.map((player) => {
		player.playerHandPlusBoard = player.playerHand
			// Join player's 2 cards with board's 5 cards
			.concat(board)
			// Sort cards from highest to lowest
			.sort((a, b) => b.cardScore - a.cardScore)
		const SCORED_PLAYER_HAND = evaluateHand(player.playerHandPlusBoard)

		player.playerScore = SCORED_PLAYER_HAND;
		if (player.playerScore.score > highScore) highScore = player.playerScore.score
	})

	// Get list of players with same initial score
	let WINNERS = players.filter((player) => player.playerScore.score === highScore)

	// Check if more than one 'winner' with just initial score
	WINNERS.forEach((player) => {
		// Get 'winners' kickers by
		let PLAYER_KICKERS = player.playerHandPlusBoard
			// Filtering out player's winning condition cards
			.filter((card) => !player.playerScore.cardsToKeep.includes(card))
		while (player.playerScore.cardsToKeep.length + PLAYER_KICKERS.length > 5) PLAYER_KICKERS.pop()
		player.playerScore.kickers = PLAYER_KICKERS
	})

	if (WINNERS.length > 1) {
		for (let i = 0; i < WINNERS[0].playerScore.kickers.length; i++) {
			let maxKickerValue = Math.max(...WINNERS.map((player) => player.playerScore.kickers[i].cardScore))
			// Filter to keep only players who have the maximum kicker at position i
			WINNERS = WINNERS.filter((player) => player.playerScore.kickers[i].cardScore === maxKickerValue)
			// If we're down to one winner, return that player immediately
			if (WINNERS.length === 1) {
				WINNERS[0].isWinner = true
				return players
			}
		}
	}

	WINNERS.forEach((player) => {
		player.isWinner = true
	})

	console.log(players)

	return players
}

const evaluateHand = (hand) => {
	const WITH_REPEATS = checkForRepeats(hand)
	const WITH_FLUSH = checkForFlush(hand)
	const WITH_STRAIGHT = checkForStraight(hand)

	// Flush
	if (WITH_FLUSH) {
		// Check if hand also has a straight
		if (WITH_STRAIGHT) {
			// Check if it is a Royal straight
			if (WITH_STRAIGHT.highCard.cardFace === 'A') {
				return {
					score: 8000000 + parseFloat(WITH_STRAIGHT.highCard.cardScore),
					text: `${WITH_FLUSH.suit} Royal Straight Flush`,
					cardsToKeep: WITH_FLUSH.cardsToKeep
				}
			}
			return {
				score: 8000000 + parseFloat(WITH_STRAIGHT.highCard.cardScore),
				text: `${WITH_STRAIGHT.highCard.cardText} High ${WITH_FLUSH.suit} Straight Flush`,
				cardsToKeep: WITH_FLUSH.cardsToKeep
			}
		}

		// Full House
		if (WITH_REPEATS && WITH_REPEATS.score >= 6000000) return WITH_REPEATS

		return WITH_FLUSH
	}
	// Four of a Kind
	// if (WITH_REPEATS && WITH_REPEATS.score >= 7000000) return WITH_REPEATS
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
			let FLUSH_CARDS = hand.filter((card) => card.cardSuit === suit)
			// If less than 5 cards, it's not possible to be a flush
			if (FLUSH_CARDS.length < 5) return
			// While more than 5 cards, remove the lowest card
			while (FLUSH_CARDS.length > 5) FLUSH_CARDS.pop()
			// Get high card
			let highCard = FLUSH_CARDS[0]

			return {
				score: 5000000 + parseFloat(highCard.cardScore),
				text: `${highCard.cardText} High ${suit} Flush`,
				cardsToKeep: FLUSH_CARDS,
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

	// If less than 5 cards, it's not possible to be a straight
	if (SORTED_CARDS.length < 5) return

	// Check for at least 5 consecutive numbers
	let STRAIGHT_CARDS = []

	for (let i = 0; i < SORTED_CARDS.length; i++) {
        // if array has five cards, exit loop
        if (STRAIGHT_CARDS.length === 5) break
        
        // if it is the first card, push to array
		if (STRAIGHT_CARDS.length === 0) {
            STRAIGHT_CARDS.push(SORTED_CARDS[i])
            continue
        }

        if (SORTED_CARDS[i].cardScore === SORTED_CARDS[i - 1].cardScore - 1000) {
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
			cardsToKeep: STRAIGHT_CARDS,
			highCard: highCard
		}
	}

	return null
}

const checkForRepeats = (hand) => {
	const CARD_SCORE_COUNT = {}
	hand.forEach((card) => {
		const SCORE = card.cardScore;
		if (CARD_SCORE_COUNT[SCORE]) {
			CARD_SCORE_COUNT[SCORE]++
		} else {
			CARD_SCORE_COUNT[SCORE] = 1
		}
	})

	let TRIPS = []
	let PAIRS = []

	// Check for Four of a Kind
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 4) {
			const CARD = hand.find((card) => card.cardScore === parseFloat(score))
			const CARDS = hand.filter((card) => card.cardScore === parseFloat(score))
			return {
				score: 7000000 + parseFloat(score),
				text: `Quad ${CARD.cardPlural}`,
				cardsToKeep: CARDS
			}
		}
	}

	// Check for Trips
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 3) {
			const CARD = VALUES_CONST.find((card) => card.score === parseFloat(score))
			TRIPS.push(CARD)
		}
	}

	// Check for Pairs
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 2) {
			const CARD = VALUES_CONST.find((card) => card.score === parseFloat(score))
			PAIRS.push(CARD)
		}
	}

	// Check for Trips
	if (TRIPS.length) {
		let highestTrip = { score: 0 }
		// Get highest trip
		for (let i = 0; i < TRIPS.length; i++) {
			if (TRIPS[i].score > highestTrip.score) highestTrip = TRIPS[i]
		}
		// If more than one trip, push lowest to PAIRS
		if (TRIPS.length > 1) {
			const LOWER_TRIPS = TRIPS.filter((trip) => trip.score != highestTrip.score)
			PAIRS.push(LOWER_TRIPS[0])
		}

		const CARD = hand.find((card) => card.cardScore === parseFloat(highestTrip.score))
		let CARDS = hand.filter((card) => card.cardScore === parseFloat(highestTrip.score))
		// check if hand also has a pair and return Full House
		if (PAIRS.length) {
			// check if more than one pair and get the highest
			let highPair = 0
			PAIRS.forEach((pair) => {
				if (pair.score > highPair) highPair = pair.score;
			})
	
			const PAIR_TO_KEEP = PAIRS.find((pair) => pair.score === highPair)
			hand
				.filter((card) => card.cardScore === PAIR_TO_KEEP.score)
				.map((card) => {
					CARDS.push(card)
				})
	
			return {
				score: 6000000 + CARD.cardScore * 11 + PAIR_TO_KEEP.score,
				text: `${CARD.cardPlural} Full of ${PAIR_TO_KEEP.plural}`,
				cardsToKeep: CARDS
			};
		}
		return {
			score: 3000000 + CARD.cardScore,
			text: `Trip ${CARD.cardPlural}`,
			cardsToKeep: CARDS
		}
	}

	// If there are more than one pair, return "Two Pairs"
	if (PAIRS.length > 1) {
		let highestPair = { score: 0 }
		let secondHighestPair = { score: 0 }
		for (let i = 0; i < PAIRS.length; i++) {
			if (PAIRS[i].score > highestPair.score) highestPair = PAIRS[i]
		}
		const NEW_PAIRS = PAIRS.filter((pair) => pair.score != highestPair.score)
		for (let i = 0; i < NEW_PAIRS.length; i++) {
			if (NEW_PAIRS[i].score > secondHighestPair.score) secondHighestPair = NEW_PAIRS[i]
		}

		const CARDS = []
		const FIRST_PAIR = hand.filter((card) => card.cardScore === highestPair.score)
		const SECOND_PAIR = hand.filter((card) => card.cardScore === secondHighestPair.score)
		FIRST_PAIR.map((card) => {
			CARDS.push(card)
		})
		SECOND_PAIR.map((card) => {
			CARDS.push(card)
		})

		return {
			score: 2000000 + highestPair.score * 11 + secondHighestPair.score,
			text: `Two Pairs: ${highestPair.plural} and ${secondHighestPair.plural}`,
			cardsToKeep: CARDS
		}
	}

	// If there is one pair, return "One Pair"
	if (PAIRS.length === 1) {
		const CARDS = hand.filter((card) => card.cardScore === PAIRS[0].score)
		return {
			score: 1000000 + PAIRS[0].score,
			text: `Pair of ${PAIRS[0].plural}`,
			cardsToKeep: CARDS
		}
	}

	// If none of the conditions match, return null
	return null;
}

const checkForHighCard = (hand) => {
	let HIGH_CARD = { cardScore: 0 }
    let score = 0
	let cardsSeen = 0
	hand.forEach(card => {
		if (cardsSeen === 5) return
        score += card.cardScore
		cardsSeen++
		if (card.cardScore > HIGH_CARD.cardScore) HIGH_CARD = card
	})
	return {
		score: score,
		text: `${HIGH_CARD.cardText} High Card`,
		cardsToKeep: [HIGH_CARD]
	}
}