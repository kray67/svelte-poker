<script>
    /**
     * +page.svelte
     *
     * Pure rendering layer. All game state and logic lives in the `game` store.
     * This component only reads store values and calls store actions in response
     * to user interactions.
     */
    import { game, STAGES } from '../lib/game'
    import CardGroup from '../components/cardGroup.svelte'
    import CardsIcon from '../assets/icons/svg/poker-cards.svelte'
    import ChipsIcon from '../assets/icons/svg/poker-chips.svelte'

    // The label for the deal button is driven by the current stage.
    // A null label means the hand is over — hide the deal button.
    $: dealLabel  = STAGES[$game.stage]?.label
    $: canAdvance = dealLabel !== null
</script>

<div class="poker-table relative w-screen h-screen overflow-hidden flex items-center justify-center flex-wrap p-12 bg-green-700">
    <div class="table-top w-full h-full flex flex-col items-center justify-center flex-wrap gap-6 z-10">
        <div class="buttons flex items-center justify-center gap-3">
            <!-- Deal button is hidden once we reach the SHOWDOWN stage -->
            {#if canAdvance}
                <button
                on:click={() => game.advance()}
                class="deal-btn max-h-8 min-w-16 flex items-center justify-center rounded-lg py-6 px-8 bg-white text-xl font-bold shadow-md">{dealLabel}</button>
            {/if}

            <!-- Reset appears as soon as a hand is in progress -->
            {#if $game.stage !== 'IDLE'}
                <button
                on:click={() => game.reset()}
                class="deal-btn max-h-8 min-w-12 flex items-center justify-center rounded-lg py-6 px-8 bg-white text-xl font-bold shadow-md">RESET</button>
            {/if}
        </div>

        <!-- Community cards.
             delayOffset resets the animation to 0ms for turn/river by subtracting
             the number of cards already on the board before this street. -->
        <CardGroup
        numberOfCards={5}
        label="BOARD"
        cards={$game.board}
        smallCards={false}
        delayOffset={$game.boardStreetStart} />

        <!-- Player hands.
             baseDelay staggers each player's first card by 100ms (round-robin order).
             cardStep spaces each player's own cards by numPlayers×100ms so all first
             cards are dealt before any second cards, matching the original deal order. -->
        <div class="players-wrapper w-full flex items-center justify-between gap-12">
            {#each $game.players as { playerID, playerHand, playerScore, isWinner }, playerIndex (playerID)}
                <CardGroup
                numberOfCards={2}
                label={playerID}
                cards={playerHand}
                smallCards={true}
                score={playerScore}
                isWinner={isWinner}
                baseDelay={playerIndex * 100}
                cardStep={$game.players.length * 100} />
            {/each}
        </div>
    </div>

    <!-- Decorative table art — purely visual, shown behind the game content -->
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
