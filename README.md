# Database Client (SvelteKit)

A SQL client built with SvelteKit, supporting SQLite and PostgreSQL.

## Features
- Resizable 3-pane layout (Sidebar, Code Editor, Results).
- SQL handling via `better-sqlite3` and `pg`.
- Monaco-like editing with `svelte-codemirror-editor`.

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Seed test database:
   ```bash
   node seed.js
   ```

3. Run development server:
   ```bash
   pnpm dev
   ```

## Usage
- Open the app.
- Select a connection from the sidebar (e.g. "Demo SQLite").
- Write SQL in the middle pane.
- Click "Run" or press `Ctrl/Cmd + Enter`.
