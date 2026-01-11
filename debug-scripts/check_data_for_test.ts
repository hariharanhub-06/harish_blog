
import { db } from "./src/db";
import { vendors, snackProducts } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("--- VENDORS ---");
    const allVendors = await db.select().from(vendors);
    allVendors.forEach(v => console.log(`${v.name} (ID: ${v.id})`));

    console.log("\n--- PRODUCTS ---");
    const allProducts = await db.select().from(snackProducts);

    // Group by vendor
    for (const v of allVendors) {
        const products = allProducts.filter(p => p.vendorId === v.id);
        if (products.length > 0) {
            console.log(`\nVendor: ${v.name}`);
            products.forEach(p => console.log(` - ${p.name} (ID: ${p.id}) Price: ${p.pricePerPiece || p.offerPricePerPiece || p.pricePerKg}`));
        } else {
            console.log(`\nVendor: ${v.name} (Has NO products)`);
        }
    }

    const unassigned = allProducts.filter(p => !p.vendorId);
    if (unassigned.length > 0) {
        console.log("\n--- Unassigned Products (Admin/Default) ---");
        unassigned.forEach(p => console.log(` - ${p.name} (ID: ${p.id})`));
    }
}

main().catch(console.error).finally(() => process.exit());
