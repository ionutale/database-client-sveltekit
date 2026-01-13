<script lang="ts">
    import ResultTable from '$lib/components/ResultTable.svelte';
    import { activeConnection } from '$lib/stores';

    let { tableName, connection } = $props();

    let activeTab = $state<'properties' | 'data' | 'diagram'>('data');
    let dataResult = $state({ rows: [], columns: [], loading: false, error: undefined });
    let propertiesResult = $state({ rows: [], columns: [], loading: false, error: undefined });
    
    // Fetch data when component mounts or tableName changes
    $effect(() => {
        if (activeTab === 'data') {
            fetchData();
        } else if (activeTab === 'properties') {
            fetchProperties();
        }
    });

    async function fetchData() {
        if (!connection) return;
        dataResult.loading = true;
        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: connection.type,
                    connectionString: connection.connectionString,
                    query: `SELECT * FROM "${tableName}" LIMIT 1000`
                })
            });
            const data = await res.json();
            dataResult = { 
                columns: data.columns || [], 
                rows: data.rows || [], 
                loading: false,
                error: data.error
            };
        } catch (e: any) {
            dataResult = { rows: [], columns: [], loading: false, error: e.message };
        }
    }

    async function fetchProperties() {
        if (!connection) return;
        propertiesResult.loading = true;
        try {
            // SQLite specific schema info
            const query = `PRAGMA table_info("${tableName}")`;
            
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: connection.type,
                    connectionString: connection.connectionString,
                    query
                })
            });
            const data = await res.json();
             propertiesResult = { 
                columns: data.columns || [], 
                rows: data.rows || [], 
                loading: false,
                error: data.error
            };
        } catch (e: any) {
             propertiesResult = { rows: [], columns: [], loading: false, error: e.message };
        }
    }
</script>

<div class="h-full flex flex-col bg-base-100">
    <!-- Sub-tabs Header -->
    <div class="h-8 bg-base-200 border-b border-base-300 flex items-center px-1 gap-0.5 select-none">
        {#each ['Properties', 'Data', 'Diagram'] as tab}
            <button 
                class="px-4 py-1.5 text-xs rounded transition-all
                       {activeTab === tab.toLowerCase() 
                           ? 'bg-base-100 text-primary font-bold shadow-sm' 
                           : 'text-base-content/40 hover:text-base-content hover:bg-base-300/50'}"
                onclick={() => activeTab = tab.toLowerCase() as any}
            >
                {tab}
            </button>
        {/each}
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden relative">
        {#if activeTab === 'data'}
            <ResultTable result={dataResult} />
        {:else if activeTab === 'properties'}
            <ResultTable result={propertiesResult} />
        {:else}
            <div class="flex items-center justify-center h-full text-base-content/30 italic">
                Diagram view not implemented yet
            </div>
        {/if}
    </div>
</div>
