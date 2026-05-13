import { db } from "./src/db/index";
import { sql } from "drizzle-orm";

async function checkTables() {
    try {
        console.log("Checking for 'routines' table...");
        const routinesExist = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'routines')`);
        console.log("Routines table exists:", routinesExist[0].exists);

        console.log("Checking for 'routine_logs' table...");
        const logsExist = await db.execute(sql`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'routine_logs')`);
        console.log("Routine Logs table exists:", logsExist[0].exists);

        process.exit(0);
    } catch (error) {
        console.error("Error checking tables:", error);
        process.exit(1);
    }
}

checkTables();
