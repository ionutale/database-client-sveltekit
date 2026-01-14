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
            SELECT 
                c.COLUMN_NAME, 
                c.DATA_TYPE, 
                c.IS_NULLABLE, 
                c.COLUMN_DEFAULT,
                CASE WHEN kcu.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END as IS_PK
            FROM INFORMATION_SCHEMA.COLUMNS c
            LEFT JOIN (
                SELECT kcu.TABLE_NAME, kcu.COLUMN_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                    ON kcu.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
                WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
            ) kcu ON c.TABLE_NAME = kcu.TABLE_NAME AND c.COLUMN_NAME = kcu.COLUMN_NAME
            WHERE c.TABLE_NAME = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.COLUMN_NAME,
                type: r.DATA_TYPE,
                nullable: r.IS_NULLABLE === 'YES',
                defaultValue: r.COLUMN_DEFAULT,
                primaryKey: r.IS_PK === 1
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        if (!this.pool) await this.connect();
        const query = `SELECT TABLE_NAME, TABLE_SCHEMA FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'VIEW'`;
        const result = await this.execute(query);
        if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.TABLE_NAME,
                schema: r.TABLE_SCHEMA,
                type: 'VIEW'
            }));
        }
        return [];
    }

    async getIndexes(tableName?: string): Promise<any[]> {
        if (!this.pool) await this.connect();
        let query = `
            SELECT 
                i.name AS name,
                t.name AS tableName
            FROM sys.indexes i
            JOIN sys.tables t ON i.object_id = t.object_id
            WHERE i.type > 0
        `;
        if (tableName) {
            query += ` AND t.name = '${tableName}'`;
        }
        const result = await this.execute(query);
        return result.rows || [];
    }

    async getDDL(tableName: string): Promise<string> {
        return `-- DDL generation not implemented for MSSQL`;
    }

    async getPrimaryKeys(tableName: string): Promise<any[]> {
        if (!this.pool) await this.connect();
        const query = `
            SELECT
                kcu.COLUMN_NAME as columnName,
                kcu.ORDINAL_POSITION as pkPosition
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
                AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
                AND tc.TABLE_NAME = '${tableName}'
        `;
        const result = await this.execute(query);
        return result.rows || [];
    }

    async getForeignKeys(tableName: string): Promise<any[]> {
        if (!this.pool) await this.connect();
        const query = `
            SELECT
                kcu1.COLUMN_NAME as columnName,
                kcu2.TABLE_NAME as referencedTable,
                kcu2.COLUMN_NAME as referencedColumn,
                tc.CONSTRAINT_NAME as fkName
            FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
            JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
                ON rc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu1
                ON rc.CONSTRAINT_NAME = kcu1.CONSTRAINT_NAME
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu2
                ON rc.UNIQUE_CONSTRAINT_NAME = kcu2.CONSTRAINT_NAME
                AND kcu1.ORDINAL_POSITION = kcu2.ORDINAL_POSITION
            WHERE tc.TABLE_NAME = '${tableName}'
        `;
        const result = await this.execute(query);
        return result.rows || [];
    }
}
