/**
 * handScoring.js
 *
 * Core Texas Hold'em hand evaluation engine.
 *
 * Flow for each showdown:
 *   1. Each player's 2 hole cards are combined with the 5 board cards (7 total).
 *   2. evaluateHand() finds the best 5-card combination from those 7.
 *   3. All players are ranked by their hand score.
 *   4. Ties are broken card-by-card using kickers (cards not part of the
 *      primary hand combination, e.g. the unpaired cards when comparing pairs).
 *
 * Scoring tiers (see HAND_SCORES in constants.js):
 *   High Card       < 1,000,000   (positional base-15 encoding)
 *   One Pair        >= 1,000,000
 *   Two Pair        >= 2,000,000
 *   Three of a Kind >= 3,000,000
 *   Straight        >= 4,000,000
 *   Flush           >= 5,000,000
 *   Full House      >= 6,000,000
 *   Four of a Kind  >= 7,000,000
 *   Straight Flush  >= 8,000,000
 *
 * Within a tier, the winning card score(s) are added to the base so that
 * e.g. a pair of Aces (1,000,000 + 14,000 = 1,014,000) always beats a pair
 * of Kings (1,000,000 + 13,000 = 1,013,000).
 */

import { VALUES, HAND_SCORES } from "./constants"
const VALUES_CONST = VALUES

/**
 * Evaluates every player's best 7-card hand, determines the winner(s),
 * and marks them with `isWinner = true`.
 *
 * Tie-breaking: if multiple players share the highest hand score, their
 * kicker cards are compared one-by-one from highest to lowest until a
 * winner is found. Remaining tied players share the pot (both marked as winners).
 *
 * @param   {Object[]} players - Array of player objects with `playerHand` arrays.
 * @param   {Object[]} board   - Array of 5 community card objects.
 * @returns {Object[]}           The same `players` array with `isWinner` set.
 */
export const getHandScores = (players, board) => {
	if (!players?.length || !board?.length) return players ?? []

	let highScore = 0

	// Score every player and track the highest score seen
	players.map((player) => {
		// Combine hole cards with board and sort descending by rank
		player.playerHandPlusBoard = player.playerHand
			.concat(board)
			.sort((a, b) => b.cardScore - a.cardScore)

		player.playerScore = evaluateHand(player.playerHandPlusBoard)

		if (player.playerScore.score > highScore) highScore = player.playerScore.score
	})

	// All players whose score matches the high score are initial co-winners
	let WINNERS = players.filter((player) => player.playerScore.score === highScore)

	// Calculate kickers for each tied player.
	// Kickers are the non-scoring cards that fill out the best 5-card hand,
	// used to break ties between hands of the same type and rank.
	WINNERS.forEach((player) => {
		// Cards not already used in the primary combination (identified by suit + face)
		let PLAYER_KICKERS = player.playerHandPlusBoard
			.filter((card) => !player.playerScore.cardsToKeep.some(
				kept => kept.cardSuit === card.cardSuit && kept.cardFace === card.cardFace
			))

		// Trim so that cardsToKeep + kickers = exactly 5 cards total
		while (player.playerScore.cardsToKeep.length + PLAYER_KICKERS.length > 5) PLAYER_KICKERS.pop()

		player.playerScore.kickers = PLAYER_KICKERS
	})

	// Break ties by comparing kickers positionally (highest first)
	if (WINNERS.length > 1) {
		for (let i = 0; i < WINNERS[0].playerScore.kickers.length; i++) {
			// If players have unequal kicker counts, we can't compare further — it's a split pot
			if (WINNERS.some(p => !p.playerScore.kickers[i])) break

			const maxKickerValue = Math.max(...WINNERS.map(p => p.playerScore.kickers[i].cardScore))
			WINNERS = WINNERS.filter(p => p.playerScore.kickers[i].cardScore === maxKickerValue)

			// Single winner found after this kicker — return immediately
			if (WINNERS.length === 1) {
				WINNERS[0].isWinner = true
				return players
			}
		}
	}

	// Either a single winner, or a genuine split pot (all remaining winners share it)
	WINNERS.forEach((player) => {
		player.isWinner = true
	})

	return players
}

/**
 * Finds the best 5-card poker hand from a 7-card sorted hand.
 *
 * Checks hand types in descending priority order. The first match wins.
 * Straight flush detection uses both checkForFlush and checkForStraight
 * independently, then combines them at this level.
 *
 * @param   {Object[]} hand - 7 card objects, sorted descending by cardScore.
 * @returns {Object}          Score result: { score, text, cardsToKeep, [highCard] }
 */
export const evaluateHand = (hand) => {
	if (!hand || hand.length < 5) return checkForHighCard(hand ?? [])

	const WITH_REPEATS = checkForRepeats(hand)
	const WITH_FLUSH   = checkForFlush(hand)

	// --- Flush present ---
	if (WITH_FLUSH) {
		// Check for a straight using ONLY the flush-suit cards. Running
		// checkForStraight on all 7 cards would produce a false positive
		// when a mixed-suit straight coexists with a same-suit flush
		// (e.g. A♠K♠Q♠J♦10♦ + 2♠3♠ → flush in spades, broadway in mixed suits).
		const allFlushCards     = hand.filter(c => c.cardSuit === WITH_FLUSH.suit)
		const WITH_STRAIGHT_FLUSH = checkForStraight(allFlushCards)

		if (WITH_STRAIGHT_FLUSH) {
			if (WITH_STRAIGHT_FLUSH.highCard.cardFace === 'A') {
				return {
					score: HAND_SCORES.STRAIGHT_FLUSH + parseFloat(WITH_STRAIGHT_FLUSH.highCard.cardScore),
					text: `${WITH_FLUSH.suit} Royal Straight Flush`,
					cardsToKeep: WITH_FLUSH.cardsToKeep
				}
			}
			return {
				score: HAND_SCORES.STRAIGHT_FLUSH + parseFloat(WITH_STRAIGHT_FLUSH.highCard.cardScore),
				text: `${WITH_STRAIGHT_FLUSH.highCard.cardText} High ${WITH_FLUSH.suit} Straight Flush`,
				cardsToKeep: WITH_FLUSH.cardsToKeep
			}
		}

		// Full house outranks a flush — check before returning the flush
		if (WITH_REPEATS && WITH_REPEATS.score >= HAND_SCORES.FULL_HOUSE) return WITH_REPEATS

		return WITH_FLUSH
	}

	// --- No flush ---

	// Only compute straight when there's no flush (avoids the false-positive
	// risk and saves work — straight flush was already checked above)
	const WITH_STRAIGHT = checkForStraight(hand)

	// Four of a kind outranks a straight
	if (WITH_REPEATS && WITH_REPEATS.score >= HAND_SCORES.QUADS) return WITH_REPEATS
	if (WITH_STRAIGHT) return WITH_STRAIGHT
	if (WITH_REPEATS)  return WITH_REPEATS

	return checkForHighCard(hand)
}

// ---------------------------------------------------------------------------
// Hand checkers — each returns a result object or null if not applicable.
// Result shape: { score: number, text: string, cardsToKeep: Object[], [highCard] }
// ---------------------------------------------------------------------------

/**
 * Detects a flush (5+ cards of the same suit).
 * Returns the top 5 flush cards (hand is already sorted descending).
 *
 * @param   {Object[]} hand
 * @returns {Object|null}
 */
const checkForFlush = (hand) => {
	// Count how many cards of each suit are in the hand
	const CARD_SUIT_COUNT = {}
	hand.forEach(card => {
		const SUIT = card.cardSuit
		CARD_SUIT_COUNT[SUIT] = (CARD_SUIT_COUNT[SUIT] ?? 0) + 1
	})

	for (const suit in CARD_SUIT_COUNT) {
		if (CARD_SUIT_COUNT[suit] > 4) {
			// Filter to only that suit; hand is sorted so highest cards come first
			let FLUSH_CARDS = hand.filter((card) => card.cardSuit === suit)
			if (FLUSH_CARDS.length < 5) return null  // shouldn't happen, but guard anyway

			// Keep only the best 5 flush cards
			while (FLUSH_CARDS.length > 5) FLUSH_CARDS.pop()

			const highCard = FLUSH_CARDS[0]
			return {
				score: HAND_SCORES.FLUSH + parseFloat(highCard.cardScore),
				text: `${highCard.cardText} High ${suit} Flush`,
				cardsToKeep: FLUSH_CARDS,
				suit: suit
			}
		}
	}

	return null
}

/**
 * Detects a straight (5 consecutive ranks).
 * Also handles the wheel (A-2-3-4-5), where the Ace plays as a low card
 * and the hand is scored as a 5-high straight (the lowest possible straight).
 *
 * Duplicate ranks are removed before checking — only the highest card of
 * each rank is kept, since two 7s cannot contribute to two different straights.
 *
 * @param   {Object[]} hand
 * @returns {Object|null}
 */
const checkForStraight = (hand) => {
	// Deduplicate by rank (cardScore) and sort descending.
	// Note: [...hand] prevents mutating the original sorted array.
	let SORTED_CARDS = [...hand]
		.sort((a, b) => b.cardScore - a.cardScore)
		.filter((card, index, self) => {
			return index === self.findIndex(c => c.cardScore === card.cardScore)
		})

	if (SORTED_CARDS.length < 5) return null

	// Greedy scan: build the longest consecutive run from the top.
	// When the sequence breaks, restart from the current card.
	let STRAIGHT_CARDS = []

	for (let i = 0; i < SORTED_CARDS.length; i++) {
		if (STRAIGHT_CARDS.length === 5) break

		if (STRAIGHT_CARDS.length === 0) {
			STRAIGHT_CARDS.push(SORTED_CARDS[i])
			continue
		}

		// Cards are 1000 apart in score (e.g. King=13000, Queen=12000)
		if (SORTED_CARDS[i].cardScore === SORTED_CARDS[i - 1].cardScore - 1000) {
			STRAIGHT_CARDS.push(SORTED_CARDS[i])
		} else {
			// Gap in the sequence — reset and start a new run from here
			STRAIGHT_CARDS = [SORTED_CARDS[i]]
		}
	}

	// Wheel detection: A-2-3-4-5
	// The Ace acts as a 1 (below 2). This is the only case where Ace plays low.
	// Scored as 5-high (STRAIGHT + 5000), which is lower than any other straight.
	if (STRAIGHT_CARDS.length < 5) {
		const ACE = hand.find(c => c.cardScore === 14000)
		if (ACE) {
			const NEEDED = [5000, 4000, 3000, 2000]
			const WHEEL_CARDS = NEEDED.map(s => hand.find(c => c.cardScore === s))
			if (WHEEL_CARDS.every(Boolean)) {
				return {
					score: HAND_SCORES.STRAIGHT + 5000,
					text: 'Five High Straight (Wheel)',
					cardsToKeep: [...WHEEL_CARDS, ACE],
					highCard: hand.find(c => c.cardScore === 5000)  // 5 is the effective high card
				}
			}
		}
		return null
	}

	const highCard = STRAIGHT_CARDS.reduce((max, c) => c.cardScore > max.cardScore ? c : max, { cardScore: 0 })
	return {
		score: HAND_SCORES.STRAIGHT + parseFloat(highCard.cardScore),
		text: `${highCard.cardText} High Straight`,
		cardsToKeep: STRAIGHT_CARDS,
		highCard: highCard
	}
}

/**
 * Detects four-of-a-kind, full house, three-of-a-kind, two pair, or one pair.
 * Returns the highest-ranking combination found, or null if none.
 *
 * When both trips and pairs exist (e.g. two sets of three on the board),
 * the lower trip is demoted to a pair for the full-house calculation.
 *
 * @param   {Object[]} hand
 * @returns {Object|null}
 */
const checkForRepeats = (hand) => {
	// Count how many times each rank appears
	const CARD_SCORE_COUNT = {}
	hand.forEach((card) => {
		const SCORE = card.cardScore
		CARD_SCORE_COUNT[SCORE] = (CARD_SCORE_COUNT[SCORE] ?? 0) + 1
	})

	let TRIPS = []  // ranks that appear exactly 3 times
	let PAIRS = []  // ranks that appear exactly 2 times

	// --- Four of a Kind ---
	// Check first since it's the highest repeat hand
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 4) {
			const CARD  = hand.find  ((card) => card.cardScore === parseFloat(score))
			const CARDS = hand.filter((card) => card.cardScore === parseFloat(score))
			return {
				score: HAND_SCORES.QUADS + parseFloat(score),
				text: `Quad ${CARD.cardPlural}`,
				cardsToKeep: CARDS
			}
		}
	}

	// Collect all trips and pairs present in the hand
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 3) {
			TRIPS.push(VALUES_CONST.find((card) => card.score === parseFloat(score)))
		}
	}
	for (const score in CARD_SCORE_COUNT) {
		if (CARD_SCORE_COUNT[score] === 2) {
			PAIRS.push(VALUES_CONST.find((card) => card.score === parseFloat(score)))
		}
	}

	// --- Three of a Kind / Full House ---
	if (TRIPS.length) {
		// Find the highest-ranked trip
		const highestTrip = TRIPS.reduce((max, t) => t.score > max.score ? t : max, { score: 0 })

		// If two sets of trips exist (rare with 7 cards), treat the lower as a pair
		if (TRIPS.length > 1) {
			const LOWER_TRIPS = TRIPS.filter((trip) => trip.score !== highestTrip.score)
			PAIRS.push(LOWER_TRIPS[0])
		}

		const CARD  = hand.find  ((card) => card.cardScore === parseFloat(highestTrip.score))
		let   CARDS = hand.filter((card) => card.cardScore === parseFloat(highestTrip.score))

		// Full house: trips + the highest available pair
		if (PAIRS.length) {
			const highPairScore = Math.max(...PAIRS.map(p => p.score))
			const PAIR_TO_KEEP  = PAIRS.find((pair) => pair.score === highPairScore)

			// Add the pair cards to the trip cards to form the 5-card full house
			hand
				.filter((card) => card.cardScore === PAIR_TO_KEEP.score)
				.map((card) => { CARDS.push(card) })

			// Score encodes both the trip rank and the pair rank.
			// Multiplying the trip by 11 ensures it always outweighs the pair
			// (max pair score = 14000; 14000 * 11 = 154000 >> 14000).
			return {
				score: HAND_SCORES.FULL_HOUSE + CARD.cardScore * 15 + PAIR_TO_KEEP.score,
				text: `${CARD.cardPlural} Full of ${PAIR_TO_KEEP.plural}`,
				cardsToKeep: CARDS
			}
		}

		return {
			score: HAND_SCORES.TRIPS + CARD.cardScore,
			text: `Trip ${CARD.cardPlural}`,
			cardsToKeep: CARDS
		}
	}

	// --- Two Pair ---
	if (PAIRS.length > 1) {
		// Pick the two highest pairs (there could be 3 pairs in 7 cards)
		const highestPair = PAIRS.reduce((max, p) => p.score > max.score ? p : max, { score: 0 })
		const remaining   = PAIRS.filter((pair) => pair.score !== highestPair.score)
		const secondHighestPair = remaining.reduce((max, p) => p.score > max.score ? p : max, { score: 0 })

		const CARDS = [
			...hand.filter((card) => card.cardScore === highestPair.score),
			...hand.filter((card) => card.cardScore === secondHighestPair.score)
		]

		// Same multiplier trick as full house: top pair × 11 always outweighs second pair
		return {
			score: HAND_SCORES.TWO_PAIR + highestPair.score * 15 + secondHighestPair.score,
			text: `Two Pairs: ${highestPair.plural} and ${secondHighestPair.plural}`,
			cardsToKeep: CARDS
		}
	}

	// --- One Pair ---
	if (PAIRS.length === 1) {
		const CARDS = hand.filter((card) => card.cardScore === PAIRS[0].score)
		return {
			score: HAND_SCORES.PAIR + PAIRS[0].score,
			text: `Pair of ${PAIRS[0].plural}`,
			cardsToKeep: CARDS
		}
	}

	return null
}

/**
 * Scores a high-card hand (no pairs, straights, or flushes).
 *
 * Uses base-15 positional encoding across the top 5 cards so that every
 * possible 5-card combination produces a unique score below 1,000,000.
 *
 *   score = rank1×15⁴ + rank2×15³ + rank3×15² + rank4×15 + rank5
 *
 * where rank = cardScore / 1000 (i.e. 2–14).
 *
 * Base 15 is chosen because there are 13 possible ranks (2–14).
 * Position 0 (highest card) carries a weight of 15⁴ = 50,625, which is
 * always greater than the maximum contribution of all lower positions combined
 * (14×15³ + 14×15² + 14×15 + 14 = 47,684), ensuring the highest card always
 * dominates, then the second card, and so on.
 *
 * Max possible score: 14×50625 + 13×3375 + 12×225 + 11×15 + 10 = 755,499 < 1,000,000 ✓
 *
 * All 5 top cards are stored in `cardsToKeep` so the score alone resolves
 * ties without needing the kicker system.
 *
 * @param   {Object[]} hand - Cards sorted descending by cardScore.
 * @returns {Object}
 */
const checkForHighCard = (hand) => {
	const TOP_FIVE  = hand.slice(0, 5)
	const HIGH_CARD = TOP_FIVE[0] ?? { cardScore: 0, cardText: '?' }

	const score = TOP_FIVE.reduce((acc, card, i) => {
		return acc + (card.cardScore / 1000) * Math.pow(15, 4 - i)
	}, 0)

	return {
		score,
		text: `${HIGH_CARD.cardText} High Card`,
		cardsToKeep: TOP_FIVE
	}
}
