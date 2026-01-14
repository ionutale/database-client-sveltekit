<script lang="ts">
    import ResultTable from '$lib/components/ResultTable.svelte';
    import { activeConnection } from '$lib/stores';

    let { tableName, connection } = $props();

    let activeTab = $state<'data' | 'properties' | 'keys' | 'foreign-keys' | 'indexes' | 'ddl'>('data');
    
    interface ResultState {
        rows: any[];
        columns: string[];
        loading: boolean;
        error?: string;
    }

    let dataResult = $state<ResultState>({ rows: [], columns: [], loading: false, error: undefined });
    let propertiesResult = $state<ResultState>({ rows: [], columns: [], loading: false, error: undefined });
    let keysResult = $state<ResultState>({ rows: [], columns: [], loading: false, error: undefined });
    let foreignKeysResult = $state<ResultState>({ rows: [], columns: [], loading: false, error: undefined });
    let indexesResult = $state<ResultState>({ rows: [], columns: [], loading: false, error: undefined });
    let ddlResult = $state({ content: '', loading: false, error: undefined });
    
    import { onMount } from 'svelte';

    // Fetch data when component mounts
    onMount(() => {
        fetchDataForCurrentTab();
    });

    function fetchDataForCurrentTab() {
        if (activeTab === 'data') {
            fetchData();
        } else if (activeTab === 'properties') {
            fetchProperties();
        } else if (activeTab === 'keys') {
            fetchKeys();
        } else if (activeTab === 'foreign-keys') {
            fetchForeignKeys();
        } else if (activeTab === 'indexes') {
            fetchIndexes();
        } else if (activeTab === 'ddl') {
            fetchDDL();
        }
    }

    async function fetchData() {
        if (!connection || !tableName) return;
        
        dataResult = { ...dataResult, loading: true };
        
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
            dataResult = { ...dataResult, loading: false, error: e.message };
        }
    }

    async function fetchProperties() {
        if (!connection || !tableName) return;
        
        propertiesResult = { ...propertiesResult, loading: true };
        
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list-columns',
                    type: connection.type,
                    connectionString: connection.connectionString,
                    tableName
                })
            });
            const data = await res.json();
            // Data is ColumnInfo[]
            // We want to display it as a table, so we treat it as rows
            // keys: name, type, nullable, defaultValue, primaryKey
            if (Array.isArray(data)) {
                propertiesResult = { 
                    columns: ['name', 'type', 'nullable', 'defaultValue', 'primaryKey'], 
                    rows: data, 
                    loading: false,
                    error: undefined
                };
            } else {
                 propertiesResult = { ...propertiesResult, loading: false, error: data.error || 'Failed to load' };
            }
        } catch (e: any) {
             propertiesResult = { ...propertiesResult, loading: false, error: e.message };
        }
    }

    async function fetchKeys() {
        if (!connection || !tableName) return;
        keysResult = { ...keysResult, loading: true };
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list-primary-keys',
                    type: connection.type,
                    connectionString: connection.connectionString,
                    tableName
                })
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                keysResult = { 
                    columns: ['columnName', 'pkPosition'], 
                    rows: data, 
                    loading: false, 
                    error: undefined 
                };
            } else {
                keysResult = { ...keysResult, loading: false, error: data.error };
            }
        } catch (e: any) {
            keysResult = { ...keysResult, loading: false, error: e.message };
        }
    }

    async function fetchForeignKeys() {
        if (!connection || !tableName) return;
        foreignKeysResult = { ...foreignKeysResult, loading: true };
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list-foreign-keys',
                    type: connection.type,
                    connectionString: connection.connectionString,
                    tableName
                })
            });
            const data = await res.json();
             if (Array.isArray(data)) {
                foreignKeysResult = { 
                    columns: ['columnName', 'referencedTable', 'referencedColumn'], 
                    rows: data, 
                    loading: false, 
                    error: undefined 
                };
            } else {
                foreignKeysResult = { ...foreignKeysResult, loading: false, error: data.error };
            }
        } catch (e: any) {
            foreignKeysResult = { ...foreignKeysResult, loading: false, error: e.message };
        }
    }

    async function fetchIndexes() {
        if (!connection || !tableName) return;
        indexesResult = { ...indexesResult, loading: true };
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'list-indexes',
                    type: connection.type,
                    connectionString: connection.connectionString,
                    tableName
                })
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                indexesResult = { 
                    columns: ['name', 'tableName'], 
                    rows: data, 
                    loading: false, 
                    error: undefined 
                };
            } else {
                indexesResult = { ...indexesResult, loading: false, error: data.error };
            }
        } catch (e: any) {
            indexesResult = { ...indexesResult, loading: false, error: e.message };
        }
    }

    async function fetchDDL() {
        if (!connection || !tableName) return;
        ddlResult = { ...ddlResult, loading: true };
        try {
            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'get-ddl',
                    type: connection.type,
                    connectionString: connection.connectionString,
                    tableName
                })
            });
            const data = await res.json(); // returns string directly? No, returns json(result) which is string.
            // Wait, api returns json(result). If result is string, it is wrapper string.
            // Client side: await res.json(). 
            // If API returns `json("CREATE TABLE...")`, then `data` is "CREATE TABLE..."
            ddlResult = { content: data, loading: false, error: undefined };
        } catch (e: any) {
            ddlResult = { ...ddlResult, loading: false, error: e.message };
        }
    }
</script>

<div class="h-full flex flex-col bg-base-100">
    <!-- Sub-tabs Header -->
    <div class="h-8 bg-base-200 border-b border-base-300 flex items-center px-1 gap-0.5 select-none shrink-0">
        {#each ['Data', 'Properties', 'Keys', 'Foreign Keys', 'Indexes', 'DDL'] as tab}
            <button 
                class="px-4 py-1.5 text-xs rounded transition-all
                       {activeTab === tab.toLowerCase().replace(' ', '-') 
                           ? 'bg-base-100 text-primary font-bold shadow-sm' 
                           : 'text-base-content/40 hover:text-base-content hover:bg-base-300/50'}"
                onclick={() => {
                    activeTab = tab.toLowerCase().replace(' ', '-') as any;
                    fetchDataForCurrentTab();
                }}
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
        {:else if activeTab === 'keys'}
             <ResultTable result={keysResult} />
        {:else if activeTab === 'foreign-keys'}
             <ResultTable result={foreignKeysResult} />
        {:else if activeTab === 'indexes'}
             <ResultTable result={indexesResult} />
        {:else if activeTab === 'ddl'}
             {#if ddlResult.loading}
                <div class="h-full w-full flex items-center justify-center">
                    <span class="loading loading-spinner"></span>
                </div>
             {:else if ddlResult.error}
                <div class="p-4 text-error">Error: {ddlResult.error}</div>
             {:else}
                <pre class="p-4 overflow-auto h-full text-xs font-mono bg-base-100">{ddlResult.content}</pre>
             {/if}
        {/if}
    </div>
</div>
