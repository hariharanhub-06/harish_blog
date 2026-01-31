import { db } from './src/db';

async function check() {
    try {
        const p = await db.query.profiles.findFirst();
        console.log("PROFILE DATA:");
        console.log(JSON.stringify(p, null, 2));
    } catch (e) {
        console.error("ERROR FETCHING PROFILE:", e);
    }
}

check();
