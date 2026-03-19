<script>
    /**
     * cardGroup.svelte
     *
     * Renders a labelled group of cards (a player's hand or the board),
     * along with optional hand description text and a winner badge.
     */

    import { CARD_WIDTH, CARD_SMALL_WIDTH } from "../lib/constants"
    import Card from '../components/card.svelte'
    import { fly } from 'svelte/transition'

    // ---------------------------------------------------------------------------
    // Props
    // ---------------------------------------------------------------------------
    export let numberOfCards        // Expected maximum number of cards (sizes the container)
    export let label                // Display name, e.g. "BOARD" or "PLAYER_1"
    export let cards                // Array of card objects currently in this group
    export let smallCards           // true → player hand size, false → board size
    export let score    = null      // HandResult from evaluateHand(), or null pre-showdown
    export let isWinner = null      // true → show the "WINNER!" badge

    // --- Animation timing props ---
    // baseDelay:   starting delay in ms for the first card (use for round-robin player offsets)
    // cardStep:    ms added per card index within this group
    // delayOffset: subtract this many card-widths from the index before multiplying
    //              (use for board to zero-base turn/river: delayOffset = cards before this street)
    export let baseDelay   = 0
    export let cardStep    = 100
    export let delayOffset = 0

    // Fly transition for the winner badge — animates in from below
    const flyParams = { delay: 50, y: 500 }

    /*
     * Fixed wrapper width so all columns stay the same size regardless of
     * how many cards have been dealt so far.
     *
     * Formula: (cards × card width) + (gaps between cards × 0.75rem)
     * 0.75rem matches the Tailwind `gap-3` class used on the inner wrapper.
     */
    const WRAPPER_WIDTH = `${numberOfCards * (smallCards ? CARD_SMALL_WIDTH : CARD_WIDTH) + ((numberOfCards - 1) * 0.75)}rem`
</script>

<div
class="card-group flex flex-col items-center justify-center gap-3"
style="width: {WRAPPER_WIDTH}">

    <h1 class="text-xl font-bold">{label}</h1>

    <!-- Card row — empty slots are invisible until cards are dealt -->
    <div
    class="cards-wrapper { smallCards ? 'h-24' : 'h-36' } flex items-center justify-start gap-3"
    style="width: {WRAPPER_WIDTH}">
        <!--
            Animation delay is derived from each card's index rather than stored
            on the card data object. This keeps presentation concerns in the
            component layer and out of the data model.

            Each card flies in 100ms after the previous one, creating a
            staggered dealing effect regardless of how cards are batched.
        -->
        {#each cards as card, i (card.cardID)}
            <Card
            cardID={card.cardID}
            cardFace={card.cardFace}
            cardSuit={card.cardSuit}
            cardScore={card.cardScore}
            bgImg={card.bgImg}
            isSmall={smallCards}
            delay={baseDelay + Math.max(0, i - delayOffset) * cardStep} />
        {/each}
    </div>

    <!-- Hand description, e.g. "Pair of Aces". Empty string before showdown. -->
    <div class="score text-center text-balance h-12">{score?.text ?? ''}</div>

    <!-- Winner badge — only rendered for the winning player(s) after showdown -->
    {#if isWinner}
        <div in:fly={flyParams} class="winner-text absolute text-2xl font-bold text-[gold] -translate-y-32 rotate-3 bg-blue-900 py-2 px-4 rounded-lg shadow-xl border-white border-2">WINNER!</div>
    {/if}
</div>

<style>
    .winner-text {
        text-shadow: 0 0 10px red;
    }
</style>
