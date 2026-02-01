const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error('DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    const sql = neon(url);
    try {
        const sessions = await sql`SELECT * FROM live_sessions`;
        console.log('LIVE_SESSIONS_COUNT:', sessions.length);
        if (sessions.length > 0) {
            console.log('FIRST_SESSION:', JSON.stringify(sessions[0], null, 2));
        }
    } catch (err) {
        console.error('Database query failed:', err);
    }
}

check();
