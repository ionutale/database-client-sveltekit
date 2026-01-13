<script lang="ts">
    import { queryResult } from '$lib/stores';

    let { 
        result = null
    } : { result?: { rows: any[], columns: string[], loading?: boolean } | null } = $props();

    let activeResult = $derived(result ?? $queryResult);

    let sortColumn = $state<string | null>(null);
    let sortDirection = $state<'asc' | 'desc'>('asc');
    let searchTerm = $state('');

    function toggleSort(column: string) {
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
    }

    function getSortedRows() {
        if (!activeResult.rows || !sortColumn) return activeResult.rows || [];

        return [...activeResult.rows].sort((a, b) => {
            const aVal = a[sortColumn!];
            const bVal = b[sortColumn!];

            // Handle null values
            if (aVal === null && bVal === null) return 0;
            if (aVal === null) return sortDirection === 'asc' ? -1 : 1;
            if (bVal === null) return sortDirection === 'asc' ? 1 : -1;

            // Handle different data types
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
            }

            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();

            if (sortDirection === 'asc') {
                return aStr.localeCompare(bStr);
            } else {
                return bStr.localeCompare(aStr);
            }
        });
    }

    function getFilteredRows() {
        const rows = getSortedRows();
        if (!searchTerm) return rows;

        return rows.filter(row =>
            activeResult.columns?.some(col =>
                String(row[col] ?? '').toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    function exportToCSV() {
        const rows = getFilteredRows();
        if (!rows.length || !activeResult.columns) return;

        const headers = activeResult.columns.join(',');
        const csvData = rows.map(row =>
            activeResult.columns!.map(col => {
                const value = row[col];
                // Escape commas and quotes in CSV
                const str = String(value ?? '');
                return str.includes(',') || str.includes('"') || str.includes('\n')
                    ? `"${str.replace(/"/g, '""')}"`
                    : str;
            }).join(',')
        ).join('\n');

        const csv = `${headers}\n${csvData}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'query_results.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    function copyToClipboard() {
        const rows = getFilteredRows();
        if (!rows.length || !activeResult.columns) return;

        const headers = activeResult.columns.join('\t');
        const tsvData = rows.map(row =>
            activeResult.columns!.map(col => String(row[col] ?? '')).join('\t')
        ).join('\n');

        const tsv = `${headers}\n${tsvData}`;
        navigator.clipboard.writeText(tsv);
    }

    let filteredRows = $derived(getFilteredRows());
</script>

<div class="h-full flex flex-col bg-base-100/80 backdrop-blur-sm relative">
    {#if activeResult.loading}
        <div class="absolute inset-0 z-10 flex items-center justify-center bg-base-100/50 backdrop-blur-sm rounded-lg">
            <div class="flex flex-col items-center gap-3">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <span class="text-sm text-base-content/60">Executing query...</span>
            </div>
        </div>
    {/if}

    {#if activeResult.error}
        <div class="p-6 h-full flex items-center justify-center">
            <div class="alert alert-error max-w-lg shadow-lg border border-error/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="flex flex-col">
                    <span class="font-bold text-sm uppercase opacity-80">Query Error</span>
                    <span class="font-mono text-sm whitespace-pre-wrap mt-1">{activeResult.error}</span>
                </div>
            </div>
        </div>
    {:else if activeResult.message}
         <div class="p-6 h-full flex items-center justify-center">
            <div class="alert alert-success max-w-lg shadow-lg border border-success/20">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div class="flex flex-col">
                    <span class="font-bold text-sm uppercase opacity-80">Success</span>
                    <span class="font-mono text-sm mt-1">{activeResult.message}</span>
                </div>
            </div>
        </div>
    {:else if activeResult.columns?.length > 0}
        <!-- Toolbar -->
        <div class="h-10 bg-base-200/80 backdrop-blur-md border-b border-base-300/50 flex items-center px-3 gap-3 shadow-sm">
            <div class="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-base-content/60">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    bind:value={searchTerm}
                    placeholder="Search results..."
                    class="input input-xs input-bordered bg-base-100/50 border-base-300/50 focus:border-primary/50 transition-all duration-200"
                />
            </div>

            <div class="flex items-center gap-1">
                <button
                    onclick={exportToCSV}
                    class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105"
                    title="Export to CSV"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                </button>
                <button
                    onclick={copyToClipboard}
                    class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105"
                    title="Copy to clipboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                    </svg>
                </button>
            </div>

            <div class="flex-1"></div>

            <div class="text-xs text-base-content/60 bg-base-300/50 px-2 py-1 rounded">
                {filteredRows.length} of {activeResult.rows?.length ?? 0} rows
            </div>
        </div>

        <!-- Results Table -->
        <div class="overflow-auto flex-1 bg-base-100/50">
            <table class="table table-pin-rows table-xs md:table-sm border-separate border-spacing-0 w-full">
                <thead>
                    <tr class="bg-base-200/80 backdrop-blur-md text-base-content/70 border-b border-base-300/50">
                         <th class="w-12 bg-base-300/50 text-center font-mono opacity-60 border-r border-base-300/30">#</th>
                        {#each activeResult.columns as col}
                            <th class="font-bold border-b border-base-300/30 py-3 px-4">
                                <button
                                    onclick={() => toggleSort(col)}
                                    class="flex items-center gap-2 hover:text-base-content transition-colors duration-200 group w-full text-left"
                                >
                                    <span class="truncate">{col}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"
                                         class="w-3 h-3 opacity-40 group-hover:opacity-70 transition-all duration-200
                                                {sortColumn === col ? 'text-primary' : ''} 
                                                {sortColumn === col && sortDirection === 'desc' ? 'rotate-180' : ''}">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                    </svg>
                                </button>
                            </th>
                        {/each}
                    </tr>
                </thead>
                <tbody class="font-mono text-xs md:text-sm">
                    {#each filteredRows as row, i}
                        <tr class="hover:bg-primary/5 transition-all duration-150 group border-b border-base-200/30">
                            <th class="bg-base-200/30 text-center opacity-50 font-normal select-none border-r border-base-300/20 group-hover:bg-base-200/50">{i + 1}</th>
                            {#each activeResult.columns as col}
                            <td class="max-w-xs truncate border-b border-base-200/20 group-hover:border-primary/20 px-4 py-2" title={String(row[col] ?? '')}>
                                {#if row[col] === null}
                                    <span class="text-base-content/30 italic bg-base-300/30 px-2 py-0.5 rounded text-xs border border-base-300/20">NULL</span>
                                {:else if typeof row[col] === 'number'}
                                    <span class="text-secondary font-semibold bg-secondary/10 px-2 py-0.5 rounded text-xs">{row[col]}</span>
                                {:else if typeof row[col] === 'boolean'}
                                    <span class="badge badge-xs {row[col] ? 'badge-success' : 'badge-error'} font-medium">
                                        {row[col] ? 'TRUE' : 'FALSE'}
                                    </span>
                                {:else}
                                    <span class="text-base-content">{row[col]}</span>
                                {/if}
                            </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-4 py-2 bg-base-200/60 border-t border-base-300/50 text-xs text-base-content/60 min-h-8 backdrop-blur-sm">
            <div class="flex items-center gap-4">
                <span>Query executed successfully</span>
                {#if activeResult.rows && activeResult.rows.length > 0}
                    <span class="text-primary font-medium">
                        {activeResult.rows.length} row{activeResult.rows.length === 1 ? '' : 's'} returned
                    </span>
                {/if}
            </div>
            <div class="flex items-center gap-4">
                <span>Execution time: 12ms</span>
                <span class="bg-base-300/50 px-2 py-0.5 rounded text-[10px] font-medium">
                    {activeResult.columns?.length ?? 0} column{activeResult.columns?.length === 1 ? '' : 's'}
                </span>
            </div>
        </div>
    {:else}
        <div class="flex flex-col items-center justify-center h-full text-base-content/20 gap-4 select-none bg-base-100/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-12 h-12 opacity-30">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M13.125 16.5h7.5" />
            </svg>
            <div class="flex flex-col items-center">
                <span class="font-bold text-lg opacity-70">No Results</span>
                <span class="text-sm opacity-50">Run a query to see data</span>
            </div>
        </div>
    {/if}
</div>
