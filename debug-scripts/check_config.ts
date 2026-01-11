import { db } from "./src/db";
import { affiliateConfig } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function checkConfig() {
    const [config] = await db.select().from(affiliateConfig).where(eq(affiliateConfig.id, 1)).limit(1);
    console.log("Current Affiliate Config:", config);
    process.exit(0);
}

checkConfig();
