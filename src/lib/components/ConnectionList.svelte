<script lang="ts">
    import { activeConnection, type Connection } from '$lib/stores';

    let connections: Connection[] = $state([
        { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db' }
    ]);

    function select(conn: Connection) {
        $activeConnection = conn;
    }
</script>

<div class="bg-base-300 h-full flex flex-col border-r border-base-content/10 select-none">
    <div class="p-4 border-b border-base-content/10 flex items-center justify-between">
        <h2 class="text-xs font-bold uppercase tracking-widest opacity-60">Connections</h2>
        <button class="btn btn-xs btn-ghost btn-square text-base-content/70 hover:text-primary" aria-label="Add Connection">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
        </button>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2">
        <ul class="menu menu-xs w-full gap-1 p-0">
            {#each connections as conn}
                <li>
                    <button 
                        class="flex gap-3 py-2 px-3 rounded-md hover:bg-base-100 transition-colors"
                        class:active={$activeConnection?.id === conn.id}
                        class:bg-base-100={$activeConnection?.id === conn.id}
                        class:text-primary-content={$activeConnection?.id === conn.id && false} /* Don't force text color on active if using bg-base-100 */
                        onclick={() => select(conn)}
                    >
                        <div class="avatar placeholder">
                            <div class="w-6 rounded bg-neutral text-neutral-content flex items-center justify-center">
                                <span class="text-xs font-bold">{conn.type === 'sqlite' ? 'SQL' : 'PG'}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-start overflow-hidden">
                            <span class="font-medium truncate w-full text-left">{conn.name}</span>
                            <span class="text-[10px] opacity-50 truncate w-full text-left">{conn.type}</span>
                        </div>
                        
                        {#if $activeConnection?.id === conn.id}
                             <div class="w-2 h-2 rounded-full bg-success ml-auto shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-success"></div>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="p-3 border-t border-base-content/10">
       <button class="btn btn-outline btn-sm w-full gap-2 font-normal opacity-70 hover:opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Connection
       </button>
    </div>
</div>
