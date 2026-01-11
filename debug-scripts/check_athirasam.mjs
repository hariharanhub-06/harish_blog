import { db } from './src/db/index.js';
import { snackProducts } from './src/db/schema.js';
import { like } from 'drizzle-orm';

async function check() {
    try {
        const products = await db.select().from(snackProducts).where(like(snackProducts.name, '%Athirasam%'));
        console.log(JSON.stringify(products, null, 2));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
check();
