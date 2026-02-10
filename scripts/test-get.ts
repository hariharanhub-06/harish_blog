import { db } from "../src/db";
import { financeLeads } from "../src/db/schema";
import { desc } from "drizzle-orm";

async function testGet() {
    try {
        console.log("Attempting to fetch finance leads with Drizzle query...");
        const data = await db.query.financeLeads.findMany({
            with: {
                lead: true
            },
            orderBy: [desc(financeLeads.createdAt)]
        });
        console.log("Success! Data length:", data.length);
        console.log("Sample lead:", JSON.stringify(data[0], null, 2));
        process.exit(0);
    } catch (error: any) {
        console.error("Drizzle Query Error!");
        console.error("Message:", error.message);
        console.error("Stack:", error.stack);
        process.exit(1);
    }
}

testGet();
