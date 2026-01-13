<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import ResultTable from '$lib/components/ResultTable.svelte';

    let sqlQuery = $state("SELECT * FROM sqlite_master;");
</script>

<div class="h-screen w-screen bg-base-300 flex flex-col overflow-hidden">
    <!-- Main Content Area -->
    <div class="flex-1 w-full relative">
        <Splitpanes class="modern-theme" horizontal={false} style="height: 100%">
            <Pane size={20} minSize={15} maxSize={30} class="border-r border-base-content/10">
                <ConnectionList />
            </Pane>
            <Pane size={80}>
                <Splitpanes horizontal={true}>
                    <Pane size={50} minSize={20} class="border-b border-base-content/10">
                        <SqlEditor bind:value={sqlQuery} />
                    </Pane>
                    <Pane size={50} minSize={20}>
                        <ResultTable />
                    </Pane>
                </Splitpanes>
            </Pane>
        </Splitpanes>
    </div>
    
    <!-- Status Bar (Optional) -->
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

    /* Reset Splitpanes Basic */
    :global(.splitpanes) {
        display: flex;
        width: 100%;
        height: 100%;
    }
    :global(.splitpanes--vertical) {
        flex-direction: row;
    }
    :global(.splitpanes--horizontal) {
        flex-direction: column;
    }
    :global(.splitpanes__pane) {
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    
    /* Custom Modern Theme for Splitpanes */
    :global(.modern-theme .splitpanes__splitter) {
        background-color: transparent;
        position: relative;
        touch-action: none;
        z-index: 10;
        transition: background-color 0.2s ease;
    }

    /* Vertical Splitter (Horizontal Drag) */
    :global(.modern-theme .splitpanes--vertical > .splitpanes__splitter) {
        min-width: 6px;
        cursor: col-resize;
        margin-left: -3px; /* Center overlap */
        margin-right: -3px; 
    }
    /* Horizontal Splitter (Vertical Drag) */
    :global(.modern-theme .splitpanes--horizontal > .splitpanes__splitter) {
        min-height: 6px;
        cursor: row-resize;
        margin-top: -3px;
        margin-bottom: -3px;
    }

    /* Splitter Hover and Active States */
    :global(.modern-theme .splitpanes__splitter:hover),
    :global(.modern-theme .splitpanes__splitter:active) {
        background-color: oklch(var(--p));
    }

    /* Add a visible line indicator */
    :global(.modern-theme .splitpanes__splitter::before) {
        content: '';
        position: absolute;
        background-color: oklch(var(--b3)); /* darker line normally */
        opacity: 0.5;
        transition: all 0.2s;
    }
    
    :global(.modern-theme .splitpanes--vertical > .splitpanes__splitter::before) {
        top: 0; bottom: 0; left: 50%; width: 1px; transform: translateX(-50%);
    }
    :global(.modern-theme .splitpanes--horizontal > .splitpanes__splitter::before) {
         left: 0; right: 0; top: 50%; height: 1px; transform: translateY(-50%);
    }

    /* Highlight line on hover */
    :global(.modern-theme .splitpanes__splitter:hover::before),
    :global(.modern-theme .splitpanes__splitter:active::before) {
        background-color: oklch(var(--p)); 
        opacity: 1;
        width: 2px; /* Thicker on hover */
        height: 2px;
    }
</style>
