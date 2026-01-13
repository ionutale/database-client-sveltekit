<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import TopToolbar from '$lib/components/TopToolbar.svelte';
    import BottomTabs from '$lib/components/BottomTabs.svelte';
    import { activeConnection } from '$lib/stores';

    // Editor tabs state
    let editors = $state([
        { id: 1, name: 'Script-1', value: 'SELECT * FROM sqlite_master;' }
    ]);
    let activeEditorIdx = $state(0);

    let sqlEditorRef: SqlEditor | undefined = $state(undefined);
    let showRight = $state(false);
    let activeSidebar = $state('explorer');

    function newTab() {
        editors.push({ id: Date.now(), name: `Script-${editors.length + 1}`, value: '' });
        activeEditorIdx = editors.length - 1;
    }

    function closeTab(i: number) {
        if (editors.length === 1) return;
        editors.splice(i, 1);
        activeEditorIdx = Math.max(0, Math.min(activeEditorIdx, editors.length - 1));
    }

    function runActive() {
        if (sqlEditorRef?.runQuery) sqlEditorRef.runQuery();
    }
</script>

<div class="h-screen w-screen bg-base-300 flex flex-col overflow-hidden font-sans">
    <!-- Top Toolbar -->
    <TopToolbar onrun={runActive} onnewtab={newTab} ontoggleRight={() => showRight = !showRight} />

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Sidebar Activity Bar -->
        <div class="w-12 bg-base-200 border-r border-base-300 flex flex-col items-center py-4 gap-4 select-none">
            <button 
                class="p-2 rounded-lg transition-all {activeSidebar === 'explorer' ? 'bg-primary text-primary-content shadow-lg' : 'text-base-content/40 hover:text-base-content hover:bg-base-300'}"
                onclick={() => activeSidebar = 'explorer'}
                title="Explorer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
            </button>
            <button 
                class="p-2 rounded-lg transition-all {activeSidebar === 'history' ? 'bg-primary text-primary-content shadow-lg' : 'text-base-content/40 hover:text-base-content hover:bg-base-300'}"
                onclick={() => activeSidebar = 'history'}
                title="History"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </button>
            <button 
                class="p-2 rounded-lg transition-all {activeSidebar === 'saved' ? 'bg-primary text-primary-content shadow-lg' : 'text-base-content/40 hover:text-base-content hover:bg-base-300'}"
                onclick={() => activeSidebar = 'saved'}
                title="Saved Queries"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
            </button>
            <div class="flex-1"></div>
            <button 
                class="p-2 rounded-lg text-base-content/40 hover:text-base-content hover:bg-base-300 transition-all"
                title="Settings"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </button>
        </div>

        <Splitpanes class="default-theme">
            <!-- Left: Database Navigator -->
            <Pane size={18} minSize={12} maxSize={30}>
                <div class="h-full flex flex-col bg-base-200">
                    <div class="h-8 flex items-center px-3 border-b border-base-300">
                        <span class="text-[10px] font-bold uppercase tracking-wider opacity-50">
                            {activeSidebar}
                        </span>
                    </div>
                    <div class="flex-1 overflow-auto">
                        {#if activeSidebar === 'explorer'}
                            <ConnectionList />
                        {:else if activeSidebar === 'history'}
                            <div class="p-4 text-xs text-base-content/40 italic">No query history yet.</div>
                        {:else if activeSidebar === 'saved'}
                            <div class="p-4 text-xs text-base-content/40 italic">Save queries to see them here.</div>
                        {/if}
                    </div>
                </div>
            </Pane>

            <!-- Center: Editor + Results -->
            <Pane size={showRight ? 60 : 82} minSize={40}>
                <div class="h-full flex flex-col bg-base-100">
                    <!-- Editor Tabs Bar -->
                    <div class="h-8 bg-base-200 border-b border-base-300 flex items-center px-1 gap-0.5 overflow-x-auto">
                        {#each editors as ed, i (ed.id)}
                            <div 
                                class="group flex items-center gap-1 px-3 py-1 text-xs rounded-t border-b-2 transition-colors cursor-pointer outline-none
                                       {i === activeEditorIdx 
                                           ? 'bg-base-100 border-primary text-base-content font-medium' 
                                           : 'bg-base-200 border-transparent text-base-content/60 hover:bg-base-100/50 hover:text-base-content'}"
                                onclick={() => activeEditorIdx = i}
                                onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (activeEditorIdx = i)}
                                role="button"
                                tabindex="0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3.5 h-3.5 opacity-60">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                </svg>
                                <span class="truncate max-w-24">{ed.name}</span>
                                <button 
                                    class="ml-1 w-4 h-4 rounded hover:bg-base-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onclick={(e: MouseEvent) => { e.stopPropagation(); closeTab(i); }}
                                    aria-label="Close tab"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3 h-3">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        {/each}
                        <button 
                            class="w-6 h-6 flex items-center justify-center text-base-content/40 hover:text-base-content hover:bg-base-100 rounded ml-1"
                            onclick={newTab}
                            title="New Tab"
                            aria-label="New Tab"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    <!-- Vertical split: SQL Editor (top) / Results (bottom) -->
                    <div class="flex-1 overflow-hidden">
                        <Splitpanes horizontal class="default-theme">
                            <Pane size={55} minSize={20}>
                                <SqlEditor bind:value={editors[activeEditorIdx].value} bind:this={sqlEditorRef} />
                            </Pane>
                            <Pane size={45} minSize={15}>
                                <BottomTabs />
                            </Pane>
                        </Splitpanes>
                    </div>
                </div>
            </Pane>

            <!-- Right: Properties Panel (optional) -->
            {#if showRight}
            <Pane size={22} minSize={15} maxSize={35}>
                <div class="h-full bg-base-100 border-l border-base-300 flex flex-col">
                    <div class="h-8 bg-base-200 border-b border-base-300 flex items-center px-3">
                        <span class="text-xs font-semibold text-base-content/70 uppercase tracking-wide">Properties</span>
                    </div>
                    <div class="flex-1 p-3 overflow-auto text-sm">
                        {#if $activeConnection}
                            <div class="space-y-3">
                                <div>
                                    <div class="text-xs text-base-content/50 uppercase mb-1">Connection</div>
                                    <div class="font-medium">{$activeConnection.name}</div>
                                    <div class="text-xs text-base-content/60">{$activeConnection.type}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-base-content/50 uppercase mb-1">Path</div>
                                    <div class="text-xs font-mono text-base-content/80 break-all">{$activeConnection.connectionString}</div>
                                </div>
                            </div>
                        {:else}
                            <div class="text-base-content/40 text-xs">Select a connection to view properties.</div>
                        {/if}
                    </div>
                </div>
            </Pane>
            {/if}
        </Splitpanes>
    </div>

    <!-- Status Bar -->
    <div class="h-5 bg-neutral flex items-center px-3 text-[10px] text-neutral-content/60 justify-between select-none border-t border-neutral-focus">
        <div class="flex gap-4">
            <span>{$activeConnection ? `Connected: ${$activeConnection.name}` : 'Disconnected'}</span>
        </div>
        <div class="flex gap-4">
            <span>SvelteKit SQL Client</span>
            <span>v1.0.0</span>
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden;
    }

    /* Splitpanes default theme */
    :global(.default-theme.splitpanes) {
        display: flex;
        width: 100%;
        height: 100%;
    }
    :global(.default-theme.splitpanes--vertical) {
        flex-direction: row;
    }
    :global(.default-theme.splitpanes--horizontal) {
        flex-direction: column;
    }
    :global(.default-theme .splitpanes__pane) {
        position: relative;
        overflow: hidden;
    }
    :global(.default-theme .splitpanes__splitter) {
        background-color: oklch(var(--b3));
        position: relative;
        flex-shrink: 0;
        z-index: 1;
    }
    :global(.default-theme .splitpanes__splitter:hover) {
        background-color: oklch(var(--p));
    }
    :global(.default-theme.splitpanes--vertical > .splitpanes__splitter) {
        width: 4px;
        cursor: col-resize;
    }
    :global(.default-theme.splitpanes--horizontal > .splitpanes__splitter) {
        height: 4px;
        cursor: row-resize;
    }
</style>
