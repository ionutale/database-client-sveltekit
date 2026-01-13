<script lang="ts">
    import { activeConnection, type Connection } from '$lib/stores';

    let connections: Connection[] = $state([
        { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db' }
    ]);

    function select(conn: Connection) {
        $activeConnection = conn;
    }
</script>

<div class="p-4 bg-base-200 h-full flex flex-col">
    <h2 class="text-xl font-bold mb-4">Connections</h2>
    <ul class="menu bg-base-100 w-full rounded-box flex-1 overflow-y-auto">
        {#each connections as conn}
            <li>
                <button 
                    class:active={$activeConnection?.id === conn.id}
                    onclick={() => select(conn)}
                >
                    <span class="badge badge-sm uppercase mr-2">{conn.type}</span>
                    {conn.name}
                </button>
            </li>
        {/each}
    </ul>
    
    <div class="mt-4">
       <!-- Placeholder for Add Connection Dialog -->
       <button class="btn btn-primary w-full btn-sm">New Connection</button>
    </div>
</div>
