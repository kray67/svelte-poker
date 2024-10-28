<script>
    import { CARD_WIDTH, CARD_SMALL_WIDTH } from "../lib/constants"
    import Card from '../components/card.svelte'
    import { fly } from 'svelte/transition'

    export let numberOfCards
    export let label
    export let cards
    export let smallCards
    export let score
    export let isWinner

    const flyParams = {
        delay: 50,
        y: 500
    }

    const WRAPPER_WIDTH = `${numberOfCards * (smallCards ? CARD_SMALL_WIDTH : CARD_WIDTH) + ((numberOfCards - 1) * 0.75)}rem`
</script>

<div
class="card-group flex flex-col items-center justify-center gap-3"
style="width: {WRAPPER_WIDTH}">
    <h1 class="text-xl font-bold">{label}</h1>
    <div
    class="cards-wrapper { smallCards ? 'h-24' : 'h-36' } flex items-center justify-start gap-3"
    style="width: {WRAPPER_WIDTH}">
        {#each cards as { cardID, cardSuit, cardFace, cardScore, bgImg, delay } (cardID)}
            <Card
            cardID="{cardID}"
            cardFace="{cardFace}"
            cardSuit="{cardSuit}"
            cardScore="{cardScore}"
            bgImg="{bgImg}"
            isSmall="{smallCards}"
            delay="{delay}" />
        {/each}
    </div>
    <div class="score text-center text-balance h-12">{score && score.text ? score.text : ''}</div>
    {#if isWinner}
        <div in:fly={flyParams} class="winner-text absolute text-2xl font-bold text-[gold] -translate-y-32 rotate-3 bg-blue-900 py-2 px-4 rounded-lg shadow-xl border-white border-2">WINNER!</div>
    {/if}
</div>

<style>
    .winner-text {
        /* text-shadow: white 2px 0 0; */
        text-shadow: 0 0 10px red;
    }
</style>
