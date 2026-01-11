const { neon } = require("@neondatabase/serverless");

const url = "postgresql://neondb_owner:npg_VvH2P0STjEez@ep-divine-rain-a1ofn0i1-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const sql = neon(url);

async function main() {
    console.log("Fetching affiliate data...");
    const results = await sql('SELECT id, "full_name" as fullName, "parent_id" as parentId, "referrer_id" as referrerId, position FROM affiliates');

    console.log("Total Records:", results.length);

    // Find potential duplicates by name
    const nameMap = {};
    results.forEach(r => {
        nameMap[r.fullname] = (nameMap[r.fullname] || 0) + 1;
    });

    console.log("Duplicates by Name (count > 1):");
    Object.entries(nameMap).forEach(([name, count]) => {
        if (count > 1) console.log(`- ${name}: ${count}`);
    });

    // Check for self-referencing or cycles
    console.log("\nRecords with Parent/Referrer:");
    results.forEach(r => {
        if (r.parentid || r.referrerid) {
            console.log(`- ${r.fullname} ID: ${r.id.substring(0, 8)}... Parent: ${r.parentid ? r.parentid.substring(0, 8) + '...' : 'NONE'} Position: ${r.position}`);
        }
    });
}

main().catch(console.error);
