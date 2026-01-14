<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import TopToolbar from '$lib/components/TopToolbar.svelte';
    import BottomTabs from '$lib/components/BottomTabs.svelte';
    import TableDetailView from '$lib/components/TableDetailView.svelte';
    import SettingsModal from '$lib/components/SettingsModal.svelte';
    import AddConnectionModal from '$lib/components/AddConnectionModal.svelte';
    import { activeConnection, tabs, activeTabId, connections, type Tab } from '$lib/stores';

    let sqlEditorRef: SqlEditor | undefined = $state(undefined);
    let showRight = $state(false);
    let activeSidebar = $state('explorer');
    let sidebarCollapsed = $state(false);
    let isSettingsOpen = $state(false);
    let isAddConnectionOpen = $state(false);

    let activeTab = $derived($tabs.find(t => t.id === $activeTabId));

    function newTab() {
        const id = crypto.randomUUID();
        tabs.update(t => {
            const newT: Tab = { id, type: 'query', name: `Script-${t.length + 1}`, value: '' };
            return [...t, newT];
        });
        activeTabId.set(id);
    }

    function closeTab(id: number | string, e?: Event) {
        e?.stopPropagation();
        if ($tabs.length === 1) return;
        
        const index = $tabs.findIndex(t => t.id === id);
        const isActive = $activeTabId === id;
        
        let nextActiveId = $activeTabId;
        if (isActive) {
            if (index === $tabs.length - 1) {
                nextActiveId = $tabs[index - 1].id;
            } else {
                nextActiveId = $tabs[index + 1].id;
            }
        }
        
        tabs.update(t => t.filter(x => x.id !== id));
        
        if (isActive) {
            activeTabId.set(nextActiveId);
        }
    }

    function runActive() {
        if (sqlEditorRef?.runQuery) sqlEditorRef.runQuery();
    }

    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
    }
    
    function selectTab(id: number | string) {
        activeTabId.set(id);
    }
</script>

<div class="h-screen w-screen bg-gradient-to-br from-base-100 via-base-50 to-base-200 flex flex-col overflow-hidden font-sans">
    <!-- Top Toolbar -->
    <TopToolbar 
        onrun={runActive} 
        onnewtab={newTab} 
        onnewconnection={() => isAddConnectionOpen = true}
        ontoggleRight={() => showRight = !showRight} 
        ontoggleSidebar={toggleSidebar} 
    />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Activity Bar -->
        <div class="w-12 bg-base-200/80 backdrop-blur-md border-r border-base-300/50 flex flex-col items-center py-4 gap-4 select-none shadow-lg">
            <button
                class="p-2 rounded-lg transition-all duration-200 hover:scale-105
                       {activeSidebar === 'explorer'
                           ? 'bg-primary text-primary-content shadow-lg ring-2 ring-primary/20'
                           : 'text-base-content/40 hover:text-base-content hover:bg-base-300/60'}"
                onclick={() => activeSidebar = 'explorer'}
                title="Explorer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
            </button>
            <button
                class="p-2 rounded-lg transition-all duration-200 hover:scale-105
                       {activeSidebar === 'history'
                           ? 'bg-primary text-primary-content shadow-lg ring-2 ring-primary/20'
                           : 'text-base-content/40 hover:text-base-content hover:bg-base-300/60'}"
                onclick={() => activeSidebar = 'history'}
                title="History"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
            <button
                class="p-2 rounded-lg transition-all duration-200 hover:scale-105
                       {activeSidebar === 'saved'
                           ? 'bg-primary text-primary-content shadow-lg ring-2 ring-primary/20'
                           : 'text-base-content/40 hover:text-base-content hover:bg-base-300/60'}"
                onclick={() => activeSidebar = 'saved'}
                title="Saved Queries"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
            </button>
            <div class="flex-1"></div>
            <button
                class="p-2 rounded-lg transition-all duration-200 hover:scale-105 text-base-content/40 hover:text-base-content hover:bg-base-300/60"
                onclick={() => isSettingsOpen = true}
                title="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.581-.495.644-.869l.214-1.281Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>
        </div>

        <Splitpanes class="default-theme">
            <!-- Left: Database Navigator -->
            {#if !sidebarCollapsed}
            <Pane size={18} minSize={12} maxSize={30}>
                <div class="h-full flex flex-col bg-base-200/80 backdrop-blur-md border-r border-base-300/50 shadow-lg">
                    {#if activeSidebar === 'explorer'}
                        <ConnectionList onAddConnection={() => isAddConnectionOpen = true} />
                    {:else if activeSidebar === 'history'}
                        <div class="p-4 text-sm text-base-content/50 italic">Query history coming soon...</div>
                    {:else if activeSidebar === 'saved'}
                         <div class="p-4 text-sm text-base-content/50 italic">Saved queries coming soon...</div>
                    {/if}
                </div>
            </Pane>
            {/if}

            <!-- Center: Editor / Tabs -->
            <Pane size={50}>
                <div class="h-full flex flex-col bg-base-100">
                    <!-- Tabs Header -->
                    <div class="flex items-center bg-base-200/50 border-b border-base-300/50 overflow-x-auto min-h-[36px] no-scrollbar">
                        {#each $tabs as tab (tab.id)}
                            <button
                                class="group relative px-3 py-2 text-xs flex items-center gap-2 border-r border-base-300/30 min-w-[120px] max-w-[200px] transition-all duration-200
                                       {$activeTabId === tab.id 
                                           ? 'bg-base-100 text-primary font-medium shadow-[0_-2px_0_0_currentColor_inset]' 
                                           : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}"
                                onclick={() => selectTab(tab.id)}
                                title={tab.name}
                            >
                                {#if tab.type === 'query'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 opacity-70">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.25 9.75v-4.5m0 4.5h4.5m-4.5 0 6-6m-6 6-6 6m6-6v4.5m0-4.5h-4.5" />
                                    </svg>
                                {:else if tab.type === 'table'}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 opacity-70">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 16.5h7.5" />
                                    </svg>
                                {/if}
                                <span class="truncate max-w-[120px]">{tab.name}</span>
                                <div
                                    class="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-base-300 text-base-content/50 hover:text-error transition-all cursor-pointer"
                                    onclick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
                                    title="Close"
                                    role="button"
                                    tabindex="0"
                                    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeTab(tab.id); } }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </button>
                        {/each}
                        
                        <button
                            class="w-6 h-6 flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-100/50 rounded ml-1 transition-all duration-200 hover:scale-110"
                            onclick={newTab}
                            title="New Tab"
                            aria-label="New Tab"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    <!-- Content Area -->
                    <div class="flex-1 overflow-hidden relative">
                        {#if activeTab}
                            {#if activeTab.type === 'table'}
                                <TableDetailView 
                                    tableName={activeTab.tableName} 
                                    connection={$connections.find(c => c.id === activeTab.connectionId)} 
                                />
                            {:else}
                                <Splitpanes horizontal class="default-theme">
                                    <Pane size={55} minSize={20}>
                                        <SqlEditor bind:value={activeTab.value} bind:this={sqlEditorRef} />
                                    </Pane>
                                    <Pane size={45} minSize={15}>
                                        <BottomTabs />
                                    </Pane>
                                </Splitpanes>
                            {/if}
                        {:else}
                            <div class="flex items-center justify-center h-full text-base-content/30 italic">
                                No active tab
                            </div>
                        {/if}
                    </div>
                </div>
            </Pane>

            <!-- Right: Properties Panel (optional) -->
            {#if showRight}
            <Pane size={22} minSize={15} maxSize={35}>
                 <div class="h-full bg-base-100/90 backdrop-blur-md border-l border-base-300/50 flex flex-col shadow-lg">
                    <!-- ... properties content ... -->
                    <div class="h-8 bg-base-200/80 backdrop-blur-md border-b border-base-300/50 flex items-center px-3">
                        <span class="text-xs font-semibold text-base-content/70 uppercase tracking-wide">Properties</span>
                    </div>
                    <div class="flex-1 p-3 overflow-auto text-sm">
                        {#if $activeConnection}
                            <div class="space-y-4">
                                <div class="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
                                    <div class="text-xs text-base-content/50 uppercase mb-2 font-medium">Connection</div>
                                    <div class="font-semibold text-base-content mb-1">{$activeConnection.name}</div>
                                    <div class="text-xs text-base-content/60 bg-base-300/50 px-2 py-1 rounded inline-block">{$activeConnection.type}</div>
                                </div>
                                <div class="bg-base-200/50 rounded-lg p-3 border border-base-300/30">
                                    <div class="text-xs text-base-content/50 uppercase mb-2 font-medium">Path</div>
                                    <div class="text-xs font-mono text-base-content/80 break-all bg-base-300/30 p-2 rounded border">{$activeConnection.connectionString}</div>
                                </div>
                            </div>
                        {:else}
                            <div class="text-base-content/40 text-xs italic flex flex-col items-center justify-center h-full gap-2">
                                <span>Select a connection to view properties.</span>
                            </div>
                        {/if}
                    </div>
                </div>
            </Pane>
            {/if}
        </Splitpanes>
    </div>
    <SettingsModal bind:open={isSettingsOpen} />
    <AddConnectionModal bind:open={isAddConnectionOpen} />
</div>
