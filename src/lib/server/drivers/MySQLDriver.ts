import mysql from 'mysql2/promise';
import type { DatabaseDriver, QueryResult, TableInfo, ColumnInfo } from './types';

export class MySQLDriver implements DatabaseDriver {
    private connection: mysql.Connection | null = null;
    private connectionString: string;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async connect(): Promise<void> {
        this.connection = await mysql.createConnection(this.connectionString);
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }

    async execute(query: string): Promise<QueryResult> {
        if (!this.connection) {
            await this.connect();
        }

        try {
            const [rows, fields] = await this.connection!.execute(query);
            if (Array.isArray(rows)) { 
                // It's a select or similar
                const columns = fields?.map(f => f.name) || [];
                // rows is RowDataPacket[]
                return { columns, rows: rows as any[] };
            } else {
                // OkPacket
                const result = rows as any; // mysql2 typing quirk with execute return type
                return { message: `Success. Affected rows: ${result.affectedRows}` };
            }
        } catch (e: any) {
             return { error: e.message || String(e) };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.connection) await this.connect();
        const query = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = DATABASE() 
            AND table_type = 'BASE TABLE'
        `;
        const result = await this.execute(query);
        if (result.rows) {
            // columns might be different case depending on mysql config, usually TABLE_NAME
            // check keys case insensitive
            return result.rows.map((r: any) => {
                const name = r.TABLE_NAME || r.table_name || Object.values(r)[0];
                return { name, type: 'TABLE' };
            });
        }
        return [];
    }

    async getColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.connection) await this.connect();
        const query = `
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY
            FROM information_schema.columns 
            WHERE table_name = '${tableName}' 
            AND table_schema = DATABASE()
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.COLUMN_NAME || r.column_name,
                type: r.DATA_TYPE || r.data_type,
                nullable: (r.IS_NULLABLE || r.is_nullable) === 'YES',
                defaultValue: r.COLUMN_DEFAULT || r.column_default,
                primaryKey: (r.COLUMN_KEY || r.column_key) === 'PRI'
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        if (!this.connection) await this.connect();
        const query = "SHOW FULL TABLES WHERE Table_type = 'VIEW'";
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => {
                const name = r.TABLE_NAME || r.table_name || Object.values(r)[0];
                return { name, type: 'VIEW' };
            });
        }
        return [];
    }

    async getIndexes(): Promise<any[]> {
        if (!this.connection) await this.connect();
        const query = "SELECT DISTINCT TABLE_NAME, INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, INDEX_NAME";
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                 name: r.INDEX_NAME || r.index_name,
                 tableName: r.TABLE_NAME || r.table_name 
            }));
        }
        return [];
    }

    async getDDL(tableName: string): Promise<string> {
        if (!this.connection) await this.connect();
        // MySQL has handy command
        const query = `SHOW CREATE TABLE \`${tableName}\``;
        const result = await this.execute(query);
        if (result.rows && result.rows.length > 0) {
            const row: any = result.rows[0];
            return row['Create Table'] || row['Create View'] || '';
        }
        return '';
    }
}
