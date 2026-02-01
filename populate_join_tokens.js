const { neon } = require('@neondatabase/serverless');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

async function fixTokens() {
    const url = process.env.DATABASE_URL;
    const sql = neon(url);
    try {
        // Get all registrations without tokens
        const registrations = await sql`SELECT id FROM session_registrations WHERE join_token IS NULL`;

        console.log(`Found ${registrations.length} registrations without tokens`);

        for (const reg of registrations) {
            const token = crypto.randomUUID();
            await sql`UPDATE session_registrations SET join_token = ${token} WHERE id = ${reg.id}`;
            console.log(`Updated registration ${reg.id} with token`);
        }

        console.log('All registrations now have tokens!');
    } catch (err) {
        console.error('Failed:', err);
    }
}

fixTokens();
