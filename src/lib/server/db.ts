import Database from 'better-sqlite3';
import pg from 'pg';

export type DbType = 'sqlite' | 'postgres';

export interface QueryResult {
    columns?: string[];
    rows?: any[];
    message?: string;
    error?: string;
}

export async function executeQuery(type: DbType, connectionString: string, query: string): Promise<QueryResult> {
    try {
        if (type === 'sqlite') {
            const db = new Database(connectionString, { readonly: false }); // Open read-write
            try {
                // simple heuristic for multiple statements or just one.
                // better-sqlite3 prepare() takes one statement. 
                const stmt = db.prepare(query);
                if (stmt.reader) {
                    const rows = stmt.all();
                    const columns = stmt.columns().map(c => c.name);
                    return { columns, rows };
                } else {
                    const info = stmt.run();
                    return { message: `Success. Changes: ${info.changes}, Last ID: ${info.lastInsertRowid}` };
                }
            } finally {
                db.close();
            }
        } else if (type === 'postgres') {
            const client = new pg.Client({ connectionString });
            await client.connect();
            try {
                const result = await client.query(query);
                if (result.command === 'SELECT' || result.rows.length > 0) {
                     const columns = result.fields.map(f => f.name);
                     return { columns, rows: result.rows };
                } else {
                    return { message: `Success. ${result.command} completed. Row count: ${result.rowCount}` };
                }
            } finally {
                await client.end();
            }
        }
        throw new Error(`Unsupported DB type: ${type}`);
    } catch (e: any) {
        return { error: e.message || String(e) };
    }
}
