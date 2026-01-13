import { json } from '@sveltejs/kit';
import { executeQuery, type DbType } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { type, connectionString, query } = await request.json();
        
        if (!type || !connectionString || !query) {
            return json({ error: 'Missing type, connectionString, or query' }, { status: 400 });
        }

        const result = await executeQuery(type as DbType, connectionString, query);
        return json(result);
    } catch (e: any) {
        return json({ error: e.message }, { status: 500 });
    }
};
