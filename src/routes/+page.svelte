<script lang="ts">
    import { Splitpanes, Pane } from 'svelte-splitpanes';
    import 'svelte-splitpanes/dist/index.css';
    
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
    :global(.splitpanes__splitter) {
        background-color: var(--fallback-b3,oklch(var(--b3)/1));
        position: relative;
    }
    :global(.splitpanes__splitter:before),
    :global(.splitpanes__splitter:after) {
        background-color: var(--fallback-bc,oklch(var(--bc)/1)); 
    }
</style>
