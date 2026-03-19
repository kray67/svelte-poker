/**
 * handScoring.test.js
 *
 * Unit tests for the hand evaluation engine.
 * Run with:  npm test          (watch mode)
 *            npm run test:run  (single run / CI)
 *
 * Each test builds a 7-card hand (2 hole cards + 5 board cards) and asserts
 * on the returned score tier, description text, and — where relevant — that
 * one hand correctly beats another.
 */

import { describe, it, expect } from 'vitest'
import { evaluateHand, getHandScores } from './handScoring'
import { VALUES, HAND_SCORES } from './constants'

// ---------------------------------------------------------------------------
// Helper: build a minimal card object from face + suit
// ---------------------------------------------------------------------------

const valueMap = Object.fromEntries(VALUES.map(v => [v.face, v]))

/**
 * @param {string} face  — e.g. 'A', 'K', '10', '2'
 * @param {string} suit  — e.g. 'SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'
 */
const c = (face, suit) => {
    const v = valueMap[face]
    if (!v) throw new Error(`Unknown face: ${face}`)
    return {
        cardID:     `${face}_${suit}`,
        cardSuit:   suit,
        cardFace:   face,
        cardScore:  v.score,
        cardText:   v.text,
        cardPlural: v.plural,
        bgImg:      '',
        delay:      0
    }
}

/** Sort descending by cardScore (mirrors what +page.svelte does before calling evaluateHand) */
const hand = (...cards) => [...cards].sort((a, b) => b.cardScore - a.cardScore)

// ---------------------------------------------------------------------------
// Hand type detection
// ---------------------------------------------------------------------------

describe('Royal Straight Flush', () => {
    it('detects a royal flush', () => {
        const h = hand(c('A','S'), c('K','S'), c('Q','S'), c('J','S'), c('10','S'), c('2','H'), c('3','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.STRAIGHT_FLUSH)
        expect(result.text).toMatch(/Royal Straight Flush/)
    })
})

describe('Straight Flush', () => {
    it('detects a non-royal straight flush', () => {
        const h = hand(c('9','H'), c('8','H'), c('7','H'), c('6','H'), c('5','H'), c('A','S'), c('K','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.STRAIGHT_FLUSH)
        expect(result.text).toMatch(/Straight Flush/)
        expect(result.text).not.toMatch(/Royal/)
    })

    it('straight flush beats four of a kind', () => {
        const sf   = evaluateHand(hand(c('9','H'), c('8','H'), c('7','H'), c('6','H'), c('5','H'), c('A','S'), c('A','D')))
        const quads = evaluateHand(hand(c('A','S'), c('A','H'), c('A','D'), c('A','C'), c('K','S'), c('Q','D'), c('J','H')))
        expect(sf.score).toBeGreaterThan(quads.score)
    })

    // Regression: mixed-suit broadway straight + same-suit flush must NOT be a straight flush
    it('does NOT falsely detect a straight flush when straight is mixed-suit', () => {
        // Spade flush: A♠ K♠ Q♠ 3♠ 2♠ — no spade straight
        // Mixed straight: A♠ K♠ Q♠ J♦ 10♦
        const h = hand(c('A','S'), c('K','S'), c('Q','S'), c('J','D'), c('10','D'), c('3','S'), c('2','S'))
        const result = evaluateHand(h)
        // Should be a flush (5 spades), not a straight flush
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.FLUSH)
        expect(result.score).toBeLessThan(HAND_SCORES.STRAIGHT_FLUSH)
        expect(result.text).toMatch(/Flush/)
        expect(result.text).not.toMatch(/Straight Flush/)
    })
})

describe('Four of a Kind', () => {
    it('detects quads', () => {
        const h = hand(c('A','S'), c('A','H'), c('A','D'), c('A','C'), c('K','S'), c('Q','D'), c('J','H'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.QUADS)
        expect(result.score).toBeLessThan(HAND_SCORES.STRAIGHT_FLUSH)
        expect(result.text).toMatch(/Quad/)
    })

    // Regression: quads must beat a flush (this was the commented-out bug)
    it('four of a kind beats a flush', () => {
        const quads = evaluateHand(hand(c('A','S'), c('A','H'), c('A','D'), c('A','C'), c('K','S'), c('Q','S'), c('J','S')))
        const flush = evaluateHand(hand(c('2','S'), c('5','S'), c('7','S'), c('9','S'), c('J','S'), c('3','H'), c('4','D')))
        expect(quads.score).toBeGreaterThan(flush.score)
    })
})

describe('Full House', () => {
    it('detects a full house', () => {
        const h = hand(c('K','S'), c('K','H'), c('K','D'), c('Q','C'), c('Q','S'), c('2','H'), c('3','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.FULL_HOUSE)
        expect(result.score).toBeLessThan(HAND_SCORES.QUADS)
        expect(result.text).toMatch(/Full/)
    })

    it('higher trips wins the full house comparison', () => {
        const kingsUp = evaluateHand(hand(c('K','S'), c('K','H'), c('K','D'), c('2','C'), c('2','S'), c('3','H'), c('4','D')))
        const queensUp = evaluateHand(hand(c('Q','S'), c('Q','H'), c('Q','D'), c('A','C'), c('A','S'), c('3','H'), c('4','D')))
        expect(kingsUp.score).toBeGreaterThan(queensUp.score)
    })
})

describe('Flush', () => {
    it('detects a flush', () => {
        const h = hand(c('A','H'), c('9','H'), c('7','H'), c('5','H'), c('3','H'), c('K','S'), c('Q','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.FLUSH)
        expect(result.score).toBeLessThan(HAND_SCORES.FULL_HOUSE)
        expect(result.text).toMatch(/Flush/)
    })
})

describe('Straight', () => {
    it('detects a straight', () => {
        const h = hand(c('9','S'), c('8','H'), c('7','D'), c('6','C'), c('5','S'), c('A','H'), c('K','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.STRAIGHT)
        expect(result.score).toBeLessThan(HAND_SCORES.FLUSH)
        expect(result.text).toMatch(/Straight/)
    })

    // Regression: A-2-3-4-5 wheel was previously scored as high card
    it('detects the wheel (A-2-3-4-5) as a five-high straight', () => {
        const h = hand(c('A','S'), c('2','H'), c('3','D'), c('4','C'), c('5','S'), c('K','H'), c('Q','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.STRAIGHT)
        expect(result.score).toBeLessThan(HAND_SCORES.FLUSH)
        expect(result.text).toMatch(/Wheel|Five High Straight/)
    })

    it('wheel (5-high) loses to a six-high straight', () => {
        const wheel   = evaluateHand(hand(c('A','S'), c('2','H'), c('3','D'), c('4','C'), c('5','S'), c('K','H'), c('Q','D')))
        const sixHigh = evaluateHand(hand(c('2','S'), c('3','H'), c('4','D'), c('5','C'), c('6','S'), c('K','H'), c('Q','D')))
        expect(sixHigh.score).toBeGreaterThan(wheel.score)
    })

    it('does not treat Ace-high broadway as a wheel', () => {
        const h = hand(c('A','S'), c('K','H'), c('Q','D'), c('J','C'), c('10','S'), c('2','H'), c('3','D'))
        const result = evaluateHand(h)
        expect(result.text).toMatch(/Straight/)
        expect(result.text).not.toMatch(/Wheel/)
        expect(result.highCard.cardFace).toBe('A')
    })
})

describe('Three of a Kind', () => {
    it('detects trips', () => {
        const h = hand(c('7','S'), c('7','H'), c('7','D'), c('K','C'), c('Q','S'), c('J','H'), c('2','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.TRIPS)
        expect(result.score).toBeLessThan(HAND_SCORES.STRAIGHT)
        expect(result.text).toMatch(/Trip/)
    })
})

describe('Two Pair', () => {
    it('detects two pair', () => {
        const h = hand(c('A','S'), c('A','H'), c('K','D'), c('K','C'), c('Q','S'), c('J','H'), c('2','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.TWO_PAIR)
        expect(result.score).toBeLessThan(HAND_SCORES.TRIPS)
        expect(result.text).toMatch(/Two Pairs/)
    })

    it('picks the best two pairs when three pairs are present', () => {
        // A-A, K-K, Q-Q — best two pair should be Aces and Kings
        const h = hand(c('A','S'), c('A','H'), c('K','D'), c('K','C'), c('Q','S'), c('Q','H'), c('2','D'))
        const result = evaluateHand(h)
        expect(result.text).toMatch(/Aces/)
        expect(result.text).toMatch(/Kings/)
        expect(result.text).not.toMatch(/Queens/)
    })
})

describe('One Pair', () => {
    it('detects a pair', () => {
        const h = hand(c('A','S'), c('A','H'), c('K','D'), c('Q','C'), c('J','S'), c('9','H'), c('2','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeGreaterThanOrEqual(HAND_SCORES.PAIR)
        expect(result.score).toBeLessThan(HAND_SCORES.TWO_PAIR)
        expect(result.text).toMatch(/Pair/)
    })
})

describe('High Card', () => {
    it('detects a high card hand', () => {
        const h = hand(c('A','S'), c('K','H'), c('Q','D'), c('J','C'), c('9','S'), c('7','H'), c('2','D'))
        const result = evaluateHand(h)
        expect(result.score).toBeLessThan(HAND_SCORES.PAIR)
        expect(result.text).toMatch(/High Card/)
    })

    it('ace-high beats king-high', () => {
        const aceHigh  = evaluateHand(hand(c('A','S'), c('K','H'), c('Q','D'), c('J','C'), c('9','S'), c('7','H'), c('2','D')))
        const kingHigh = evaluateHand(hand(c('K','S'), c('Q','H'), c('J','D'), c('10','C'), c('8','S'), c('6','H'), c('2','D')))
        expect(aceHigh.score).toBeGreaterThan(kingHigh.score)
    })

    it('kicker separates same high card — A-K beats A-Q', () => {
        const ak = evaluateHand(hand(c('A','S'), c('K','H'), c('J','D'), c('9','C'), c('7','S'), c('5','H'), c('3','D')))
        const aq = evaluateHand(hand(c('A','H'), c('Q','D'), c('J','C'), c('9','S'), c('7','H'), c('5','D'), c('3','S')))
        expect(ak.score).toBeGreaterThan(aq.score)
    })
})

// ---------------------------------------------------------------------------
// Full pipeline: getHandScores winner determination and kicker tie-breaking
// ---------------------------------------------------------------------------

describe('getHandScores — winner determination', () => {
    it('marks the player with the better hand as winner', () => {
        const players = [
            { playerID: 'P1', playerHand: [c('A','S'), c('A','H')], playerScore: null, isWinner: false },
            { playerID: 'P2', playerHand: [c('2','D'), c('3','C')], playerScore: null, isWinner: false }
        ]
        const board = [c('A','D'), c('K','S'), c('Q','H'), c('J','C'), c('9','D')]
        const result = getHandScores(players, board)
        expect(result.find(p => p.playerID === 'P1').isWinner).toBe(true)
        expect(result.find(p => p.playerID === 'P2').isWinner).toBe(false)
    })

    it('resolves a tie by kicker', () => {
        // Both players have a pair of Aces on the board; P1 has K kicker, P2 has Q
        const board = [c('A','S'), c('A','H'), c('J','D'), c('9','C'), c('2','S')]
        const players = [
            { playerID: 'P1', playerHand: [c('K','D'), c('5','H')], playerScore: null, isWinner: false },
            { playerID: 'P2', playerHand: [c('Q','D'), c('5','C')], playerScore: null, isWinner: false }
        ]
        const result = getHandScores(players, board)
        expect(result.find(p => p.playerID === 'P1').isWinner).toBe(true)
        expect(result.find(p => p.playerID === 'P2').isWinner).toBe(false)
    })

    it('marks both players as winners on a genuine split pot', () => {
        // Both players play the board (their hole cards are irrelevant)
        const board = [c('A','S'), c('K','H'), c('Q','D'), c('J','C'), c('10','S')]
        const players = [
            { playerID: 'P1', playerHand: [c('2','H'), c('3','D')], playerScore: null, isWinner: false },
            { playerID: 'P2', playerHand: [c('4','H'), c('5','D')], playerScore: null, isWinner: false }
        ]
        const result = getHandScores(players, board)
        // Both play the broadway straight on the board
        expect(result.find(p => p.playerID === 'P1').isWinner).toBe(true)
        expect(result.find(p => p.playerID === 'P2').isWinner).toBe(true)
    })

    it('returns early with empty array for invalid input', () => {
        expect(getHandScores(null, [])).toEqual([])
        expect(getHandScores([], null)).toEqual([])
    })
})
