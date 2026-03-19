<script>
    import { fly } from 'svelte/transition'

    // ---------------------------------------------------------------------------
    // Props — all required, passed down from CardGroup
    // ---------------------------------------------------------------------------
    export let cardID     // Unique identifier string, e.g. "A_SPADES"
    export let cardFace   // Rank character displayed on the card, e.g. "A", "10", "K"
    export let cardSuit   // Suit string, also used as a CSS class, e.g. "SPADES"
    export let cardScore  // Numeric rank score (2000–14000); stored on data-score for debugging
    export let bgImg      // Path to the suit icon PNG, passed to the CSS custom property
    export let isSmall    // true → player hand (small), false → board (full-size)
    export let delay      // Animation delay in ms; staggered per card to create a dealing effect

    // Fly transition: cards animate up from below the viewport, staggered by `delay`
    const flyParams = {
        delay: delay,
        y: 500
    }
</script>

<!--
    The suit icon is rendered via CSS ::before (top-left) and ::after (bottom-right)
    pseudo-elements using a CSS custom property (--backgroundImage). This avoids
    needing an <img> tag inside the card and keeps the markup minimal.

    Tailwind classes switch between two size presets:
      - Full-size (board): w-24 h-36 text-6xl
      - Small (player hand): w-16 h-24 text-5xl (card-small)
-->
<div
in:fly={flyParams}
id="{cardID}"
class="card {cardSuit} {isSmall ? 'card-small w-16 h-24 text-5xl' : 'w-24 h-36 text-6xl'} relative flex justify-center items-center pb-[5px] bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold"
style="--backgroundImage: url({bgImg})"
data-score="{cardScore}">
    {cardFace}
</div>

<style>
    /*
     * Suit icons are placed at the top-left (::before) and bottom-right (::after)
     * corners of every card using the --backgroundImage CSS custom property
     * injected from the Svelte style attribute above.
     */
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

    /* Smaller icon positions for player hand cards */
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
