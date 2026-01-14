import { writable } from 'svelte/store';
import { browser } from '$app/environment';

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

export interface HistoryItem {
    id: string;
    timestamp: number;
    query: string;
    connectionId: string;
    status: 'success' | 'error';
    duration?: number;
    rowsAffected?: number;
}

// Helper for persistence
function persistedWritable<T>(key: string, initialValue: T) {
    const store = writable<T>(initialValue);
    
    if (browser) {
        const stored = localStorage.getItem(key);
        if (stored) {
            try {
                store.set(JSON.parse(stored));
            } catch (e) {
                console.error(`Failed to parse stored value for ${key}`, e);
            }
        }
        
        store.subscribe(value => {
            if (browser) {
                localStorage.setItem(key, JSON.stringify(value));
            }
        });
    }
    
    return store;
}

export const projects = persistedWritable<Project[]>('projects', [
    { id: 'default', name: 'Default', connections: ['1'] }
]);

export const connections = persistedWritable<Connection[]>('connections', [
    { id: '1', name: 'Demo SQLite', type: 'sqlite', connectionString: './test.db', projectId: 'default' }
]);

export const queryHistory = persistedWritable<HistoryItem[]>('queryHistory', []);

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
    connectionId?: string; // reference to connection
}

export const tabs = writable<Tab[]>([
    { id: 1, type: 'query', name: 'Script-1', value: 'SELECT * FROM sqlite_schema;', connectionId: '1' }
]);
export const activeTabId = writable<number | string>(1);

export const theme = persistedWritable<string>('theme', 'dim'); // default theme
