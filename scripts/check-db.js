
const { drizzle } = require("drizzle-orm/neon-http");
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    const result = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    `;
    console.log("Tables in database:", result.map(r => r.table_name));

    const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'quizzes'
    `;
    console.log("Columns in 'quizzes' table:", columns);
}

main().catch(console.error);
