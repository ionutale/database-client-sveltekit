import { SQLiteDriver } from './SQLiteDriver';
import { PostgresDriver } from './PostgresDriver';
import { MySQLDriver } from './MySQLDriver';
import { MSSQLDriver } from './MSSQLDriver';
import { OracleDriver } from './OracleDriver';
import type { DatabaseDriver } from './types';

export type DbType = 'sqlite' | 'postgres' | 'mysql' | 'mssql' | 'oracle';

export class DriverFactory {
    static createDriver(type: DbType, connectionString: string): DatabaseDriver {
        switch (type) {
            case 'sqlite':
                return new SQLiteDriver(connectionString);
            case 'postgres':
                return new PostgresDriver(connectionString);
            case 'mysql':
                return new MySQLDriver(connectionString);
            case 'mssql':
                return new MSSQLDriver(connectionString);
            case 'oracle':
                return new OracleDriver(connectionString);
            default:
                throw new Error(`Unsupported DB type: ${type}`);
        }
    }
}
