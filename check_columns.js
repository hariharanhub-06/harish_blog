const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function check() {
    const url = process.env.DATABASE_URL;
    const sql = neon(url);
    try {
        const tableCols = await sql`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name IN ('live_sessions', 'session_registrations')
    `;

        const schema = {
            live_sessions: ['id', 'title', 'description', 'price', 'start_time', 'duration', 'meeting_link', 'poster_url', 'status', 'is_published', 'created_at', 'updated_at'],
            session_registrations: ['id', 'session_id', 'user_name', 'user_email', 'user_mobile', 'razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'amount_paid', 'status', 'join_token', 'active_session_id', 'last_active_at', 'registered_at']
        };

        for (const [table, expected] of Object.entries(schema)) {
            console.log(`Checking ${table}...`);
            const actual = tableCols.filter(c => c.table_name === table).map(c => c.column_name);
            const missing = expected.filter(e => !actual.includes(e));
            const extra = actual.filter(a => !expected.includes(a));

            if (missing.length > 0) console.log(`  MISSING: ${missing.join(', ')}`);
            else console.log(`  All expected columns present.`);

            if (extra.length > 0) console.log(`  EXTRA: ${extra.join(', ')}`);
        }

    } catch (err) {
        console.error('Failed:', err);
    }
}

check();
