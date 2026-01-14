<script lang="ts">
    import { queryHistory, type HistoryItem, activeConnection, connections } from '$lib/stores';

    let { open = $bindable(false), onSelect } = $props();

    function formatDate(timestamp: number) {
        return new Date(timestamp).toLocaleString();
    }

    function getConnectionName(connId: string) {
        return $connections.find(c => c.id === connId)?.name || 'Unknown';
    }

    function handleSelect(query: string) {
        onSelect(query);
        open = false;
    }
    
    function clearHistory() {
        if(confirm('Clear all history?')) {
            queryHistory.set([]);
        }
    }
</script>

{#if open}
<div class="modal modal-open">
    <div class="modal-box w-11/12 max-w-5xl h-[80vh] flex flex-col p-4">
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-lg">Query History</h3>
             <button class="btn btn-sm btn-ghost text-error" onclick={clearHistory}>Clear All</button>
        </div>
        
        <div class="overflow-y-auto flex-1">
            {#if $queryHistory.length === 0}
                <div class="text-center p-10 opacity-50">No history yet</div>
            {:else}
                <table class="table table-sm table-pin-rows">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Connection</th>
                            <th>Query</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $queryHistory.slice().reverse() as item}
                            <tr class="hover">
                                <td class="whitespace-nowrap font-mono text-xs text-base-content/60">
                                    {formatDate(item.timestamp)}
                                </td>
                                <td>
                                    {#if item.status === 'success'}
                                        <span class="badge badge-success badge-xs">OK</span>
                                    {:else}
                                        <span class="badge badge-error badge-xs">ERR</span>
                                    {/if}
                                </td>
                                <td class="text-xs">{getConnectionName(item.connectionId)}</td>
                                <td>
                                    <pre class="whitespace-pre-wrap font-mono text-xs max-h-20 overflow-hidden text-base-content/80">{item.query}</pre>
                                </td>
                                <td>
                                    <button class="btn btn-xs btn-ghost" onclick={() => handleSelect(item.query)}>
                                        Select
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>

        <div class="modal-action mt-4">
            <button class="btn" onclick={() => open = false}>Close</button>
        </div>
    </div>
</div>
{/if}
