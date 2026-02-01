const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function addDefault() {
    const url = process.env.DATABASE_URL;
    const sql = neon(url);
    try {
        console.log('Setting default for join_token column...');

        // PostgreSQL doesn't support adding default to existing column easily
        // But we can create a trigger or handle it at application level
        // For now, let's just ensure all NULL tokens get a value

        const result = await sql`
      UPDATE session_registrations 
      SET join_token = gen_random_uuid()::text 
      WHERE join_token IS NULL
    `;

        console.log('Default values applied to any NULL tokens');
    } catch (err) {
        console.error('Failed:', err);
    }
}

addDefault();
