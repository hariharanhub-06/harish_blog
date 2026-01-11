const { neon } = require("@neondatabase/serverless");
const url = "postgresql://neondb_owner:npg_VvH2P0STjEez@ep-divine-rain-a1ofn0i1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function main() {
    try {
        console.log("--- SEARCHING FOR ORPHANED TRANSACTIONS ---");
        // Transactions with an order_id that doesn't exist in snack_orders
        const orphans = await sql(`
            SELECT t.id, t.order_id, t.affiliate_id, t.amount, t.type
            FROM affiliate_transactions t
            LEFT JOIN snack_orders o ON t.order_id = o.order_id
            WHERE o.order_id IS NULL AND t.order_id IS NOT NULL;
        `);
        console.log("Orphaned Transactions:", JSON.stringify(orphans, null, 2));

        console.log("\n--- CHECKING AFFILIATE BALANCE TOTALS ---");
        const affs = await sql("SELECT id, full_name, total_earnings, total_orders, total_sales_amount FROM affiliates WHERE total_earnings > 0 OR total_orders > 0");
        console.log("Affiliates with stats:", JSON.stringify(affs, null, 2));

        if (orphans.length > 0) {
            console.log("\n[WARNING] Found orphaned transactions! This means the deletion rollback didn't clean them up.");
        }
    } catch (e) {
        console.error(e);
    }
}
main();
