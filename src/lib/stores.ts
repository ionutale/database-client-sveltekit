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
