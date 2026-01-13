
const { drizzle } = require('drizzle-orm/node-postgres');
const { Pool } = require('pg');
const { snackProducts } = require('./src/db/schema');
const { eq } = require('drizzle-orm');

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    });
    const db = drizzle(pool);

    try {
        const products = await db.select().from(snackProducts);
        console.log(`Total products: ${products.length}`);
        products.forEach(p => {
            console.log(`- ${p.name} (Active: ${p.isActive})`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

check();
