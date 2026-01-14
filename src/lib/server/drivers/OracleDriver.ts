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
        // Check for primary keys in the same query or separate? 
        // A subquery for IS_PK is efficient enough for single table.
        const query = `
            SELECT 
                c.column_name, c.data_type, c.nullable, c.data_default,
                (SELECT COUNT(*) 
                 FROM user_constraints cons
                 JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name
                 WHERE cons.constraint_type = 'P'
                   AND cons.table_name = c.table_name
                   AND cols.column_name = c.column_name) as IS_PK
            FROM user_tab_columns c
            WHERE c.table_name = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.COLUMN_NAME || r.column_name,
                type: r.DATA_TYPE || r.data_type,
                nullable: (r.NULLABLE || r.nullable) === 'Y',
                defaultValue: r.DATA_DEFAULT || r.data_default,
                primaryKey: (r.IS_PK || r.is_pk) > 0
            }));
        }
        return [];
    }

    async getViews(): Promise<TableInfo[]> {
        if (!this.connection) await this.connect();
        const query = `SELECT view_name FROM user_views`;
        const result = await this.execute(query);
         if (result.rows) {
            return result.rows.map((r: any) => ({
                name: r.VIEW_NAME || r.view_name,
                type: 'VIEW'
            }));
        }
        return [];
    }

    async getIndexes(tableName?: string): Promise<any[]> {
        if (!this.connection) await this.connect();
        let query = `SELECT index_name, table_name FROM user_indexes`;
        if (tableName) {
            query += ` WHERE table_name = '${tableName}'`;
        }
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
        // Oracle has DBMS_METADATA.GET_DDL
        // We need to return the CLOB. fetchAsString usually handles CLOBs in oracledb if configured, 
        // but let's try basic select.
        const query = `SELECT DBMS_METADATA.GET_DDL('TABLE', '${tableName}') as ddl FROM DUAL`;
        try {
            const result = await this.execute(query);
            if (result.rows && result.rows.length > 0) {
                 const row: any = result.rows[0];
                 return row.DDL || row.ddl || '';
            }
        } catch (e) {
            return `-- Failed to get DDL: ${e}`;
        }
        return '';
    }

    async getPrimaryKeys(tableName: string): Promise<any[]> {
        if (!this.connection) await this.connect();
        const query = `
            SELECT cols.column_name, cols.position
            FROM user_constraints cons
            JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name
            WHERE cons.constraint_type = 'P'
            AND cons.table_name = '${tableName}'
        `;
        const result = await this.execute(query);
        if (result.rows) {
             return result.rows.map((r: any) => ({
                columnName: r.COLUMN_NAME || r.column_name,
                pkPosition: r.POSITION || r.position
             }));
        }
        return [];
    }

    async getForeignKeys(tableName: string): Promise<any[]> {
        if (!this.connection) await this.connect();
        const query = `
            SELECT 
                cols.column_name,
                r_cons.table_name as referenced_table,
                (SELECT column_name FROM user_cons_columns WHERE constraint_name = r_cons.constraint_name AND position = cols.position) as referenced_column,
                cons.constraint_name
            FROM user_constraints cons
            JOIN user_cons_columns cols ON cons.constraint_name = cols.constraint_name
            JOIN user_constraints r_cons ON cons.r_constraint_name = r_cons.constraint_name
            WHERE cons.constraint_type = 'R'
            AND cons.table_name = '${tableName}'
        `;
        const result = await this.execute(query);
         if (result.rows) {
             return result.rows.map((r: any) => ({
                columnName: r.COLUMN_NAME || r.column_name,
                referencedTable: r.REFERENCED_TABLE || r.referenced_table,
                referencedColumn: r.REFERENCED_COLUMN || r.referenced_column,
                fkName: r.CONSTRAINT_NAME || r.constraint_name
             }));
        }
        return [];
    }
}
