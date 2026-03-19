/**
 * game.js
 *
 * Svelte writable store that owns all game state and exposes two actions:
 *   game.advance() — execute the next stage in the deal sequence
 *   game.reset()   — return to a fresh hand
 *
 * All state transitions are pure functions: they receive the current state
 * and return a new state object. The store is the only place that holds or
 * mutates game state, keeping +page.svelte a thin rendering layer.
 */

import { writable } from 'svelte/store'
import { generateDeck, getRandomCard } from './cardGeneration'
import { getHandScores } from './handScoring'
import { NUMBER_OF_PLAYERS, CARDS_PER_PLAYER } from './constants'

// ---------------------------------------------------------------------------
// Stage definitions
//
// Each stage has a human-readable button label. A null label means the deal
// button should be hidden (the hand is over; only RESET is shown).
//
// Valid progression: IDLE → DEAL_PLAYERS → FLOP → TURN → RIVER → SHOWDOWN
// ---------------------------------------------------------------------------
export const STAGES = {
    IDLE:         { label: 'DEAL PLAYERS' },
    DEAL_PLAYERS: { label: 'DEAL FLOP'    },
    FLOP:         { label: 'DEAL TURN'    },
    TURN:         { label: 'DEAL RIVER'   },
    RIVER:        { label: 'SHOW RESULTS' },
    SHOWDOWN:     { label: null           }
}

const STAGE_ORDER = ['IDLE', 'DEAL_PLAYERS', 'FLOP', 'TURN', 'RIVER', 'SHOWDOWN']

/** Returns the next stage key, or stays at the current one if already at the end. */
const nextStage = (stage) => {
    const idx = STAGE_ORDER.indexOf(stage)
    return STAGE_ORDER[idx + 1] ?? stage
}

// ---------------------------------------------------------------------------
// Pure state builders
// ---------------------------------------------------------------------------

/** Returns a fresh array of empty player objects. */
const buildPlayers = () =>
    Array.from({ length: NUMBER_OF_PLAYERS }, (_, i) => ({
        playerID:    `PLAYER_${i + 1}`,
        playerHand:  [],
        playerScore: null,
        isWinner:    false
    }))

/** Returns the full initial game state. */
const initialState = () => ({
    stage:            'IDLE',
    deck:             generateDeck(),
    board:            [],
    discard:          [],
    players:          buildPlayers(),
    boardStreetStart: 0   // index of the first card dealt in the current street (for animation offset)
})

// ---------------------------------------------------------------------------
// Pure state transitions
// ---------------------------------------------------------------------------

/**
 * Deals hole cards to all players in round-robin order.
 * One card per player per pass until each has CARDS_PER_PLAYER cards.
 */
const dealPlayers = (state) => {
    let { deck } = state
    // Start with clean hands in case of a mid-hand reset
    let players = state.players.map(p => ({ ...p, playerHand: [] }))

    for (let cardNum = 0; cardNum < CARDS_PER_PLAYER; cardNum++) {
        players = players.map(player => {
            const { selectedCard, newDeck } = getRandomCard(deck)
            deck = newDeck
            return { ...player, playerHand: [...player.playerHand, selectedCard] }
        })
    }

    return { ...state, deck, players, stage: nextStage(state.stage) }
}

/**
 * Burns one card then deals `count` community cards to the board.
 * Burning is standard poker procedure before each board street.
 */
const dealBoard = (state, count) => {
    let { deck, board, discard } = state

    // Record where this street starts so the UI can zero-base animation delays
    const boardStreetStart = board.length

    // Burn
    const { selectedCard: burned, newDeck: deckAfterBurn } = getRandomCard(deck)
    deck    = deckAfterBurn
    discard = [...discard, burned]

    // Deal community cards
    const newCards = []
    for (let i = 0; i < count; i++) {
        const { selectedCard, newDeck } = getRandomCard(deck)
        deck = newDeck
        newCards.push(selectedCard)
    }

    return { ...state, deck, board: [...board, ...newCards], discard, boardStreetStart, stage: nextStage(state.stage) }
}

/**
 * Evaluates all player hands against the board and marks the winner(s).
 */
const showdown = (state) => {
    const players = getHandScores(state.players, state.board)
    return { ...state, players, stage: nextStage(state.stage) }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

/**
 * Creates and returns the game store.
 *
 * `advance()` drives the state machine forward by one stage.
 * Calling it in an invalid stage (e.g. SHOWDOWN) is a no-op.
 */
const createGame = () => {
    const { subscribe, set, update } = writable(initialState())

    return {
        subscribe,

        /**
         * Advance to the next deal stage.
         * The correct action is determined entirely by the current stage —
         * the caller doesn't need to know which stage it is.
         */
        advance() {
            update(state => {
                switch (state.stage) {
                    case 'IDLE':         return dealPlayers(state)
                    case 'DEAL_PLAYERS': return dealBoard(state, 3)  // flop
                    case 'FLOP':         return dealBoard(state, 1)  // turn
                    case 'TURN':         return dealBoard(state, 1)  // river
                    case 'RIVER':        return showdown(state)
                    default:             return state                 // SHOWDOWN — no-op
                }
            })
        },

        /** Reset to a completely fresh hand with a new shuffled deck. */
        reset() {
            set(initialState())
        }
    }
}

export const game = createGame()
