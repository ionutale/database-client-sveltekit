import mssql from 'mssql';
import type { DatabaseDriver, QueryResult, TableInfo, ColumnInfo } from './types';

export class MSSQLDriver implements DatabaseDriver {
    private pool: mssql.ConnectionPool | null = null;
    private connectionString: string;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async connect(): Promise<void> {
        this.pool = new mssql.ConnectionPool(this.connectionString);
        await this.pool.connect();
    }

    async disconnect(): Promise<void> {
        if (this.pool) {
            await this.pool.close();
            this.pool = null;
        }
    }

    async execute(query: string): Promise<QueryResult> {
        if (!this.pool) {
            await this.connect();
        }

        try {
            const result = await this.pool!.request().query(query);
            if (result.recordset) {
                const columns = Object.keys(result.recordset.columns || {});
                return { columns, rows: result.recordset };
            } else {
                return { message: `Success. Rows affected: ${result.rowsAffected?.[0] || 0}` };
            }
        } catch (e: any) {
             return { error: e.message || String(e) };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.pool) await this.connect();
        const query = `SELECT TABLE_NAME, TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'`;
        const result = await this.execute(query);
        if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.TABLE_NAME,
                schema: r.TABLE_SCHEMA,
                type: 'TABLE'
            }));
        }
        return [];
    }

    async getColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.pool) await this.connect();
        const query = `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.COLUMN_NAME,
                type: r.DATA_TYPE,
                nullable: r.IS_NULLABLE === 'YES',
                defaultValue: r.COLUMN_DEFAULT,
                primaryKey: false // TODO
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        return []; // Placeholder
    }

    async getIndexes(): Promise<any[]> {
        return []; // Placeholder
    }

    async getDDL(tableName: string): Promise<string> {
        return '';
    }
}
