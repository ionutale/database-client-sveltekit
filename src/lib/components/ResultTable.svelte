<script lang="ts">
    import { queryResult } from '$lib/stores';
</script>

<div class="h-full flex flex-col bg-base-100">
    {#if $queryResult.loading}
        <div class="flex items-center justify-center h-full text-base-content/50">
            <span class="loading loading-spinner loading-lg"></span>
        </div>
    {:else if $queryResult.error}
        <div class="p-4 text-error bg-error/10 h-full font-mono text-sm whitespace-pre-wrap">
            {$queryResult.error}
        </div>
    {:else if $queryResult.message}
         <div class="p-4 text-success bg-success/10 h-full font-mono text-sm">
            {$queryResult.message}
        </div>
    {:else if $queryResult.columns?.length > 0}
        <div class="overflow-auto flex-1">
            <table class="table table-pin-rows table-xs md:table-sm">
                <thead>
                    <tr>
                         <th class="bg-base-200 w-12">#</th>
                        {#each $queryResult.columns as col}
                            <th class="bg-base-200">{col}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody>
                    {#each $queryResult.rows as row, i}
                        <tr class="hover">
                            <th class="bg-base-100/50">{i + 1}</th>
                            {#each $queryResult.columns as col}
                            <td class="max-w-xs truncate" title={String(row[col] ?? '')}>
                                {row[col] === null ? 'NULL' : row[col]}
                            </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="p-1 text-xs text-base-content/50 border-t bg-base-200 px-2 min-h-6 flex items-center">
            {$queryResult.rows.length} rows
        </div>
    {:else}
        <div class="flex items-center justify-center h-full text-base-content/30 italic select-none">
            No results to display
        </div>
    {/if}
</div>
