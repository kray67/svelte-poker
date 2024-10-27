<script>
    import { fly } from 'svelte/transition'

    export let cardID
    export let cardFace
    export let cardSuit
    export let cardScore
    export let bgImg
    export let isSmall
    export let delay

    const flyParams = {
        delay: delay,
        y: 500
    }
</script>

<div
in:fly={flyParams}
id="{cardID}"
class="card {cardSuit} {isSmall ? 'card-small w-16 h-24 text-5xl' : 'w-24 h-36 text-6xl'} relative flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold"
style="--backgroundImage: url({bgImg})"
data-score="{cardScore}">
    {cardFace}
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
