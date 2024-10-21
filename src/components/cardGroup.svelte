<script>
    import { CARD_WIDTH, CARD_SMALL_WIDTH } from "../lib/constants"
    import Card from '../components/card.svelte'

    export let numberOfCards
    export let label
    export let cards
    export let smallCards

    const WRAPPER_WIDTH = `${numberOfCards * (smallCards ? CARD_SMALL_WIDTH : CARD_WIDTH) + ((numberOfCards - 1) * 0.75)}rem`
</script>

<div
class="card-group flex flex-col items-center justify-center gap-3">
    <h1 class="text-xl font-bold">{label}</h1>
    <div
    class="cards-wrapper h-36 flex items-center justify-start gap-3"
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
</div>

<style></style>
