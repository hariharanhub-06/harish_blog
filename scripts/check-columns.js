const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config({ path: ".env.local" });

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    const cols = await sql`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'quizzes'
    `;
    const columnNames = cols.map(c => c.column_name);
    let output = "All Quiz Columns: " + columnNames.join(", ") + "\n";

    if (columnNames.includes("cover_image")) {
        output += "SUCCESS: 'cover_image' column EXISTS.\n";
    } else {
        output += "FAILURE: 'cover_image' column MISSING.\n";
    }

    const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
    output += "Tables in DB: " + tables.map(t => t.table_name).join(", ");

    fs.writeFileSync("db_check_output.txt", output);
    console.log("Output written to db_check_output.txt");
}

main().catch(console.error);
