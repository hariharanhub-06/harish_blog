
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    const id = "cb16165e-5f4c-469e-b5a5-dedb8df5633f";
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));

    if (affiliate) {
        console.log(`Name: ${affiliate.fullName}`);
        console.log(`Total Orders: ${affiliate.totalOrders}`);
        console.log(`Total Sales: ${affiliate.totalSalesAmount}`);
        console.log(`Total Earnings: ${affiliate.totalEarnings}`);
        console.log(`Pending Balance: ${affiliate.pendingBalance}`);
        console.log(`Direct Earnings: ${affiliate.directEarnings}`);
    } else {
        console.log("Affiliate not found");
    }
    process.exit(0);
}

main();
