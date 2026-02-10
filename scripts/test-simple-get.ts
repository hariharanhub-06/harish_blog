import { db } from "../src/db";
import { financeLeads } from "../src/db/schema";

async function testSimpleGet() {
    try {
        console.log("Attempting to fetch finance leads (simple)...");
        const data = await db.select().from(financeLeads);
        console.log("Success! Data length:", data.length);
        process.exit(0);
    } catch (error: any) {
        console.error("Simple Select Error!");
        console.error("Message:", error.message);
        process.exit(1);
    }
}

testSimpleGet();
