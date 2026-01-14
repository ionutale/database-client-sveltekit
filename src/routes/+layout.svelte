<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import { theme } from '$lib/stores';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

	let { children } = $props();

    $effect(() => {
        if (browser) {
            document.documentElement.setAttribute('data-theme', $theme);
        }
    });
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
