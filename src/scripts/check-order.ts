
import { db } from "@/db";
import { snackOrders, affiliateTransactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

async function main() {
    console.log('--- DETAILS ---');
    const orders = await db.select().from(snackOrders).orderBy(desc(snackOrders.createdAt)).limit(1);

    if (orders.length > 0) {
        const o = orders[0];
        console.log(`ORDER_ID: ${o.orderId}`);
        console.log(`COUPON: ${o.couponCode}`);
        console.log(`STATUS: ${o.status}`);

        // Check transactions
        const txs = await db.select().from(affiliateTransactions).where(eq(affiliateTransactions.orderId, o.orderId));
        console.log(`TRANSACTIONS_COUNT: ${txs.length}`);
    } else {
        console.log('No orders found');
    }
    console.log('--- END ---');
    process.exit(0);
}

main();
