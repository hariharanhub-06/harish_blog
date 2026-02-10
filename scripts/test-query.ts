import { db } from "./src/db";
import { financeLeads } from "./src/db/schema";

async function testQuery() {
    try {
        const leads = await db.query.financeLeads.findMany({
            with: {
                lead: true
            }
        });
        console.log("Finance Leads in DB:", JSON.stringify(leads, null, 2));
        process.exit(0);
    } catch (error) {
        console.error("Query Error:", error);
        process.exit(1);
    }
}

testQuery();
