<script lang="ts">
    import { queryResult } from '$lib/stores';
</script>

<div class="h-full flex flex-col bg-base-100 relative">
    {#if $queryResult.loading}
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-base-100/50 backdrop-blur-sm">
            <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
    {/if}

    {#if $queryResult.error}
        <div class="p-4 h-full flex items-center justify-center">
            <div class="alert alert-error max-w-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="flex flex-col">
                    <span class="font-bold text-xs uppercase opacity-70">Query Error</span>
                    <span class="font-mono text-sm whitespace-pre-wrap">{$queryResult.error}</span>
                </div>
            </div>
        </div>
    {:else if $queryResult.message}
         <div class="p-4 h-full flex items-center justify-center">
            <div class="alert alert-success max-w-lg shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="flex flex-col">
                    <span class="font-bold text-xs uppercase opacity-70">Success</span>
                    <span class="font-mono text-sm">{$queryResult.message}</span>
                </div>
            </div>
        </div>
    {:else if $queryResult.columns?.length > 0}
        <div class="overflow-auto flex-1 bg-base-100">
            <table class="table table-pin-rows table-xs md:table-sm border-separate border-spacing-0 w-full">
                <thead>
                    <tr class="bg-base-200 text-base-content/70">
                         <th class="w-12 bg-base-300/50 text-center font-mono opacity-50">#</th>
                        {#each $queryResult.columns as col}
                            <th class="font-bold border-b border-base-300">{col}</th>
                        {/each}
                    </tr>
                </thead>
                <tbody class="font-mono text-xs md:text-sm">
                    {#each $queryResult.rows as row, i}
                        <tr class="hover:bg-base-200/50 transition-colors">
                            <th class="bg-base-200/30 text-center opacity-50 font-normal select-none">{i + 1}</th>
                            {#each $queryResult.columns as col}
                            <td class="max-w-xs truncate border-b border-base-200/50" title={String(row[col] ?? '')}>
                                {#if row[col] === null}
                                    <span class="text-base-content/30 italic">NULL</span>
                                {:else}
                                    {row[col]}
                                {/if}
                            </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="flex items-center justify-between px-3 py-1 bg-base-200 border-t border-base-300 text-xs text-base-content/60 min-h-8">
            <span>{$queryResult.rows.length} rows retrieved</span>
            <span>Query time: 12ms</span> <!-- Placeholder -->
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center h-full text-base-content/20 gap-4 select-none bg-base-100">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-50">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 16.5h7.5" />
            </svg>
            <div class="flex flex-col items-center">
                <span class="font-bold text-lg opacity-70">No Results</span>
                <span class="text-sm opacity-50">Run a query to see data</span>
            </div>
        </div>
    {/if}
</div>
