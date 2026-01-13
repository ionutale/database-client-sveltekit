import { writable } from 'svelte/store';

export interface Connection {
    id: string;
    name: string;
    type: 'sqlite' | 'postgres';
    connectionString: string;
}

export const activeConnection = writable<Connection | null>(null);

export interface QueryResultState {
    columns: string[];
    rows: any[];
    message?: string;
    error?: string;
    loading?: boolean;
}

export const queryResult = writable<QueryResultState>({ columns: [], rows: [] });

export interface Tab {
    id: number | string;
    type: 'query' | 'table';
    name: string;
    // Query specific
    value?: string;
    // Table specific
    tableName?: string;
    connection?: Connection;
}

export const tabs = writable<Tab[]>([
    { id: 1, type: 'query', name: 'Script-1', value: 'SELECT * FROM sqlite_master;' }
]);
export const activeTabId = writable<number | string>(1);
