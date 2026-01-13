<script lang="ts">
    import { activeConnection } from '$lib/stores';

    let { 
        onrun = () => {}, 
        onnewtab = () => {}, 
        ontoggleRight = () => {},
        ontoggleSidebar = () => {}
    }: {
        onrun?: () => void;
        onnewtab?: () => void;
        ontoggleRight?: () => void;
        ontoggleSidebar?: () => void;
    } = $props();
</script>

<div class="h-10 glass-header flex items-center px-2 gap-1 select-none border-b border-base-300/50 shadow-sm">
    <!-- Left toolbar buttons -->
    <div class="flex items-center gap-1">
        <button class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" title="Toggle Sidebar" onclick={ontoggleSidebar}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>

        <div class="w-px h-5 bg-base-300/50 mx-1"></div>
        
        <button class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" title="New Connection">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
        </button>
        
        <button class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" title="New SQL Editor" onclick={onnewtab}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
        </button>

        <div class="w-px h-5 bg-base-300/50 mx-1"></div>
        
        <button class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" title="Save" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
        </button>
    </div>

    <div class="w-px h-5 bg-base-300/50 mx-1"></div>

    <!-- Execute buttons -->
    <div class="flex items-center gap-1">
        <button 
            class="btn btn-xs gap-1 bg-success/90 hover:bg-success text-success-content border-none shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
            onclick={onrun}
            disabled={!$activeConnection}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
            Execute
        </button>
        
        <button class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" title="Execute Script" disabled>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
            </svg>
        </button>
    </div>

    <!-- Spacer -->
    <div class="flex-1"></div>

    <!-- Connection indicator -->
    <div class="flex items-center gap-2">
        {#if $activeConnection}
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-300/60 text-xs text-base-content border border-base-content/10 shadow-inner backdrop-blur-sm">
                <div class="w-2 h-2 rounded-full bg-success animate-pulse shadow-sm"></div>
                <span class="font-medium truncate max-w-32">{$activeConnection.name}</span>
            </div>
        {:else}
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-base-300/30 text-xs text-base-content/50 border border-base-content/5 backdrop-blur-sm">
                <div class="w-2 h-2 rounded-full bg-base-content/30"></div>
                <span>No Connection</span>
            </div>
        {/if}

        <div class="w-px h-5 bg-base-300/50 mx-1"></div>

        <button 
            class="btn btn-ghost btn-xs text-base-content hover:bg-base-300/60 transition-all duration-200 hover:scale-105" 
            title="Toggle Properties"
            onclick={ontoggleRight}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
        </button>
    </div>
</div>
