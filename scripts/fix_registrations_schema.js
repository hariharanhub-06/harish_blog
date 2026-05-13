const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    const url = process.env.DATABASE_URL;
    const sql = neon(url);
    try {
        console.log('Adding missing columns to session_registrations...');

        // Add columns one by one to avoid total failure if one already exists
        try {
            await sql`ALTER TABLE session_registrations ADD COLUMN join_token TEXT UNIQUE`;
            console.log('Added join_token');
        } catch (e) {
            console.log('join_token skipped:', e.message);
        }

        try {
            await sql`ALTER TABLE session_registrations ADD COLUMN active_session_id TEXT`;
            console.log('Added active_session_id');
        } catch (e) {
            console.log('active_session_id skipped:', e.message);
        }

        try {
            await sql`ALTER TABLE session_registrations ADD COLUMN last_active_at TIMESTAMP`;
            console.log('Added last_active_at');
        } catch (e) {
            console.log('last_active_at skipped:', e.message);
        }

        console.log('Migration completed.');
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

migrate();
