import { writable } from 'svelte/store';

export type DbType = 'sqlite' | 'postgres' | 'mysql' | 'mssql' | 'oracle';

export interface Project {
    id: string;
    name: string;
    connections: string[]; // connection ids
}

export interface Connection {
    id: string;
    name: string;
    type: DbType;
    connectionString: string;
    projectId?: string;
}

export const projects = writable<Project[]>([
    { id: 'default', name: 'Default', connections: ['1'] }
]);

export const connections = writable<Connection[]>([
    { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db', projectId: 'default' }
]);

export const activeConnection = writable<Connection | null>(null); // for backward compatibility, but will deprecate

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
    connectionId?: string; // reference to connection
}

export const tabs = writable<Tab[]>([
    { id: 1, type: 'query', name: 'Script-1', value: 'SELECT * FROM sqlite_master;', connectionId: '1' }
]);
export const activeTabId = writable<number | string>(1);
