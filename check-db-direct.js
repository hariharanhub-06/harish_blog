const { neon } = require('@neondatabase/serverless');

const sql = neon("postgresql://neondb_owner:npg_UG86mxlgrkaL@ep-orange-bird-ahcag8pl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function check() {
    try {
        const routines = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'routines')`;
        const logs = await sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'routine_logs')`;
        console.log("Routines exists:", routines[0].exists);
        console.log("Routine logs exists:", logs[0].exists);
    } catch (e) {
        console.error(e);
    }
}

check();
