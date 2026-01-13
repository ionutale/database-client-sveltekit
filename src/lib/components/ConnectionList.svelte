<script lang="ts">
    import { activeConnection, type Connection } from '$lib/stores';

    let connections: Connection[] = $state([
        { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db' }
    ]);

    function select(conn: Connection) {
        $activeConnection = conn;
    }
</script>

<div class="bg-base-300 h-full flex flex-col border-r border-base-content/10">
    <div class="p-4 border-b border-base-content/10 flex items-center justify-between">
        <h2 class="text-sm font-bold uppercase tracking-wider opacity-70">Explorer</h2>
        <button class="btn btn-xs btn-ghost btn-square" aria-label="Add Connection">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
        </button>
    </div>
    
    <div class="flex-1 overflow-y-auto p-2">
        <ul class="menu menu-sm w-full gap-1">
            <li class="menu-title opacity-50">Saved Connections</li>
            {#each connections as conn}
                <li>
                    <button 
                        class="flex gap-3 py-2"
                        class:active={$activeConnection?.id === conn.id}
                        onclick={() => select(conn)}
                    >
                        <div class="avatar placeholder">
                            <div class="bg-neutral text-neutral-content rounded-full w-6">
                                <span class="text-xs">{conn.type === 'sqlite' ? 'S' : 'P'}</span>
                            </div>
                        </div>
                        <span class="font-medium truncate">{conn.name}</span>
                        {#if $activeConnection?.id === conn.id}
                             <span class="badge badge-xs badge-success ml-auto"></span>
                        {/if}
                    </button>
                </li>
            {/each}
        </ul>
    </div>
    
    <div class="p-4 border-t border-base-content/10">
       <button class="btn btn-primary btn-sm w-full gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Connection
       </button>
    </div>
</div>
