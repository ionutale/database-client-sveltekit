<script lang="ts">
    import { connections, projects, tabs, activeTabId, type Connection, type Project } from '$lib/stores';

    let expandedNodes = $state<Set<string>>(new Set(['default']));
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

    function selectConnection(conn: Connection) {
        // Set active connection for new tabs or something, but for now, associate with active tab
        tabs.update(t => {
            const activeTab = t.find(tab => tab.id === $activeTabId);
            if (activeTab) {
                activeTab.connectionId = conn.id;
            }
            return t;
        });
    }

    async function toggleFolder(conn: Connection, folderType: 'tables' | 'views' | 'indexes') {
        const nodeId = `${conn.id}-${folderType}`;
        toggleExpand(nodeId);

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
            if (conn.type === 'sqlite') {
                if (folderType === 'tables') {
                    query = "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name";
                } else if (folderType === 'views') {
                    query = "SELECT name FROM sqlite_schema WHERE type='view' ORDER BY name";
                } else if (folderType === 'indexes') {
                    query = "SELECT name FROM sqlite_schema WHERE type='index' ORDER BY name";
                }
            } else if (conn.type === 'postgres') {
                if (folderType === 'tables') {
                    query = "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename";
                } else if (folderType === 'views') {
                    query = "SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname";
                } else if (folderType === 'indexes') {
                    query = "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname";
                }
            } else if (conn.type === 'mysql') {
                if (folderType === 'tables') {
                    query = "SHOW TABLES";
                } else if (folderType === 'views') {
                    query = "SHOW FULL TABLES WHERE Table_type = 'VIEW'";
                } else if (folderType === 'indexes') {
                    query = "SELECT DISTINCT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, INDEX_NAME";
                }
            } else {
                // For other DBs, placeholder
                nodeData[nodeId] = [];
                return;
            }

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
                if (conn.type === 'mysql' && folderType === 'views') {
                    nodeData[nodeId] = data.rows.map((r: any) => Object.values(r)[0]);
                } else if (conn.type === 'mysql' && folderType === 'indexes') {
                    nodeData[nodeId] = data.rows.map((r: any) => `${r.TABLE_NAME}.${r.INDEX_NAME}`);
                } else {
                    nodeData[nodeId] = data.rows.map((r: any) => Object.values(r)[0]);
                }
            } else {
                nodeData[nodeId] = [];
            }
        } catch (e) {
            nodeData[nodeId] = [];
        } finally {
            loadingNodes.delete(nodeId);
            loadingNodes = new Set(loadingNodes);
        }
    }

    function openTable(conn: Connection, tableName: string) {
        tabs.update(t => {
            const newTab: any = { 
                id: Date.now(), 
                type: 'table', 
                name: tableName, 
                tableName, 
                connectionId: conn.id 
            };
            return [...t, newTab];
        });
        activeTabId.set($tabs.length - 1);
    }
</script>

<div class="h-full overflow-y-auto bg-base-200 p-2">
    {#each $projects as project}
        <div class="mb-2">
            <div 
                class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-base-300"
                onclick={() => toggleExpand(project.id)}
            >
                <svg class="w-4 h-4 transition-transform {expandedNodes.has(project.id) ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z"></path>
                </svg>
                <span class="font-medium">{project.name}</span>
            </div>
            
            {#if expandedNodes.has(project.id)}
                {#each project.connections as connId}
                    {@const conn = $connections.find(c => c.id === connId)}
                    {#if conn}
                        <div class="ml-4 mb-1">
                            <div 
                                class="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-base-300"
                                onclick={() => toggleExpand(conn.id)}
                            >
                                <svg class="w-4 h-4 transition-transform {expandedNodes.has(conn.id) ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                                <div class="w-3 h-3 rounded-full bg-success"></div>
                                <span class="text-sm">{conn.name} ({conn.type})</span>
                            </div>
                            
                            {#if expandedNodes.has(conn.id)}
                                <div class="ml-4">
                                    <!-- Tables -->
                                    <div 
                                        class="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-base-300 text-xs"
                                        onclick={() => toggleFolder(conn, 'tables')}
                                    >
                                        <svg class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-tables`) ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                                        </svg>
                                        Tables {#if loadingNodes.has(`${conn.id}-tables`)}<span class="loading loading-spinner loading-xs"></span>{/if}
                                    </div>
                                    {#if expandedNodes.has(`${conn.id}-tables`)}
                                        {#each nodeData[`${conn.id}-tables`] || [] as table}
                                            <div 
                                                class="ml-4 p-1 rounded cursor-pointer hover:bg-base-300 text-xs"
                                                onclick={() => openTable(conn, table)}
                                            >
                                                📄 {table}
                                            </div>
                                        {/each}
                                    {/if}
                                    
                                    <!-- Views -->
                                    <div 
                                        class="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-base-300 text-xs"
                                        onclick={() => toggleFolder(conn, 'views')}
                                    >
                                        <svg class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-views`) ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                        Views {#if loadingNodes.has(`${conn.id}-views`)}<span class="loading loading-spinner loading-xs"></span>{/if}
                                    </div>
                                    {#if expandedNodes.has(`${conn.id}-views`)}
                                        {#each nodeData[`${conn.id}-views`] || [] as view}
                                            <div class="ml-4 p-1 text-xs">👁️ {view}</div>
                                        {/each}
                                    {/if}
                                    
                                    <!-- Indexes -->
                                    <div 
                                        class="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-base-300 text-xs"
                                        onclick={() => toggleFolder(conn, 'indexes')}
                                    >
                                        <svg class="w-3 h-3 transition-transform {expandedNodes.has(`${conn.id}-indexes`) ? 'rotate-90' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                                        </svg>
                                        🔍 Indexes {#if loadingNodes.has(`${conn.id}-indexes`)}<span class="loading loading-spinner loading-xs"></span>{/if}
                                    </div>
                                    {#if expandedNodes.has(`${conn.id}-indexes`)}
                                        {#each nodeData[`${conn.id}-indexes`] || [] as index}
                                            <div class="ml-4 p-1 text-xs">🔍 {index}</div>
                                        {/each}
                                    {/if}
                                </div>
                            {/if}
                        </div>
                    {/if}
                {/each}
            {/if}
        </div>
    {/each}
</div>
