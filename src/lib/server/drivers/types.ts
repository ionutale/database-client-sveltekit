export interface QueryResult {
    columns?: string[];
    rows?: any[];
    message?: string;
    error?: string;
}

export interface TableInfo {
    name: string;
    schema?: string;
    type?: string; // 'TABLE' | 'VIEW'
}

export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    defaultValue?: string;
    primaryKey: boolean;
}

export interface DatabaseDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    execute(query: string): Promise<QueryResult>;
    getTables(): Promise<TableInfo[]>;
    getColumns(tableName: string): Promise<ColumnInfo[]>;
    getViews(): Promise<TableInfo[]>;
    getIndexes(tableName?: string): Promise<any[]>;
    getDDL(tableName: string): Promise<string>;
    getPrimaryKeys(tableName: string): Promise<any[]>;
    getForeignKeys(tableName: string): Promise<any[]>;
}
    // getPrimaryKeys(tableName: string): Promise<any[]>;
    // getForeignKeys(tableName: string): Promise<any[]>;
    // getIndexes(tableName: string): Promise<any[]>;
}
