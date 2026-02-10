import { db } from "./src/db";
import { financeLeads, contactSubmissions } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function testInsert() {
    try {
        console.log("Checking for a sample contact submission...");
        const submission = await db.query.contactSubmissions.findFirst();
        if (!submission) {
            console.error("No contact submissions found. Please create one first.");
            process.exit(1);
        }
        console.log("Found submission:", submission.id);

        console.log("Attempting to insert into finance_leads...");
        const [newLead] = await db.insert(financeLeads).values({
            leadId: submission.id,
            loanType: "Personal Loan",
            status: "Document Collection",
            adminNotes: "Test insert from script"
        }).returning();

        console.log("Successfully inserted lead:", newLead);
        process.exit(0);
    } catch (error: any) {
        console.error("Insert Error:", error);
        console.error("Error Message:", error.message);
        console.error("Error Stack:", error.stack);
        process.exit(1);
    }
}

testInsert();
