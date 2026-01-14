<script lang="ts">
    import { connections, type Connection, type DbType } from '$lib/stores';

    let { open = $bindable(false) } = $props();

    let name = $state('');
    let type = $state<DbType>('sqlite');
    let connectionString = $state('');

    function handleSave() {
        if (!name || !connectionString) return;

        connections.update(conns => [
            ...conns,
            {
                id: crypto.randomUUID(),
                name,
                type,
                connectionString,
                projectId: 'default'
            }
        ]);
        
        // Reset form
        name = '';
        type = 'sqlite';
        connectionString = '';
        open = false;
    }

    function handleCancel() {
        open = false;
    }
</script>

{#if open}
<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg">Add New Connection</h3>
        
        <div class="form-control w-full max-w-xs mt-4">
            <label class="label">
                <span class="label-text">Name</span>
            </label>
            <input type="text" bind:value={name} class="input input-bordered w-full max-w-xs" placeholder="My Database" />
        </div>

        <div class="form-control w-full max-w-xs mt-2">
            <label class="label">
                <span class="label-text">Type</span>
            </label>
            <select bind:value={type} class="select select-bordered">
                <option value="sqlite">SQLite</option>
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
                <option value="mssql">SQL Server</option>
                <option value="oracle">Oracle</option>
            </select>
        </div>

        <div class="form-control w-full mt-2">
            <label class="label">
                <span class="label-text">Connection String</span>
            </label>
            <input type="text" bind:value={connectionString} class="input input-bordered w-full" placeholder="Connection URL or File Path" />
            <label class="label">
                <span class="label-text-alt text-gray-500">
                    {#if type === 'sqlite'}
                        Example: ./test.db
                    {:else if type === 'postgres'}
                        postgresql://user:password@localhost:5432/mydb
                    {:else if type === 'mysql'}
                        mysql://user:password@localhost:3306/mydb
                    {:else}
                         Standard connection string
                    {/if}
                </span>
            </label>
        </div>

        <div class="modal-action">
            <button class="btn" onclick={handleCancel}>Cancel</button>
            <button class="btn btn-primary" onclick={handleSave}>Save</button>
        </div>
    </div>
</div>
{/if}
