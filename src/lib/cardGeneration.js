/**
 * cardGeneration.js
 *
 * Utilities for creating and drawing from a standard 52-card deck.
 * The deck is treated as an immutable value: drawing a card returns the
 * selected card and a new deck with that card removed, rather than mutating
 * the original array. This makes it safe to use in Svelte's reactive store.
 */

import { SUITS, VALUES } from "./constants"

/**
 * Generates a fresh, unshuffled 52-card deck.
 *
 * Each card object shape:
 * {
 *   cardID:     string  — unique identifier, e.g. "A_SPADES"
 *   cardSuit:   string  — e.g. "SPADES"
 *   cardFace:   string  — the rank character, e.g. "A", "10", "K"
 *   cardScore:  number  — numeric rank × 1000 (2000–14000), used for comparisons
 *   cardText:   string  — full rank name, e.g. "Ace"
 *   cardPlural: string  — plural rank name, e.g. "Aces" (used in hand text)
 *   bgImg:      string  — path to the suit icon image
 *   delay:      number  — animation delay in ms (set to 0 here, assigned at deal time)
 * }
 *
 * @returns {Object[]} Array of 52 card objects.
 */
export const generateDeck = () => {
	const DECK = []
	SUITS.forEach(suit => {
		VALUES.forEach(value => {
			DECK.push({
				cardID:     `${value.face}_${suit.suit}`,
				cardSuit:   suit.suit,
				cardFace:   value.face,
				cardScore:  value.score,
				cardText:   value.text,
				cardPlural: value.plural,
				bgImg:      suit.img,
				delay:      0
			})
		})
	})
	return DECK
}

/**
 * Draws a random card from the deck without replacement.
 *
 * Returns both the selected card and a new deck array (immutable pattern —
 * the original `deck` argument is never modified).
 *
 * @param   {Object[]} deck - The current deck to draw from.
 * @returns {{ selectedCard: Object|null, newDeck: Object[] }}
 *          `selectedCard` is null if the deck was empty.
 */
export const getRandomCard = (deck) => {
	if (deck.length === 0) {
		return { selectedCard: null, newDeck: deck }
	}

	const randomIndex = Math.floor(Math.random() * deck.length)
	const selectedCard = deck[randomIndex]

	// Build a new deck array that excludes the drawn card
	const newDeck = [...deck.slice(0, randomIndex), ...deck.slice(randomIndex + 1)]

	return { selectedCard, newDeck }
}
