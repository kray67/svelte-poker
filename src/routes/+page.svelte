<script>
    import { cards } from '../lib/cards'
</script>

<div class="cards-container w-full h-auto overflow-hidden flex flex-wrap gap-3 p-12 bg-green-700">
    {#each cards as { id, cardSuit, cardValue }, i}
        <div id="{id}" class="card {cardSuit} relative w-32 h-48 flex justify-center items-center bg-slate-50 rounded-md border-black border-2 shadow-xl font-sans font-bold text-7xl">
            {cardValue}
        </div>
    {/each}
</div>

<style>
    .card::before,
    .card::after {
        content: '';
        position: absolute;
        width: 2.25rem;
        height: 2.25rem;
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

    .SPADES {
        --backgroundImage: url(../assets/icons/card-suits/SPADES.png);
    }

    .CLUBS {
        --backgroundImage: url(../assets/icons/card-suits/CLUBS.png);
    }
    
    .HEARTS {
        color: red;
        --backgroundImage: url(../assets/icons/card-suits/HEARTS.png);
    }

    .DIAMONDS {
        color: red;
        --backgroundImage: url(../assets/icons/card-suits/DIAMONDS.png);
    }
</style>