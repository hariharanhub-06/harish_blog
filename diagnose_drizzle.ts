import { db } from './src/db';
import { liveSessions } from './src/db/schema';
import { desc } from 'drizzle-orm';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
    try {
        console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'FOUND' : 'NOT FOUND');
        const sessions = await db.select().from(liveSessions).orderBy(desc(liveSessions.startTime));
        console.log('DRIZZLE_SESSIONS_COUNT:', sessions.length);
        if (sessions.length > 0) {
            console.log('FIRST_SESSION_TITLE:', sessions[0].title);
        }
    } catch (err) {
        console.error('Drizzle test failed:', err);
    }
}
test();
