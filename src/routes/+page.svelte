<script>
    import CardsIcon from '../assets/icons/svg/poker-cards.svelte'
    import ChipsIcon from '../assets/icons/svg/poker-chips.svelte'
    import { CARDS } from '../lib/cards';

    // const cardDeck = cards;
    // const discardPile = [];
    // const board = [];
    // const hand1 = [];
    // const hand2 = [];
</script>

<div class="poker-table relative w-screen h-screen overflow-hidden flex flex-wrap gap-3 bg-green-700">
    {#each CARDS as { id, cardSuit, cardFace, cardScore }, i}
        <div
        id="{id}"
        class="card {cardSuit} relative w-24 h-36 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-6xl"
        style="--backgroundImage: url(../src/assets/icons/card-suits/{cardSuit}.png)"
        data-score="{cardScore}">
            {cardFace}
        </div>
    {/each}
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