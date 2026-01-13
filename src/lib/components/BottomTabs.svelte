<script lang="ts">
    import ResultTable from '$lib/components/ResultTable.svelte';
    import { queryResult } from '$lib/stores';
    import { get } from 'svelte/store';

    let active: 'results' | 'messages' = 'results';

    function clear() {
        queryResult.set({ columns: [], rows: [], message: undefined, error: undefined, loading: false });
    }
</script>

<div class="h-full flex flex-col bg-base-100">
    <div class="h-8 border-b border-base-content/10 flex items-center px-2 gap-2 bg-base-200 select-none">
        <div class="tabs tabs-boxed">
            <button class="tab tab-xs" class:tab-active={active === 'results'} on:click={() => active = 'results'}>Results</button>
            <button class="tab tab-xs" class:tab-active={active === 'messages'} on:click={() => active = 'messages'}>Messages</button>
        </div>
        <div class="ml-auto text-xs text-base-content/60">{$queryResult.rows?.length ?? 0} rows</div>
    </div>

    <div class="flex-1 overflow-auto relative">
        {#if active === 'results'}
            <ResultTable />
        {:else}
            <div class="p-3">
                {#if $queryResult.error}
                    <div class="alert alert-error">
                        <div class="flex flex-col">
                            <span class="font-bold">Error</span>
                            <pre class="whitespace-pre-wrap">{$queryResult.error}</pre>
                        </div>
                    </div>
                {:else if $queryResult.message}
                    <div class="alert alert-info">
                        <div class="flex flex-col">
                            <span class="font-bold">Message</span>
                            <pre class="whitespace-pre-wrap">{$queryResult.message}</pre>
                        </div>
                    </div>
                {:else}
                    <div class="text-sm text-base-content/30">No messages</div>
                {/if}
                <div class="mt-3">
                    <button class="btn btn-ghost btn-xs" on:click={clear}>Clear</button>
                </div>
            </div>
        {/if}
    </div>
</div>
