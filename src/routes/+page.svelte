<script>
    import CardsIcon from '../assets/icons/svg/poker-cards.svelte'
    import ChipsIcon from '../assets/icons/svg/poker-chips.svelte'
    import { generateDeck, getRandomCard } from '../lib/cards';

    let CARD_DECK = generateDeck()
    let BOARD_CARDS = []
    let DISCARD_PILE = []
    let HAND_1 = []
    let DRAW_STAGE = 1

    const dealCards = () => {
        if (DRAW_STAGE === 1) {
            dealCardToPlayer()
            dealCardToPlayer()
            burnCard()
            dealCardToBoard()
            dealCardToBoard()
            dealCardToBoard()
            DRAW_STAGE++
            return
        }

        if (DRAW_STAGE === 2 || DRAW_STAGE === 3) {
            burnCard()
            dealCardToBoard()
            DRAW_STAGE++
            return
        }

        if (DRAW_STAGE === 4) return
    }

    const dealCardToBoard = () => {
        let TEMP_BOARD = BOARD_CARDS
        if (BOARD_CARDS.length === 5) return
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        TEMP_BOARD.push(selectedCard)

        BOARD_CARDS = TEMP_BOARD
        CARD_DECK = newDeck
    }

    const dealCardToPlayer = () => {
        let TEMP_BOARD = HAND_1
        if (HAND_1.length === 2) return
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        TEMP_BOARD.push(selectedCard)

        HAND_1 = TEMP_BOARD
        CARD_DECK = newDeck
    }

    const burnCard = () => {
        let TEMP_BOARD = DISCARD_PILE
        const { selectedCard, newDeck } = getRandomCard(CARD_DECK)
        TEMP_BOARD.push(selectedCard)

        DISCARD_PILE = TEMP_BOARD
        CARD_DECK = newDeck
    }

    const resetAll = () => {
        DRAW_STAGE = 1
        CARD_DECK = generateDeck()
        BOARD_CARDS = []
        DISCARD_PILE = []
        HAND_1 = []
    }
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
        <div class="board-cards h-36 flex items-center justify-center gap-3">
            BOARD
            {#each BOARD_CARDS as { id, cardSuit, cardFace, cardScore } (id)}
                <div
                id="{id}"
                class="card {cardSuit} relative w-24 h-36 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-6xl"
                style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                data-score="{cardScore}">
                    {cardFace}
                </div>
            {/each}
        </div>
        <!-- PLAYER CARDS -->
        <div class="player-cards h-36 flex items-center justify-center gap-3">
            PLAYER
            {#each HAND_1 as { id, cardSuit, cardFace, cardScore } (id)}
                <div
                id="{id}"
                class="card {cardSuit} relative w-24 h-36 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-6xl"
                style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                data-score="{cardScore}">
                    {cardFace}
                </div>
            {/each}
        </div>
        <!-- DISCARD CARDS -->
        <div class="discard-cards h-36 flex items-center justify-center gap-3">
            DISCARD
            {#each DISCARD_PILE as { id, cardSuit, cardFace, cardScore } (id)}
                <div
                id="{id}"
                class="card {cardSuit} relative w-24 h-36 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-6xl"
                style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
                data-score="{cardScore}">
                    {cardFace}
                </div>
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
</style>