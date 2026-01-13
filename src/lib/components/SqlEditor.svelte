<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { sql } from "@codemirror/lang-sql";
    import { activeConnection, queryResult } from '$lib/stores';

    let { value = $bindable("SELECT * FROM sqlite_schema;") } = $props();

    export async function runQuery() {
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
    <div class="h-10 border-b border-base-content/10 flex items-center px-3 gap-2 bg-base-200 select-none">
         <div class="flex items-center gap-2 mr-auto">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 opacity-50">
              <path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9.5 5a.5.5 0 011 0v4.25l3.25 1.88a.5.5 0 01-.5.87l-3.5-2a.5.5 0 01-.25-.43V5z" clip-rule="evenodd" />
            </svg>
            <span class="font-bold text-xs opacity-70 tracking-wide">QUERY EDITOR</span>
         </div>
         
         <div class="join">
             <button class="btn btn-xs btn-ghost join-item" disabled>Format</button>
             <button class="btn btn-xs btn-ghost join-item" disabled>History</button>
         </div>

         <div class="divider divider-horizontal m-0 h-4 self-center opacity-30"></div>

         <div class="flex items-center gap-2">
            {#if $activeConnection}
                <div class="flex items-center gap-2 px-2 py-1 rounded bg-base-300 text-xs border border-base-content/10">
                    <div class="w-1.5 h-1.5 rounded-full bg-success"></div>
                    <span class="font-medium truncate max-w-[100px]">{$activeConnection.name}</span>
                </div>
            {:else}
                 <div class="flex items-center gap-2 px-2 py-1 rounded bg-base-300/50 text-xs border border-base-content/5 opacity-50">
                    <div class="w-1.5 h-1.5 rounded-full bg-base-content/30"></div>
                    <span class="italic">No Connection</span>
                </div>
            {/if}

             <button 
                class="btn btn-xs btn-success text-success-content font-bold gap-1 px-3 shadow-sm border-none hover:brightness-110" 
                onclick={runQuery} 
                disabled={!$activeConnection || $queryResult.loading}
            >
                {#if $queryResult.loading}
                    <span class="loading loading-spinner loading-xs"></span>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                {/if}
                RUN
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
