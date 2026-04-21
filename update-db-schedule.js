const { neon } = require('@neondatabase/serverless');

const sql = neon("postgresql://neondb_owner:npg_UG86mxlgrkaL@ep-orange-bird-ahcag8pl-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require");

async function update() {
    try {
        console.log("Adding schedule column to routines table...");
        await sql`ALTER TABLE "routines" ADD COLUMN IF NOT EXISTS "schedule" jsonb DEFAULT '{"type": "daily"}';`;
        console.log("Column update complete.");
    } catch (e) {
        console.error(e);
    }
}

update();
