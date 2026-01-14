import { DriverFactory, type DbType } from './drivers/DriverFactory';
// Re-export types for compatibility
export type { DbType };
export type { QueryResult } from './drivers/types';

export async function executeQuery(type: DbType, connectionString: string, query: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        const result = await driver.execute(query);
        return result;
    } finally {
        await driver.disconnect();
    }
}

export async function getTables(type: DbType, connectionString: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        return await driver.getTables();
    } finally {
        await driver.disconnect();
    }
}

export async function getColumns(type: DbType, connectionString: string, tableName: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        return await driver.getColumns(tableName);
    } finally {
        await driver.disconnect();
    }
}

export async function getViews(type: DbType, connectionString: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        return await driver.getViews();
    } finally {
        await driver.disconnect();
    }
}

export async function getIndexes(type: DbType, connectionString: string, tableName?: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        return await driver.getIndexes(tableName);
    } finally {
        await driver.disconnect();
    }
}

export async function getDDL(type: DbType, connectionString: string, tableName: string) {
    const driver = DriverFactory.createDriver(type, connectionString);
    try {
        await driver.connect();
        return await driver.getDDL(tableName);
    } finally {
        await driver.disconnect();
    }
}
