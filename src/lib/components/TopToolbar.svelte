<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let connectedName: string | null = null;
</script>

<div class="h-10 border-b border-base-content/10 flex items-center px-2 gap-2 bg-base-200 select-none">
    <div class="flex items-center gap-2">
        <button class="btn btn-ghost btn-xs" title="Connect" on:click={() => dispatch('connect')}>
            Connect
        </button>
        <button class="btn btn-ghost btn-xs" title="Disconnect" on:click={() => dispatch('disconnect')}>Disconnect</button>
        <button class="btn btn-ghost btn-xs" title="New SQL" on:click={() => dispatch('newtab')}>New SQL</button>
    </div>

    <div class="divider divider-horizontal m-0 h-4 self-center opacity-30"></div>

    <div class="flex gap-2 items-center ml-auto">
        {#if connectedName}
            <div class="px-2 py-1 rounded bg-base-300 text-xs border border-base-content/10 flex items-center gap-2">
                <div class="w-2 h-2 rounded-full bg-success"></div>
                <span class="font-medium truncate max-w-[120px]">{connectedName}</span>
            </div>
        {:else}
            <div class="px-2 py-1 rounded bg-base-300/50 text-xs border border-base-content/5 opacity-60">No Connection</div>
        {/if}

        <button class="btn btn-success btn-xs" on:click={() => dispatch('run')}>Run</button>
        <button class="btn btn-ghost btn-xs" on:click={() => dispatch('save')}>Save</button>
        <button class="btn btn-ghost btn-xs" on:click={() => dispatch('toggleRight')}>Toggle Right</button>
    </div>
</div>
