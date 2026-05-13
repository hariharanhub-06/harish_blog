const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const url = process.env.DATABASE_URL;
    const sql = neon(url);
    try {
        const registrations = await sql`SELECT user_email, join_token, status FROM session_registrations`;
        console.log('REGISTRATIONS:');
        registrations.forEach(r => {
            console.log(`Email: ${r.user_email}`);
            console.log(`  Token: ${r.join_token || 'NULL'}`);
            console.log(`  Status: ${r.status}`);
            console.log('---');
        });
    } catch (err) {
        console.error('Failed:', err);
    }
}

check();
