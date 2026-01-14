<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { sql } from "@codemirror/lang-sql";
    import { activeConnection, queryResult, connections, queryHistory, type HistoryItem } from '$lib/stores';
    import HistoryModal from './HistoryModal.svelte';

    let { value = $bindable("SELECT * FROM sqlite_schema;") } = $props();

    let editor: any = $state(null);
    let isHistoryOpen = $state(false);

    export async function runQuery(selectedText?: string) {
        const connId = $activeConnection?.id;
        if (!connId) {
            queryResult.set({ columns: [], rows: [], error: 'Please select a connection first' });
            return;
        }
        
        const conn = $connections.find(c => c.id === connId);
        if (!conn) {
            queryResult.set({ columns: [], rows: [], error: 'Connection not found' });
            return;
        }

        queryResult.set({ columns: [], rows: [], loading: true });

        const startTime = Date.now();
        const queryToRun = selectedText || value;

        try {
            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: conn.type,
                    connectionString: conn.connectionString,
                    query: queryToRun
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

            // Save to history
            const historyItem: HistoryItem = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                query: queryToRun,
                connectionId: conn.id,
                status: data.error ? 'error' : 'success',
                duration: Date.now() - startTime,
                rowsAffected: data.rows?.length || 0
            };
            
            // Limit history to last 100 items
            queryHistory.update(h => [...h, historyItem].slice(-100));

        } catch (e: any) {
            queryResult.set({ columns: [], rows: [], error: e.message, loading: false });
             // Save error to history
             const historyItem: HistoryItem = {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                query: queryToRun,
                connectionId: conn.id,
                status: 'error',
                duration: Date.now() - startTime
            };
            queryHistory.update(h => [...h, historyItem].slice(-100));
        }
    }
    
    function handleKeydown(e: KeyboardEvent) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            runQuery();
        }
    }

    function runSelected() {
        // For now, just run the full query since we can't easily get selection without editor binding
        runQuery();
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
             <button class="btn btn-xs btn-ghost join-item" onclick={() => isHistoryOpen = true}>History</button>
             <button class="btn btn-xs btn-ghost join-item" onclick={() => runSelected()}>Run Selected</button>
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
                onclick={() => runQuery()} 
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
            extensions={[sql()]} 
            class="h-full w-full" 
        />
    </div>

    <HistoryModal bind:open={isHistoryOpen} onSelect={(q) => value = q} />
</div>
