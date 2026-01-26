
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Fetching recent partnerships...');
    try {
        const parts = await sql`
        SELECT id, name, partner_type, created_at 
        FROM partnerships 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
        console.log(parts);
    } catch (e) {
        console.error('Error:', e);
    }
}

main();
