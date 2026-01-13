## Plan: SvelteKit Database Client

This plan builds a responsive SQL client (Support for SQLite/PostgreSQL) with a draggable 3-pane layout using SvelteKit, Tailwind, and DaisyUI.

### Steps
1.  **Initialize Project**: Scaffold a barebones SvelteKit app and configure Tailwind CSS with DaisyUI.
2.  **Add Dependencies**: Install `pg` & `better-sqlite3` for databases, `svelte-splitpanes` for the resizable UI, and `svelte-codemirror-editor` for the code area.
3.  **Build Resizable Layout**: Create a page layout using split panes: Sidebar (Left) vs. Main Content (Right), where Main Content is split vertically (Editor vs. Results).
4.  **Create UI Components**: Implement the `ConnectionList` (Sidebar), `SqlEditor` (Code Area), and `ResultTable` (DaisyUI Table for results).
5.  **Implement Backend**: Create SvelteKit API routes to handle database connection testing and query execution for SQLite and PostgreSQL.

### Further Considerations
1.  **Code Editor**: I will use CodeMirror for the "code area" to provide SQL syntax highlighting. Is that acceptable?
2.  **State Management**: We'll use Svelte stores to manage the list of saved connections and the currently active database result.
3.  **Security**: Database credentials will initially be stored in local storage or simple server-side config for this prototype.
