
const { db } = require('./src/db');
const { snackOrders } = require('./src/db/schema');
const { desc, eq } = require('drizzle-orm');

async function main() {
    console.log('--- DETAILS ---');
    const orders = await db.select().from(snackOrders).orderBy(desc(snackOrders.createdAt)).limit(1);
    if (orders.length > 0) {
        const o = orders[0];
        console.log(`ORDER_ID: ${o.orderId}`);
        console.log(`COUPON: ${o.couponCode}`);
        console.log(`STATUS: ${o.status}`);
    } else {
        console.log('No orders found');
    }
    console.log('--- END ---');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
