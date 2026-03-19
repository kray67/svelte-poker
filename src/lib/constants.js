/**
 * constants.js
 *
 * Static configuration for the poker game: suits, card values, player settings,
 * layout dimensions, and hand-score tier thresholds.
 */

/**
 * The four standard suits, each with a path to its icon image.
 * The image is applied via a CSS custom property on the card component.
 */
export const SUITS = [
	{ suit: 'SPADES',   img: '../src/assets/icons/card-suits/SPADES.png'   },
	{ suit: 'CLUBS',    img: '../src/assets/icons/card-suits/CLUBS.png'    },
	{ suit: 'DIAMONDS', img: '../src/assets/icons/card-suits/DIAMONDS.png' },
	{ suit: 'HEARTS',   img: '../src/assets/icons/card-suits/HEARTS.png'   }
]

/**
 * The 13 card ranks in ascending order.
 *
 * `score` is a multiple of 1000 (2000–14000) so that:
 *   - scores are easy to compare and read in debug output
 *   - adding a card score to a hand-tier base (e.g. HAND_SCORES.PAIR + 14000)
 *     never bleeds into the next tier (max card score is 14000, tier gap is 1,000,000)
 *
 * `text` / `plural` are used in hand description strings (e.g. "Pair of Aces").
 * `face` is the single character displayed on the card face.
 */
export const VALUES = [
	{ text: 'Deuce', plural: 'Deuces', face: '2',  score: 2000  },
	{ text: 'Three', plural: 'Threes', face: '3',  score: 3000  },
	{ text: 'Four',  plural: 'Fours',  face: '4',  score: 4000  },
	{ text: 'Five',  plural: 'Fives',  face: '5',  score: 5000  },
	{ text: 'Six',   plural: 'Sixes',  face: '6',  score: 6000  },
	{ text: 'Seven', plural: 'Sevens', face: '7',  score: 7000  },
	{ text: 'Eight', plural: 'Eights', face: '8',  score: 8000  },
	{ text: 'Nine',  plural: 'Nines',  face: '9',  score: 9000  },
	{ text: 'Ten',   plural: 'Tens',   face: '10', score: 10000 },
	{ text: 'Jack',  plural: 'Jacks',  face: 'J',  score: 11000 },
	{ text: 'Queen', plural: 'Queens', face: 'Q',  score: 12000 },
	{ text: 'King',  plural: 'Kings',  face: 'K',  score: 13000 },
	{ text: 'Ace',   plural: 'Aces',   face: 'A',  score: 14000 }
]

/** Total number of players dealt into each hand. */
export const NUMBER_OF_PLAYERS = 6

/** Number of hole cards dealt to each player. */
export const CARDS_PER_PLAYER = 2

/** Tailwind rem width class for a standard-size card. */
export const CARD_WIDTH = '6'

/** Tailwind rem width class for a small (player hand) card. */
export const CARD_SMALL_WIDTH = '4'

/**
 * Base score added to a hand's raw card score to place it in the correct tier.
 *
 * Each tier is separated by 1,000,000. Since the maximum card score is 14,000,
 * no hand can ever "overflow" into the next tier purely from card value.
 *
 * Ranking (highest to lowest):
 *   Straight Flush  8,000,000+
 *   Four of a Kind  7,000,000+
 *   Full House      6,000,000+
 *   Flush           5,000,000+
 *   Straight        4,000,000+
 *   Three of a Kind 3,000,000+
 *   Two Pair        2,000,000+
 *   One Pair        1,000,000+
 *   High Card       < 1,000,000
 */
export const HAND_SCORES = {
	PAIR:           1_000_000,
	TWO_PAIR:       2_000_000,
	TRIPS:          3_000_000,
	STRAIGHT:       4_000_000,
	FLUSH:          5_000_000,
	FULL_HOUSE:     6_000_000,
	QUADS:          7_000_000,
	STRAIGHT_FLUSH: 8_000_000
}
