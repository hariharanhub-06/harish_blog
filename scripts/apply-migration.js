
const { neon } = require("@neondatabase/serverless");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: ".env.local" });

async function main() {
    const sql = neon(process.env.DATABASE_URL);
    const sqlFile = path.join(__dirname, "../drizzle/0004_loose_xavin.sql");
    const content = fs.readFileSync(sqlFile, "utf8");

    // Split by statement-breakpoint annotation
    const statements = content.split("--> statement-breakpoint");

    console.log(`Executing ${statements.length} SQL statements...`);

    for (let statement of statements) {
        statement = statement.trim();
        if (!statement) continue;

        try {
            console.log(`Executing statement: ${statement.substring(0, 50)}...`);
            await sql(statement);
        } catch (error) {
            console.error("Error executing statement:", error.message);
            // Continue if table already exists or other non-critical errors
            if (error.message.includes("already exists")) {
                console.log("Table already exists, skipping...");
            } else {
                throw error;
            }
        }
    }

    console.log("Database migration completed successfully!");
}

main().catch(console.error);
