import Database from 'better-sqlite3';
import type { DatabaseDriver, QueryResult, TableInfo, ColumnInfo } from './types';

export class SQLiteDriver implements DatabaseDriver {
    private db: Database.Database | null = null;
    private connectionString: string;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async connect(): Promise<void> {
        // better-sqlite3 is synchronous, but we keep the async signature for interface consistency
        this.db = new Database(this.connectionString, { readonly: false });
    }

    async disconnect(): Promise<void> {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }

    async execute(query: string): Promise<QueryResult> {
        if (!this.db) {
            await this.connect();
        }
        
        try {
            const stmt = this.db!.prepare(query);
            if (stmt.reader) {
                const rows = stmt.all();
                const columns = stmt.columns().map(c => c.name);
                return { columns, rows };
            } else {
                const info = stmt.run();
                return { message: `Success. Changes: ${info.changes}, Last ID: ${info.lastInsertRowid}` };
            }
        } catch (e: any) {
            return { error: e.message || String(e) };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.db) await this.connect();
        const query = `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
        const result = await this.execute(query);
        if (result.rows) {
            return result.rows.map((r: any) => ({ name: r.name, type: 'TABLE' }));
        }
        return [];
    }

    async getColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.db) await this.connect();
        // PRAGMA table_info returns: cid, name, type, notnull, dflt_value, pk
        const query = `PRAGMA table_info("${tableName}")`;
        const result = await this.execute(query);
        
        if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.name,
                type: r.type,
                nullable: r.notnull === 0,
                defaultValue: r.dflt_value,
                primaryKey: r.pk > 0
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        if (!this.db) await this.connect();
        const query = "SELECT name FROM sqlite_schema WHERE type='view' ORDER BY name";
        const result = await this.execute(query);
        if (result.rows) {
           return result.rows.map((r: any) => ({ name: r.name, type: 'VIEW' }));
        }
        return [];
    }

    async getIndexes(tableName?: string): Promise<any[]> {
        if (!this.db) await this.connect();
        let query = "SELECT name, tbl_name FROM sqlite_schema WHERE type='index'";
        if (tableName) {
            query += ` AND tbl_name = '${tableName}'`;
        }
        query += " ORDER BY name";
        
        const result = await this.execute(query);
        if(result.rows) {
            return result.rows.map((r:any) => ({ name: r.name, tableName: r.tbl_name}));
        }
        return [];
    }

    async getDDL(tableName: string): Promise<string> {
        if (!this.db) await this.connect();
        const query = `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`;
        const result = await this.execute(query);
        if (result.rows && result.rows.length > 0) {
            return result.rows[0].sql;
        }
        return '';
    }

    async getPrimaryKeys(tableName: string): Promise<any[]> {
        if (!this.db) await this.connect();
        const query = `PRAGMA table_info("${tableName}")`;
        const result = await this.execute(query);
        if (result.rows) {
             return result.rows
                .filter((r: any) => r.pk > 0)
                .map((r: any) => ({
                    columnName: r.name,
                    pkPosition: r.pk
                }));
        }
        return [];
    }

    async getForeignKeys(tableName: string): Promise<any[]> {
        if (!this.db) await this.connect();
        const query = `PRAGMA foreign_key_list("${tableName}")`;
        const result = await this.execute(query);
        if (result.rows) {
            // id, seq, table, from, to, on_update, on_delete, match
             return result.rows.map((r: any) => ({
                id: r.id,
                columnName: r.from,
                referencedTable: r.table,
                referencedColumn: r.to,
                onUpdate: r.on_update,
                onDelete: r.on_delete
             }));
        }
        return [];
    }
}
