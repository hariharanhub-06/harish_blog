
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Adding logo columns to experience, education, and volunteering tables...');
    try {
        await sql`ALTER TABLE experience ADD COLUMN IF NOT EXISTS logo text;`;
        console.log('Added logo to experience');

        await sql`ALTER TABLE education ADD COLUMN IF NOT EXISTS logo text;`;
        console.log('Added logo to education');

        await sql`ALTER TABLE volunteering ADD COLUMN IF NOT EXISTS logo text;`;
        console.log('Added logo to volunteering');

        console.log('Success.');
    } catch (e) {
        console.error('Error executing statement:', e);
    }
}

main();
