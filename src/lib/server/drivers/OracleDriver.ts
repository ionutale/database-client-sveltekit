import oracledb from 'oracledb';
import type { DatabaseDriver, QueryResult, TableInfo, ColumnInfo } from './types';

export class OracleDriver implements DatabaseDriver {
    private connection: oracledb.Connection | null = null;
    private connectionString: string;

    constructor(connectionString: string) {
        this.connectionString = connectionString;
    }

    async connect(): Promise<void> {
        // Oracle connection string handling might need specific parsing or object structure
        // Assuming connectionString is passed in a way that can be used or parsed.
        // For simplicity, we assume the string is the connectString property, and we rely on env vars or other config for user/pass if not embedded?
        // Actually, db.ts previous implementation used { connectionString } as the options object passed to getConnection?
        // Let's re-examine db.ts: `await oracledb.getConnection({ connectionString });`
        // Wait, typical usages are { user, password, connectString }.
        // If the user passes a full URL-like string, it might not work directly as `connectionString` prop.
        // However, I will stick to what was there: `oracledb.getConnection({ connectionString })` 
        // This likely implies using an external config or wallet, or the connectionString is strictly the generic Type 1 string.
        // But `getConnection` takes an object.
        
        // Let's assume the previous code was "correct" for the user's setup or intention, 
        // but typically you need user/password.
        // The user said "connectionString" in db.ts. 
        // `const connection = await oracledb.getConnection({ connectionString });`
        // I will replicate that.
        this.connection = await oracledb.getConnection({ connectionString: this.connectionString });
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
    }

    async execute(query: string): Promise<QueryResult> {
        if (!this.connection) {
            await this.connect();
        }

        try {
            const result = await this.connection!.execute(query);
            if (result.rows) {
                const columns = result.metaData?.map((m: any) => m.name) || [];
                // rows in oracle can be array of arrays or objects depending on outFormat. Default is array.
                // metaData gives names.
                // We should standardise to array of objects if possible, or handle array of arrays.
                // My other drivers return key-value objects?
                // SQLite: returns objects provided by `better-sqlite3`.
                // Postgres: returns objects.
                // MySQL: returns objects (with mysql2/promise).
                // MSSQL: returns objects.
                
                // Oracle default is array. We need generic logic or set outFormat.
                // Let's try to convert if generic, or set outFormat if possible.
                // oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT; // Global setting, or per execute options.
                
                // Let's rely on basic array mapping if we don't change global options to avoid side effects.
                // Actually `result.rows` is array of arrays by default.
                const rows = (result.rows as any[]).map((row: any[]) => {
                    const obj: any = {};
                    columns.forEach((col, i) => {
                        obj[col] = row[i];
                    });
                    return obj;
                });

                return { columns, rows };
            } else {
                return { message: `Success. Rows affected: ${result.rowsAffected || 0}` };
            }
        } catch (e: any) {
             return { error: e.message || String(e) };
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.connection) await this.connect();
        const query = `SELECT table_name FROM user_tables`;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.TABLE_NAME || r.table_name || Object.values(r)[0], // Oracle handles case sensitivity
                type: 'TABLE'
            }));
        }
        return [];
    }

    async getColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.connection) await this.connect();
        const query = `
            SELECT column_name, data_type, nullable, data_default
            FROM user_tab_columns
            WHERE table_name = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.COLUMN_NAME || r.column_name,
                type: r.DATA_TYPE || r.data_type,
                nullable: (r.NULLABLE || r.nullable) === 'Y',
                defaultValue: r.DATA_DEFAULT || r.data_default,
                primaryKey: false // TODO
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        return [];
    }

    async getIndexes(): Promise<any[]> {
        return [];
    }

    async getDDL(tableName: string): Promise<string> {
        return '';
    }
}
