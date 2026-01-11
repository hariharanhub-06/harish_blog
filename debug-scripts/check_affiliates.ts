import { db } from "./src/db";
import { affiliates } from "./src/db/schema";

async function checkAffiliates() {
    const all = await db.select().from(affiliates);
    console.log(JSON.stringify(all, null, 2));

    // Check for self-reference
    const bad = all.filter(a => a.parentId === a.id);
    if (bad.length > 0) {
        console.error("FOUND SELF-REFERENCING AFFILIATES:", bad.map(a => a.fullName));
    } else {
        console.log("No self-referencing affiliates found.");
    }
    process.exit(0);
}

checkAffiliates();
