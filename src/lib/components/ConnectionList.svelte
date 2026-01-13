<script lang="ts">
    import { activeConnection, tabs, activeTabId, type Connection } from '$lib/stores';

    let connections: Connection[] = $state([
        { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db' }
    ]);

    // Track expanded nodes by their unique ID (e.g., '1' for connection, '1-tables' for tables folder)
    let expandedNodes = $state<Set<string>>(new Set(['1']));
    
    // Store tables/views data: { '1-tables': ['users', 'posts'] }
    let nodeData = $state<Record<string, string[]>>({});
    let loadingNodes = $state<Set<string>>(new Set());

    function toggleExpand(id: string) {
        if (expandedNodes.has(id)) {
            expandedNodes.delete(id);
        } else {
            expandedNodes.add(id);
        }
        expandedNodes = new Set(expandedNodes);
    }

    function select(conn: Connection) {
        activeConnection.set(conn);
    }

    async function toggleFolder(conn: Connection, folderType: 'tables' | 'views' | 'indexes') {
        const nodeId = `${conn.id}-${folderType}`;
        toggleExpand(nodeId);

        // If expanding and no data, fetch it
        if (expandedNodes.has(nodeId) && !nodeData[nodeId]) {
            await fetchNodeData(conn, folderType);
        }
    }

    async function fetchNodeData(conn: Connection, folderType: 'tables' | 'views' | 'indexes') {
        const nodeId = `${conn.id}-${folderType}`;
        loadingNodes.add(nodeId);
        loadingNodes = new Set(loadingNodes);

        try {
            let query = '';
            // SQLite specific queries
            if (conn.type === 'sqlite') {
                if (folderType === 'tables') {
                    query = "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name";
                } else if (folderType === 'views') {
                    query = "SELECT name FROM sqlite_schema WHERE type='view' ORDER BY name";
                } else if (folderType === 'indexes') {
                    query = "SELECT name FROM sqlite_schema WHERE type='index' AND name NOT LIKE 'sqlite_%' ORDER BY name";
                }
            }

            if (!query) return;

            const res = await fetch('/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: conn.type,
                    connectionString: conn.connectionString,
                    query
                })
            });
            
            const data = await res.json();
            if (data.rows) {
                // Assuming rows are returned as objects or arrays, extract the name (first column)
                // Result rows usually come as objects { name: 'tablename' } or similar depending on the driver
                // But better-sqlite3 usually returns array of objects.
                // Let's assume the first value of each row is the name.
                nodeData[nodeId] = data.rows.map((row: any) => Object.values(row)[0] as string);
                nodeData = { ...nodeData }; // Release reactivity
            }
        } catch (err) {
            console.error('Failed to fetch node data', err);
        } finally {
            loadingNodes.delete(nodeId);
            loadingNodes = new Set(loadingNodes);
        }
    }

    function openTable(conn: Connection, tableName: string) {
        // Check if a tab already exists for this table/connection
        const existingTab = $tabs.find(t => 
            t.type === 'table' && 
            t.tableName === tableName && 
            t.connection?.id === conn.id
        );

        if (existingTab) {
            activeTabId.set(existingTab.id);
        } else {
            const newTab = {
                id: crypto.randomUUID(),
                type: 'table' as const,
                name: tableName,
                tableName: tableName,
                connection: conn
            };
            
            tabs.update(currentTabs => [...currentTabs, newTab]);
            activeTabId.set(newTab.id);
        }
    }
</script>

<div class="h-full flex flex-col bg-base-200 select-none">
    <!-- Header -->
    <div class="h-7 bg-base-300 border-b border-base-300 flex items-center px-3 gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-base-content/60">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
        <span class="text-xs font-semibold text-base-content/70 uppercase tracking-wide">Database Navigator</span>
    </div>
    
    <!-- Tree View -->
    <div class="flex-1 overflow-y-auto p-1">
        {#each connections as conn}
            <div class="text-sm">
                <!-- Connection Node -->
                <button 
                    class="w-full flex items-center gap-1 px-2 py-1 rounded hover:bg-base-300 transition-colors text-left
                           {$activeConnection?.id === conn.id ? 'bg-primary/10 text-primary' : 'text-base-content'}"
                    onclick={() => { select(conn); toggleExpand(conn.id); }}
                >
                    <!-- Expand Arrow -->
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke-width="2" 
                        stroke="currentColor" 
                        class="w-3 h-3 text-base-content/40 transition-transform {expandedNodes.has(conn.id) ? 'rotate-90' : ''}"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                    
                    <!-- Database Icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-warning">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                    </svg>
                    
                    <span class="flex-1 truncate font-medium">{conn.name}</span>
                    
                    {#if $activeConnection?.id === conn.id}
                        <div class="w-2 h-2 rounded-full bg-success"></div>
                    {/if}
                </button>
                
                <!-- Expanded Children (Tables placeholder) -->
                {#if expandedNodes.has(conn.id)}
                    <div class="ml-4 border-l border-base-300">
                        <!-- Tables folder -->
                        <button 
                            class="w-full flex items-center gap-1 px-2 py-1 text-xs text-base-content/70 hover:bg-base-300 rounded cursor-pointer ml-1 text-left"
                            onclick={() => toggleFolder(conn, 'tables')}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="1.5" 
                                stroke="currentColor" 
                                class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-tables`) ? 'rotate-90' : ''}"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-info">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                            <span>Tables</span>
                        </button>

                        {#if expandedNodes.has(`${conn.id}-tables`)}
                            <div class="ml-4 border-l border-base-300">
                                {#if loadingNodes.has(`${conn.id}-tables`)}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">Loading...</div>
                                {:else if nodeData[`${conn.id}-tables`]}
                                    {#each nodeData[`${conn.id}-tables`] as table}
                                        <button 
                                            class="w-full text-left flex items-center gap-1 px-2 py-1 text-xs text-base-content/80 hover:bg-base-300 rounded ml-1 cursor-pointer"
                                            onclick={() => openTable(conn, table)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-50">
                                               <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 16.5h7.5" />
                                            </svg>
                                            <span class="truncate">{table}</span>
                                        </button>
                                    {/each}
                                {:else}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">No tables found</div>
                                {/if}
                            </div>
                        {/if}

                        <!-- Views folder -->
                        <button 
                            class="w-full flex items-center gap-1 px-2 py-1 text-xs text-base-content/70 hover:bg-base-300 rounded cursor-pointer ml-1 text-left"
                            onclick={() => toggleFolder(conn, 'views')}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="1.5" 
                                stroke="currentColor" 
                                class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-views`) ? 'rotate-90' : ''}"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-secondary">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                            <span>Views</span>
                        </button>
                        
                        {#if expandedNodes.has(`${conn.id}-views`)}
                            <div class="ml-4 border-l border-base-300">
                                {#if loadingNodes.has(`${conn.id}-views`)}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">Loading...</div>
                                {:else if nodeData[`${conn.id}-views`]}
                                    {#each nodeData[`${conn.id}-views`] as view}
                                        <div class="flex items-center gap-1 px-2 py-1 text-xs text-base-content/80 hover:bg-base-300 rounded ml-1 cursor-pointer">
                                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-50">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                            <span class="truncate">{view}</span>
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">No views found</div>
                                {/if}
                            </div>
                        {/if}

                        <!-- Indexes folder -->
                        <button 
                            class="w-full flex items-center gap-1 px-2 py-1 text-xs text-base-content/70 hover:bg-base-300 rounded cursor-pointer ml-1 text-left"
                            onclick={() => toggleFolder(conn, 'indexes')}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke-width="1.5" 
                                stroke="currentColor" 
                                class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-indexes`) ? 'rotate-90' : ''}"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-accent">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                            </svg>
                            <span>Indexes</span>
                        </button>
                        {#if expandedNodes.has(`${conn.id}-indexes`)}
                             <div class="ml-4 border-l border-base-300">
                                {#if loadingNodes.has(`${conn.id}-indexes`)}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">Loading...</div>
                                {:else if nodeData[`${conn.id}-indexes`]}
                                    {#each nodeData[`${conn.id}-indexes`] as index}
                                        <div class="flex items-center gap-1 px-2 py-1 text-xs text-base-content/80 hover:bg-base-300 rounded ml-1 cursor-pointer">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 opacity-50">
                                               <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                            </svg>
                                            <span class="truncate">{index}</span>
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="px-2 py-1 text-xs italic opacity-50 ml-1">No indexes found</div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>
        {/each}
    </div>
    
    <!-- Footer: Add Connection -->
    <div class="p-2 border-t border-base-300">
        <button class="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-base-content/60 hover:text-base-content hover:bg-base-300 rounded transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Connection
        </button>
    </div>
</div>
