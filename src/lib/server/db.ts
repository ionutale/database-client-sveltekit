import Database from 'better-sqlite3';
import pg from 'pg';
import mysql from 'mysql2/promise';
import mssql from 'mssql';
import oracledb from 'oracledb';

export type DbType = 'sqlite' | 'postgres' | 'mysql' | 'mssql' | 'oracle';

export interface QueryResult {
    columns?: string[];
    rows?: any[];
    message?: string;
    error?: string;
}

export async function executeQuery(type: DbType, connectionString: string, query: string): Promise<QueryResult> {
    try {
        if (type === 'sqlite') {
            const db = new Database(connectionString, { readonly: false });
            try {
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
        } else if (type === 'mysql') {
            const connection = await mysql.createConnection(connectionString);
            try {
                const [rows, fields] = await connection.execute(query);
                if (Array.isArray(rows) && rows.length > 0 && typeof rows[0] === 'object') {
                    const columns = fields.map(f => f.name);
                    return { columns, rows };
                } else {
                    const affectedRows = (rows as any)?.affectedRows || 0;
                    return { message: `Success. Affected rows: ${affectedRows}` };
                }
            } finally {
                await connection.end();
            }
        } else if (type === 'mssql') {
            const pool = new mssql.ConnectionPool(connectionString);
            await pool.connect();
            try {
                const result = await pool.request().query(query);
                if (result.recordset) {
                    const columns = Object.keys(result.recordset.columns || {});
                    return { columns, rows: result.recordset };
                } else {
                    return { message: `Success. Rows affected: ${result.rowsAffected?.[0] || 0}` };
                }
            } finally {
                await pool.close();
            }
        } else if (type === 'oracle') {
            const connection = await oracledb.getConnection({ connectionString });
            try {
                const result = await connection.execute(query);
                if (result.rows) {
                    const columns = result.metaData?.map((m: any) => m.name) || [];
                    return { columns, rows: result.rows };
                } else {
                    return { message: `Success. Rows affected: ${result.rowsAffected || 0}` };
                }
            } finally {
                await connection.close();
            }
        }
        throw new Error(`Unsupported DB type: ${type}`);
    } catch (e: any) {
        return { error: e.message || String(e) };
    }
}
