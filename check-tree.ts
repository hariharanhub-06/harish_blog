import { db } from "./src/db";
import { affiliates } from "./src/db/schema";
import { ilike } from "drizzle-orm";

async function main() {
    console.log("Searching for affiliates with name 'test'...");
    const results = await db.select({
        id: affiliates.id,
        fullName: affiliates.fullName,
        parentId: affiliates.parentId,
        position: affiliates.position
    }).from(affiliates).where(ilike(affiliates.fullName, "%test%"));

    console.log(`Found ${results.length} records:`);
    console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
