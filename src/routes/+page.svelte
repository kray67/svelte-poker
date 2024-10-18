<script>
    import CardsIcon from '../assets/icons/svg/poker-cards.svelte'
    import ChipsIcon from '../assets/icons/svg/poker-chips.svelte'
    import { slide } from 'svelte/transition'
    import { generateDeck, getRandomCard } from '../lib/helperFns'
    import { NUMBER_OF_PLAYERS, CARDS_PER_PLAYER } from "../lib/constants"

    let CARD_DECK = generateDeck()
    let BOARD_CARDS = []
    let DISCARD_PILE = []
    let PLAYERS = []
    let DRAW_STAGE = 1

    const dealCards = () => {
        if (DRAW_STAGE === 1) {
            dealCardsToPlayers()
            DRAW_STAGE++
            return
        }

        if (DRAW_STAGE === 2) {
            burnCard()
            dealCardToBoard()
            dealCardToBoard()
            dealCardToBoard()
            DRAW_STAGE++
            return
        }

        if (DRAW_STAGE === 3 || DRAW_STAGE === 4) {
            burnCard()
            dealCardToBoard()
            DRAW_STAGE++
            return
        }

        if (DRAW_STAGE === 5) return
    }

    const dealCardToBoard = () => {
        let TEMP_CARDS = BOARD_CARDS
        if (BOARD_CARDS.length === 5) return
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        TEMP_CARDS.push(selectedCard)

        BOARD_CARDS = TEMP_CARDS
        CARD_DECK = newDeck
    }

    const dealCardsToPlayers = () => {
        if (NUMBER_OF_PLAYERS > 0 && PLAYERS.length === 0) buildPlayers()

        while (PLAYERS.some(player => player.playerHand.length < CARDS_PER_PLAYER)) {
            for (let i = 0; i < PLAYERS.length; i++) {
                if (PLAYERS[i].playerHand.length < CARDS_PER_PLAYER) {
                    let TEMP_CARDS = PLAYERS[i].playerHand
                    const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
                    TEMP_CARDS.push(selectedCard)
                    PLAYERS[i].playerHand = TEMP_CARDS
                    CARD_DECK = newDeck
                }
            }
        }
    }

    const burnCard = () => {
        let TEMP_CARDS = DISCARD_PILE
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        TEMP_CARDS.push(selectedCard)

        DISCARD_PILE = TEMP_CARDS
        CARD_DECK = newDeck
    }

    const buildPlayers = () => {
        const TEMP_PLAYERS = []
        for (let index = 1; index <= NUMBER_OF_PLAYERS; index++) {
            TEMP_PLAYERS.push(
                { playerID: `PLAYER_${index}`, playerHand: [] }
            )
        }
        PLAYERS = TEMP_PLAYERS
    }

    const resetAll = () => {
        DRAW_STAGE = 1
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
            <button
            on:click={dealCards}
            class="deal-btn max-h-8 max-w-16 flex items-center justify-center rounded-lg py-6 px-16 bg-white text-xl font-bold shadow-md">DEAL</button>
            <button
            on:click={resetAll}
            class="deal-btn max-h-8 max-w-16 flex items-center justify-center rounded-lg py-6 px-16 bg-white text-xl font-bold shadow-md">RESET</button>
        </div>

        <!-- BOARD CARDS -->
        <div class="board-cards h-36 flex flex-col items-center justify-center gap-3">
            <h1 class="text-xl font-bold">BOARD</h1>
            <div class="cards-wrapper flex items-center justify-center gap-3">
                {#each BOARD_CARDS as { id, cardSuit, cardFace, cardScore } (id)}
                    <div
                    transition:slide
                    id="{id}"
                    class="card {cardSuit} relative w-24 h-36 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-6xl"
                    style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                    data-score="{cardScore}">
                        {cardFace}
                    </div>
                {/each}
            </div>
        </div>

        <!-- PLAYERS -->
         <div class="players-wrapper w-full flex items-center justify-between gap-12">
            {#each PLAYERS as { playerID, playerHand } (playerID)}
                <!-- PLAYER CARDS -->
                <div class="board-cards flex flex-col items-center justify-center gap-3">
                    <h1 class="text-xl font-bold">{playerID}</h1>
                    <div class="cards-wrapper h-36 flex items-center justify-center gap-3">
                        {#each playerHand as { id, cardSuit, cardFace, cardScore } (id)}
                            <div
                            transition:slide
                            id="{id}"
                            class="card card-small {cardSuit} relative w-16 h-2/3 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-5xl"
                            style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                            data-score="{cardScore}">
                                {cardFace}
                            </div>
                        {/each}
                    </div>
                </div>
            {/each}
         </div>

        <!-- DISCARD CARDS -->
        <!-- <div class="discard-cards h-36 flex items-center justify-center gap-3">
            DISCARD
            {#each DISCARD_PILE as { id, cardSuit, cardFace, cardScore } (id)}
                <div
                transition:slide
                id="{id}"
                class="card card-small {cardSuit} relative w-16 h-2/3 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-5xl"
                style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                data-score="{cardScore}">
                    {cardFace}
                </div>
            {/each}
        </div> -->
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

<style>
    .card::before,
    .card::after {
        content: '';
        position: absolute;
        width: 1.75rem;
        height: 1.75rem;
        border-radius: 100%;
        background-image: var(--backgroundImage);
        background-size: 100%;
        background-position: center;
        background-repeat: no-repeat;
    }

    .card::before {
        top: 0.5rem;
        left: 0.5rem;
    }

    .card::after {
        bottom: 0.5rem;
        right: 0.5rem;
    }

    .card-small::before,
    .card-small::after {
        width: 1.15rem;
        height: 1.15rem;
    }

    .card-small::before {
        top: 0.25rem;
        left: 0.25rem;
    }

    .card-small::after {
        bottom: 0.25rem;
        right: 0.25rem;
    }
</style>