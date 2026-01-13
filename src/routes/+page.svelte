<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    
    import ConnectionList from '$lib/components/ConnectionList.svelte';
    import SqlEditor from '$lib/components/SqlEditor.svelte';
    import ResultTable from '$lib/components/ResultTable.svelte';

    let sqlQuery = $state("SELECT * FROM sqlite_master;");
</script>

<div class="h-[calc(100vh-0px)] w-full">
    <Splitpanes class="default-theme" horizontal={false}>
        <Pane size={20} minSize={15}>
            <ConnectionList />
        </Pane>
        <Pane>
            <Splitpanes horizontal={true}>
                <Pane size={50}>
                    <SqlEditor bind:value={sqlQuery} />
                </Pane>
                <Pane size={50}>
                    <ResultTable />
                </Pane>
            </Splitpanes>
        </Pane>
    </Splitpanes>
</div>

<style>
    /* Customize splitpanes if needed */
    :global(.splitpanes.default-theme .splitpanes__pane) {
        background-color: var(--fallback-b1,oklch(var(--b1)/1));
    }
    :global(.splitpanes.default-theme .splitpanes__splitter) {
        background-color: var(--fallback-b3,oklch(var(--b3)/1));
        border-color: var(--fallback-b3,oklch(var(--b3)/1));
        min-width: 6px;
        min-height: 6px;
    }
    
    :global(.splitpanes.default-theme .splitpanes__splitter:hover) {
        background-color: var(--fallback-bc,oklch(var(--bc)/0.2));
    }

    :global(.splitpanes.default-theme .splitpanes__splitter:before),
    :global(.splitpanes.default-theme .splitpanes__splitter:after) {
        background-color: var(--fallback-bc,oklch(var(--bc)/0.5)); 
    }
</style>
