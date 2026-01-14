import pg from 'pg';
import type { DatabaseDriver, QueryResult, TableInfo, ColumnInfo } from './types';

export class PostgresDriver implements DatabaseDriver {
    private client: pg.Client | null = null;
    private connectionString: string;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async connect(): Promise<void> {
        this.client = new pg.Client({ connectionString: this.connectionString });
        await this.client.connect();
    }

    async disconnect(): Promise<void> {
        if (this.client) {
            await this.client.end();
            this.client = null;
        }
    }

    async execute(query: string): Promise<QueryResult> {
        if (!this.client) {
            await this.connect();
        }

        try {
            const result = await this.client!.query(query);
            if (result.command === 'SELECT' || (result.rows && result.rows.length > 0)) {
                const columns = result.fields.map(f => f.name);
                return { columns, rows: result.rows };
            } else {
                return { message: `Success. ${result.command} completed. Row count: ${result.rowCount}` };
            }
        } catch (e: any) {
             return { error: e.message || String(e) };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.client) await this.connect();
        const query = `
            SELECT table_name, table_schema 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
            AND table_type = 'BASE TABLE'
        `;
        const result = await this.execute(query);
        if (result.rows) {
            return result.rows.map((r: any) => ({ 
                name: r.table_name, 
                schema: r.table_schema,
                type: 'TABLE' 
            }));
        }
        return [];
    }

    async getColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.client) await this.connect();
        // Simple implementation, assumes public schema or search path for now
        // A better implementation would require schema name to be passed or parsed
        const query = `
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.column_name,
                type: r.data_type,
                nullable: r.is_nullable === 'YES',
                defaultValue: r.column_default,
                primaryKey: false // TODO: fetch PK info separately or via join
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        if (!this.client) await this.connect();
        const query = "SELECT viewname FROM pg_views WHERE schemaname = 'public' ORDER BY viewname";
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({ name: r.viewname, type: 'VIEW' }));
        }
        return [];
    }

    async getIndexes(): Promise<any[]> {
        if (!this.client) await this.connect();
        const query = "SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY indexname";
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({ name: r.indexname, tableName: r.tablename }));
        }
        return [];
    }

    async getDDL(tableName: string): Promise<string> {
        return `-- DDL for ${tableName} (Not implemented for Postgres yet)`;
    }
}
