<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import TopToolbar from '$lib/components/TopToolbar.svelte';
    import BottomTabs from '$lib/components/BottomTabs.svelte';
    import TableDetailView from '$lib/components/TableDetailView.svelte';
    import { activeConnection, tabs, activeTabId, type Tab } from '$lib/stores';

    let sqlEditorRef: SqlEditor | undefined = $state(undefined);
    let showRight = $state(false);
    let activeSidebar = $state('explorer');
    let sidebarCollapsed = $state(false);

    let activeIndex = $derived($tabs.length > 0 ? Math.min($activeTabId, $tabs.length - 1) : 0);

    function newTab() {
        tabs.update(t => {
            const newT: Tab = { id: Date.now(), type: 'query', name: `Script-${t.length + 1}`, value: '' };
            return [...t, newT];
        });
        activeTabId.set($tabs.length - 1);
    }

    function closeTab(i: number, e: Event) {
        e.stopPropagation();
        if ($tabs.length === 1) return;
        
        tabs.update(t => {
            const newT = [...t];
            newT.splice(i, 1);
            return newT;
        });
        
        if ($activeTabId >= $tabs.length) {
            activeTabId.set($tabs.length - 1);
        }
    }

    function runActive() {
        if (sqlEditorRef?.runQuery) sqlEditorRef.runQuery();
    }

    function toggleSidebar() {
        sidebarCollapsed = !sidebarCollapsed;
    }
    
    function selectTab(i: number) {
        activeTabId.set(i);
    }
</script>

<div class="h-screen w-screen bg-gradient-to-br from-base-100 via-base-50 to-base-200 flex flex-col overflow-hidden font-sans">
    <!-- Top Toolbar -->
    <TopToolbar onrun={runActive} onnewtab={newTab} ontoggleRight={() => showRight = !showRight} ontoggleSidebar={toggleSidebar} />

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
        </div>

        <Splitpanes class="default-theme">
            <!-- Left: Database Navigator -->
            {#if !sidebarCollapsed}
            <Pane size={18} minSize={12} maxSize={30}>
                <div class="h-full flex flex-col bg-base-200/80 backdrop-blur-md border-r border-base-300/50 shadow-lg">
                    {#if activeSidebar === 'explorer'}
                        <ConnectionList />
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
                        {#each $tabs as tab, i}
                            <button
                                class="group relative px-3 py-2 text-xs flex items-center gap-2 border-r border-base-300/30 min-w-[120px] max-w-[200px] transition-all duration-200
                                       {activeIndex === i 
                                           ? 'bg-base-100 text-primary font-medium shadow-[0_-2px_0_0_currentColor_inset]' 
                                           : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}"
                                onclick={() => selectTab(i)}
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
                                <button
                                    class="ml-auto opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-base-300 text-base-content/50 hover:text-error transition-all"
                                    onclick={(e) => closeTab(i, e)}
                                    title="Close"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
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
                        {#if $tabs.length > 0 && $tabs[activeIndex]}
                            {#if $tabs[activeIndex].type === 'table'}
                                <TableDetailView 
                                    tableName={$tabs[activeIndex].tableName} 
                                    connection={$tabs[activeIndex].connection} 
                                />
                            {:else}
                                <Splitpanes horizontal class="default-theme">
                                    <Pane size={55} minSize={20}>
                                        <SqlEditor bind:value={$tabs[activeIndex].value} bind:this={sqlEditorRef} />
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
</div>
