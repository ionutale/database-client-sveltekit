<script lang="ts">
    import { theme } from '$lib/stores';

    const themes = [
        "light",
        "dark",
        "cupcake",
        "bumblebee",
        "emerald",
        "corporate",
        "synthwave",
        "retro",
        "cyberpunk",
        "valentine",
        "halloween",
        "garden",
        "forest",
        "aqua",
        "lofi",
        "pastel",
        "fantasy",
        "wireframe",
        "black",
        "luxury",
        "dracula",
        "cmyk",
        "autumn",
        "business",
        "acid",
        "lemonade",
        "night",
        "coffee",
        "winter",
        "dim",
        "nord",
        "sunset",
    ];

    let { open = $bindable(false) } = $props();

    function handleClose() {
        open = false;
    }
</script>

{#if open}
<div class="modal modal-open">
    <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Settings</h3>
        
        <div class="form-control w-full max-w-xs">
            <label class="label">
                <span class="label-text">Theme</span>
            </label>
            <select bind:value={$theme} class="select select-bordered">
                {#each themes as t}
                    <option value={t}>{t}</option>
                {/each}
            </select>
        </div>

        <div class="modal-action">
            <button class="btn" onclick={handleClose}>Close</button>
        </div>
    </div>
</div>
{/if}
