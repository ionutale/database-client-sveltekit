<script lang="ts">
    import { connections, projects, tabs, activeTabId, type Connection, type Project } from '$lib/stores';
    import AddConnectionModal from './AddConnectionModal.svelte';

    let expandedNodes = $state<Set<string>>(new Set(['default']));
    let nodeData = $state<Record<string, string[]>>({});
    let loadingNodes = $state<Set<string>>(new Set());
    let isAddModalOpen = $state(false);

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
            let action = '';
            if (folderType === 'tables') action = 'list-tables';
            else if (folderType === 'views') action = 'list-views';
            else if (folderType === 'indexes') action = 'list-indexes';

            const res = await fetch('/api/metadata', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action,
                    type: conn.type,
                    connectionString: conn.connectionString
                })
            });
            const data = await res.json();
            
            if (Array.isArray(data)) {
                 // The API returns TableInfo[] objects { name, type } or similar
                 // For the UI, we just want the names for now, or we can store objects?
                 // The UI code below iterates `nodeData[...]` which expects strings currently: `{#each ... as table} ... {table}`
                 // So I should map to name string.
                 
                 if (folderType === 'indexes') {
                     // The getIndexes returns { name, tableName }
                     nodeData[nodeId] = data.map((d: any) => d.name ? `${d.tableName ? d.tableName + '.' : ''}${d.name}` : JSON.stringify(d));
                 } else {
                     nodeData[nodeId] = data.map((d: any) => d.name);
                 }
            } else {
                nodeData[nodeId] = [];
            }
        } catch (e) {
            console.error(e);
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

<div class="h-full bg-base-200 flex flex-col">
    <div class="p-2 border-b border-base-300 flex justify-between items-center shrink-0">
        <span class="font-bold text-xs">CONNECTIONS</span>
        <button class="btn btn-xs btn-ghost" onclick={() => isAddModalOpen = true} aria-label="Add Connection">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
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
                    {#each $connections.filter(c => c.projectId === project.id) as conn}
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
                    {/each} 
                    <!-- Fix: Original code iterated project.connections IDs, but stores.ts has projectId on connection. 
                         The original code: `each project.connections as connId ... find(c => c.id === connId)`
                         My replacement uses: `filter(c => c.projectId === project.id)` which assumes connections have projectId.
                         stores.ts shows `connections: ['1']` in project, AND `projectId: 'default'` in connection.
                         So both ways work, but filtering by projectId is more dynamic if we add connections and don't update project.connections array.
                         The `AddConnectionModal` I wrote adds `projectId: 'default'`. It DOES NOT update `projects` store's connection list.
                         So iterating `project.connections` IDs would MISS new connections unless I also update the project store.
                         Iterating `$connections.filter` is safer for now.
                    -->
                {/if}
            </div>
        {/each}
    </div>

    <AddConnectionModal bind:open={isAddModalOpen} />
</div>
