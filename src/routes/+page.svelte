<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import TopToolbar from '$lib/components/TopToolbar.svelte';
    import BottomTabs from '$lib/components/BottomTabs.svelte';
    import { activeConnection } from '$lib/stores';

    // Simple editor tabs state
    let editors = [
        { id: 1, name: 'Query 1', value: 'SELECT * FROM sqlite_master;' }
    ];
    let activeEditor = 0;

    let currentValue = editors[activeEditor].value;
    $: if (editors[activeEditor]) currentValue = editors[activeEditor].value;
    $: if (editors[activeEditor]) editors[activeEditor].value = currentValue;

    let sqlEditorRef: any;

    function newTab() {
        editors = [...editors, { id: Date.now(), name: `Query ${editors.length + 1}`, value: '' }];
        activeEditor = editors.length - 1;
    }
    function closeTab(i: number) {
        if (editors.length === 1) return;
        editors = editors.slice(0, i).concat(editors.slice(i + 1));
        activeEditor = Math.max(0, Math.min(activeEditor, editors.length - 1));
    }

    function runActive() {
        if (sqlEditorRef && sqlEditorRef.runQuery) sqlEditorRef.runQuery();
    }

    let showRight = true;
</script>

<div class="h-screen w-screen bg-base-300 flex flex-col overflow-hidden">
    <!-- Top Toolbar -->
    <TopToolbar on:run={runActive} on:newtab={newTab} on:toggleRight={() => showRight = !showRight} connectedName={$activeConnection?.name} />

    <!-- Main Content -->
    <div class="flex-1 w-full relative">
        <Splitpanes class="modern-theme" horizontal={false} style="height: 100%">
            <Pane size={20} minSize={12} maxSize={35} class="border-r border-base-content/10 bg-base-200">
                <ConnectionList />
            </Pane>

            <Pane>
                <Splitpanes horizontal={false} style="height:100%">
                    <!-- Center area: editor tabs + split editor/results -->
                    <Pane>
                        <div class="h-full flex flex-col">
                            <!-- Editor Tabs -->
                            <div class="h-9 border-b border-base-content/10 flex items-center px-2 gap-2 bg-base-200 select-none">
                                <div class="flex gap-1">
                                    {#each editors as ed, i}
                                        <div class="flex items-center gap-1 px-3 py-1 rounded-t text-sm font-medium cursor-pointer"
                                             class:bg-base-100={i === activeEditor}
                                             class:border-b-2={i === activeEditor}
                                             on:click={() => activeEditor = i}>
                                            <span class="truncate max-w-[160px]">{ed.name}</span>
                                            <button class="btn btn-ghost btn-xs btn-square" on:click|stopPropagation={() => closeTab(i)}>×</button>
                                        </div>
                                    {/each}
                                </div>
                                <div class="ml-auto">
                                    <button class="btn btn-ghost btn-xs" on:click={newTab}>+</button>
                                </div>
                            </div>

                            <Splitpanes horizontal={true} style="height: calc(100% - 36px);">
                                <Pane size={70} minSize={30} class="border-r border-base-content/10">
                                    <SqlEditor bind:value={currentValue} bind:this={sqlEditorRef} />
                                </Pane>
                                <Pane size={30} minSize={12} class="bg-base-100">
                                    <BottomTabs />
                                </Pane>
                            </Splitpanes>
                        </div>
                    </Pane>

                    <!-- Right properties pane -->
                    {#if showRight}
                    <Pane size={25} minSize={12} class="border-t border-base-content/10 bg-base-100">
                        <div class="h-full p-3 text-sm">
                            <h3 class="font-bold text-xs mb-2">Properties</h3>
                            {#if $activeConnection}
                                <div class="text-xs">
                                    <div class="font-semibold">{$activeConnection.name}</div>
                                    <div class="text-xs text-base-content/60">{$activeConnection.type} · {$activeConnection.connectionString}</div>
                                </div>
                            {:else}
                                <div class="text-base-content/40">No connection selected.</div>
                            {/if}

                            <div class="mt-4">
                                <div class="font-bold text-xs mb-1">Details</div>
                                <div class="text-xs text-base-content/60">Placeholder for table/column details, execution plan, or object properties.</div>
                            </div>
                        </div>
                    </Pane>
                    {/if}
                </Splitpanes>
            </Pane>
        </Splitpanes>
    </div>

    <!-- Status Bar -->
    <div class="h-6 bg-base-300 border-t border-base-content/10 flex items-center px-4 text-[10px] text-base-content/40 justify-between select-none">
        <div class="flex gap-4">
             <span>Ready</span>
             <span>v1.0.0</span>
        </div>
        <div>
            SvelteKit SQL Client
        </div>
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow: hidden; /* Prevent global scroll */
    }

    /* Keep the Splitpanes styles from before */
    :global(.splitpanes) { display:flex; width:100%; height:100%; }
    :global(.splitpanes--vertical) { flex-direction:row; }
    :global(.splitpanes--horizontal) { flex-direction:column; }
    :global(.splitpanes__pane) { width:100%; height:100%; overflow:hidden; }

    :global(.modern-theme .splitpanes__splitter) { background-color: transparent; position: relative; touch-action: none; z-index: 10; transition: background-color 0.2s ease; }
    :global(.modern-theme .splitpanes--vertical > .splitpanes__splitter) { min-width: 6px; cursor: col-resize; margin-left: -3px; margin-right: -3px; }
    :global(.modern-theme .splitpanes--horizontal > .splitpanes__splitter) { min-height: 6px; cursor: row-resize; margin-top: -3px; margin-bottom: -3px; }

    :global(.modern-theme .splitpanes__splitter::before) { content: ''; position:absolute; background-color: oklch(var(--b3)); opacity:0.5; }
    :global(.modern-theme .splitpanes--vertical > .splitpanes__splitter::before) { top:0; bottom:0; left:50%; width:1px; transform:translateX(-50%); }
    :global(.modern-theme .splitpanes--horizontal > .splitpanes__splitter::before) { left:0; right:0; top:50%; height:1px; transform:translateY(-50%); }

    /* Editor tabs visuals */
    .tab-active { border-bottom: 2px solid var(--p); }
</style>
