<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { sql } from "@codemirror/lang-sql";
    import { activeConnection, queryResult } from '$lib/stores';

    let { value = $bindable("SELECT * FROM sqlite_schema;") } = $props();

    async function runQuery() {
        if (!$activeConnection) {
            queryResult.set({ columns: [], rows: [], error: 'Please select a connection first' });
            return;
        }
        
        queryResult.set({ columns: [], rows: [], loading: true });

        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: $activeConnection.type,
                    connectionString: $activeConnection.connectionString,
                    query: value
                })
            });
            const data = await res.json();
            queryResult.set({ 
                columns: data.columns || [], 
                rows: data.rows || [], 
                message: data.message,
                error: data.error,
                loading: false 
            });
        } catch (e: any) {
            queryResult.set({ columns: [], rows: [], error: e.message, loading: false });
        }
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            runQuery();
        }
    }
</script>

<div 
    class="h-full w-full flex flex-col" 
    onkeydown={handleKeydown} 
    role="group"
    tabindex="-1"
>
    <div class="toolbar p-2 bg-base-100 border-b border-base-300 flex items-center gap-2">
         <button class="btn btn-sm btn-success text-white" onclick={runQuery}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-1">
              <path fill-rule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clip-rule="evenodd" />
            </svg>
            Run
         </button>
         <div class="text-xs ml-auto">
            {#if $activeConnection}
                <span class="badge badge-outline">{$activeConnection.name}</span>
            {:else}
                <span class="badge badge-warning badge-outline">Disconnected</span>
            {/if}
         </div>
    </div>
    <div class="flex-1 overflow-hidden text-base">
        <CodeMirror
            bind:value
            lang={sql()}
            tabSize={2}
            styles={{ "&": { height: "100%", width: "100%" } }}
        />
    </div>
</div>
