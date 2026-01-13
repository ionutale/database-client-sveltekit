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
    class="h-full w-full flex flex-col bg-base-100" 
    onkeydown={handleKeydown} 
    role="group"
    tabindex="-1"
>
    <!-- Toolbar -->
    <div class="h-12 border-b border-base-content/10 flex items-center px-4 gap-2 bg-base-200/50">
         <div class="flex items-center gap-2 mr-auto">
            <span class="font-mono text-xs opacity-50 font-bold">QUERY EDITOR</span>
         </div>
         
         <div class="join">
             <button class="btn btn-sm btn-ghost join-item font-normal text-xs" disabled>Format</button>
             <button class="btn btn-sm btn-ghost join-item font-normal text-xs" disabled>History</button>
         </div>

         <div class="divider divider-horizontal m-0 h-6 self-center"></div>

         <div class="flex items-center gap-2">
            {#if $activeConnection}
                <div class="badge badge-sm badge-neutral gap-1 pl-1 pr-2">
                    <div class="w-2 h-2 rounded-full bg-success"></div>
                    {$activeConnection.name}
                </div>
            {:else}
                <div class="badge badge-sm badge-ghost gap-1 pl-1 pr-2 opacity-50">
                    <div class="w-2 h-2 rounded-full bg-base-content/30"></div>
                    No Connection
                </div>
            {/if}

             <button 
                class="btn btn-sm btn-primary shadow-sm" 
                onclick={runQuery} 
                disabled={!$activeConnection || $queryResult.loading}
            >
                {#if $queryResult.loading}
                    <span class="loading loading-spinner loading-xs"></span>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                      <path fill-rule="evenodd" d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm6.39-2.908a.75.75 0 01.766.027l3.5 2.25a.75.75 0 010 1.262l-3.5 2.25A.75.75 0 018 12.25v-4.5a.75.75 0 01.39-.658z" clip-rule="evenodd" />
                    </svg>
                {/if}
                Run
             </button>
         </div>
    </div>

    <!-- Editor Area -->
    <div class="flex-1 overflow-hidden text-base relative group">
        <CodeMirror
            bind:value
            lang={sql()}
            tabSize={2}
            styles={{ 
                "&": { height: "100%", width: "100%", backgroundColor: "transparent" },
                ".cm-content": { caretColor: "currentColor" },
                ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" }
            }}
        />
        <!-- Hint overlay when no connection -->
        {#if !$activeConnection}
            <div class="absolute inset-0 bg-base-100/50 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                <p class="text-base-content/30 font-medium">Select a connection to run queries</p>
            </div>
        {/if}
    </div>
</div>
