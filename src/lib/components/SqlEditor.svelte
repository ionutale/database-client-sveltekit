<script lang="ts">
    import CodeMirror from "svelte-codemirror-editor";
    import { sql } from "@codemirror/lang-sql";

    let { value = $bindable("SELECT * FROM users;") } = $props();
</script>

<div class="h-full w-full border-b border-base-300">
    <CodeMirror
        bind:value
        lang={sql()}
        styles={{ "&": { height: "100%", width: "100%" } }}
    />
</div>
