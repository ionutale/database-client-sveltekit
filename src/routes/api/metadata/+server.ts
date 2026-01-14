import { json } from '@sveltejs/kit';
import { getTables, getColumns, getViews, getIndexes, getDDL, getPrimaryKeys, getForeignKeys, type DbType } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { action, type, connectionString, tableName } = await request.json();
        
        if (!action || !type || !connectionString) {
            return json({ error: 'Missing required parameters' }, { status: 400 });
        }

        let result;
        switch (action) {
            case 'list-tables':
                result = await getTables(type as DbType, connectionString);
                break;
            case 'list-columns':
                if (!tableName) return json({ error: 'Missing tableName' }, { status: 400 });
                result = await getColumns(type as DbType, connectionString, tableName);
                break;
            case 'list-views':
                result = await getViews(type as DbType, connectionString);
                break;
            case 'list-indexes':
                // getIndexes now accepts tableName optional
                // I need to update getIndexes signature in db.ts to accept it too?
                // yes I should check db.ts
                result = await getIndexes(type as DbType, connectionString, tableName);
                break;
            case 'get-ddl':
                if (!tableName) return json({ error: 'Missing tableName' }, { status: 400 });
                result = await getDDL(type as DbType, connectionString, tableName);
                break;
            case 'list-primary-keys':
                if (!tableName) return json({ error: 'Missing tableName' }, { status: 400 });
                result = await getPrimaryKeys(type as DbType, connectionString, tableName);
                break;
           case 'list-foreign-keys':
                if (!tableName) return json({ error: 'Missing tableName' }, { status: 400 });
                result = await getForeignKeys(type as DbType, connectionString, tableName);
                break;
            default:
                return json({ error: 'Invalid action' }, { status: 400 });
        }
        
        return json(result);
    } catch (e: any) {
        console.error(e);
        return json({ error: e.message }, { status: 500 });
    }
};
