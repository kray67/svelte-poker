<script>
    import CardGroup from '../components/cardGroup.svelte'
    import CardsIcon from '../assets/icons/svg/poker-cards.svelte'
    import ChipsIcon from '../assets/icons/svg/poker-chips.svelte'
    import { generateDeck, getRandomCard } from '../lib/cardGeneration'
    import { getHandScores } from '../lib/handScoring'
    import { NUMBER_OF_PLAYERS, CARDS_PER_PLAYER } from "../lib/constants"

    let CARD_DECK = generateDeck()
    let BOARD_CARDS = []
    let DISCARD_PILE = []
    let PLAYERS = []
    let DRAW_STAGE = 1
    let DEAL_TEXT = 'DEAL PLAYERS'

    const dealCards = () => {
        if (DRAW_STAGE === 1) {
            dealCardsToPlayers()
            DRAW_STAGE++
            DEAL_TEXT = 'DEAL FLOP'
            return
        }
        if (DRAW_STAGE === 2) {
            burnCard()
            dealCardsToBoard(3)
            DRAW_STAGE++
            DEAL_TEXT = 'DEAL TURN'
            return
        }
        if (DRAW_STAGE === 3) {
            burnCard()
            dealCardsToBoard()
            DRAW_STAGE++
            DEAL_TEXT = 'DEAL RIVER'
            return
        }
        if (DRAW_STAGE === 4) {
            burnCard()
            dealCardsToBoard()
            DRAW_STAGE++
            DEAL_TEXT = 'SHOW RESULTS'
            return
        }
        if (DRAW_STAGE === 5) {
            const results = getHandScores(PLAYERS, BOARD_CARDS)
            console.log(results)
            PLAYERS = results
            DRAW_STAGE++
            return
        }
    }

    const dealCardsToBoard = (num) => {
        let CARD_DELAY = 0
        if (BOARD_CARDS.length === 5) return
        const CARDS_TO_DEAL = num || 1
        for (let i = 0; i < CARDS_TO_DEAL; i++) {
            const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
            selectedCard.delay = CARD_DELAY
            BOARD_CARDS.push(selectedCard)
            BOARD_CARDS = BOARD_CARDS
            CARD_DECK = newDeck
            CARD_DELAY += 100
        }
    }

    const dealCardsToPlayers = () => {
        let CARD_DELAY = 0
        if (NUMBER_OF_PLAYERS > 0 && PLAYERS.length === 0) buildPlayers()
        while (PLAYERS.some(player => player.playerHand.length < CARDS_PER_PLAYER)) {
            for (let i = 0; i < PLAYERS.length; i++) {
                if (PLAYERS[i].playerHand.length < CARDS_PER_PLAYER) {
                    const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
                    selectedCard.delay = CARD_DELAY
                    PLAYERS[i].playerHand.push(selectedCard)
                    PLAYERS[i].playerHand = PLAYERS[i].playerHand
                    CARD_DECK = newDeck
                    CARD_DELAY += 100
                }
            }
        }
    }

    const burnCard = () => {
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        DISCARD_PILE.push(selectedCard)
        DISCARD_PILE = DISCARD_PILE
        CARD_DECK = newDeck
    }

    const buildPlayers = () => {
        for (let index = 1; index <= NUMBER_OF_PLAYERS; index++) {
            PLAYERS.push(
                { playerID: `PLAYER_${index}`, playerHand: [], playerScore: null, isWinner: false }
            )
        }
        PLAYERS = PLAYERS
    }

    const resetAll = () => {
        DRAW_STAGE = 1
        DEAL_TEXT = 'DEAL PLAYERS'
        CARD_DECK = generateDeck()
        BOARD_CARDS = []
        DISCARD_PILE = []
        PLAYERS = []
        buildPlayers()
    }

    buildPlayers()
</script>

<div class="poker-table relative w-screen h-screen overflow-hidden flex items-center justify-center flex-wrap p-12 bg-green-700">
    <div class="table-top w-full h-full flex flex-col items-center justify-center flex-wrap gap-6 z-10">
        <div class="buttons flex items-center justify-center gap-3">
            {#if DRAW_STAGE !== 6}
                <button
                on:click={dealCards}
                class="deal-btn max-h-8 min-w-16 flex items-center justify-center rounded-lg py-6 px-8 bg-white text-xl font-bold shadow-md">{DEAL_TEXT}</button>
            {/if}

            {#if DRAW_STAGE !== 1}
                <button
                on:click={resetAll}
                class="deal-btn max-h-8 min-w-12 flex items-center justify-center rounded-lg py-6 px-8 bg-white text-xl font-bold shadow-md">RESET</button>
            {/if}
        </div>

        <!-- BOARD CARDS -->
        <CardGroup
        numberOfCards="{5}"
        label="BOARD"
        cards="{BOARD_CARDS}"
        smallCards="{false}" />

        <!-- PLAYERS -->
        <div class="players-wrapper w-full flex items-center justify-between gap-12">
            {#each PLAYERS as { playerID, playerHand, playerScore, isWinner } (playerID)}
                <CardGroup
                numberOfCards="{2}"
                label="{playerID}"
                cards="{playerHand}"
                smallCards="{true}"
                score="{playerScore}"
                isWinner="{isWinner}" />
            {/each}
        </div>
    </div>

    <div class="table-art absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 flex items-center justify-center gap-4 aspect-video border-8 rounded-full opacity-25 text-white text-8xl font-serif tracking-widest underline underline-offset-[16px]">
        <div class="icon-wrapper h-28">
            <CardsIcon/>
        </div>
        POKER
        <div class="icon-wrapper h-28">
            <ChipsIcon/>
        </div>
    </div>
</div>
