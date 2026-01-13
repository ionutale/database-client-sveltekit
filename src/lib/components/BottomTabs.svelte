<script lang="ts">
    import ResultTable from '$lib/components/ResultTable.svelte';
    import { queryResult } from '$lib/stores';

    let activeTab: 'results' | 'messages' | 'output' = $state('results');

    function clear() {
        queryResult.set({ columns: [], rows: [], message: undefined, error: undefined, loading: false });
    }
</script>

<div class="h-full flex flex-col bg-base-100">
    <!-- Tabs Header -->
    <div class="h-8 bg-base-200 border-b border-base-300 flex items-center px-1 gap-0.5 select-none">
        <button 
            class="px-4 py-1.5 text-xs rounded transition-all
                   {activeTab === 'results' 
                       ? 'bg-base-100 text-primary font-bold shadow-sm' 
                       : 'text-base-content/40 hover:text-base-content hover:bg-base-300/50'}"
            onclick={() => activeTab = 'results'}
        >
            Results
        </button>
        <button 
            class="px-4 py-1.5 text-xs rounded transition-all
                   {activeTab === 'messages' 
                       ? 'bg-base-100 text-primary font-bold shadow-sm' 
                       : 'text-base-content/40 hover:text-base-content hover:bg-base-300/50'}"
            onclick={() => activeTab = 'messages'}
        >
            Messages
        </button>
        <button 
            class="px-4 py-1.5 text-xs rounded transition-all
                   {activeTab === 'output' 
                       ? 'bg-base-100 text-primary font-bold shadow-sm' 
                       : 'text-base-content/40 hover:text-base-content hover:bg-base-300/50'}"
            onclick={() => activeTab = 'output'}
        >
            Output
        </button>
        
        <div class="flex-1"></div>
        
        <div class="text-[10px] text-base-content/50 px-2">
            {$queryResult.rows?.length ?? 0} row(s)
        </div>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-auto relative">
        {#if activeTab === 'results'}
            <ResultTable />
        {:else if activeTab === 'messages'}
            <div class="p-3 text-sm font-mono">
                {#if $queryResult.error}
                    <div class="text-error whitespace-pre-wrap">{$queryResult.error}</div>
                {:else if $queryResult.message}
                    <div class="text-success whitespace-pre-wrap">{$queryResult.message}</div>
                {:else}
                    <div class="text-base-content/30 italic">No messages</div>
                {/if}
            </div>
        {:else}
            <div class="p-3 text-sm font-mono text-base-content/50 italic">
                No output
            </div>
        {/if}
    </div>
</div>
