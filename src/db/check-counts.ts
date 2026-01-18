import { db } from "./index";
import * as schema from "./schema";

async function checkCounts() {
    try {
        console.log("Checking DB connection and counts...");

        // Use raw query for health check
        const health = await db.run({ sql: "SELECT 1", args: [] }).catch(e => {
            console.error("Health check failed:", e.message);
            return null;
        });

        if (!health) return;
        console.log("DB connectivity verified.");

        const profiles = await db.query.profiles.findMany();
        const projects = await db.query.projects.findMany();
        const experience = await db.query.experience.findMany();
        const education = await db.query.education.findMany();
        const volunteering = await db.query.volunteering.findMany();

        console.log("\nDatabase Stats:");
        console.log(`Profiles: ${profiles.length}`);
        console.log(`Projects: ${projects.length}`);
        console.log(`Experience: ${experience.length}`);
        console.log(`Education: ${education.length}`);
        console.log(`Volunteering: ${volunteering.length}`);

        if (projects.length > 0) {
            console.log("\nSample Project:", projects[0]);
        }
    } catch (error: any) {
        console.error("\nCRITICAL ERROR:");
        console.error(error.message);
        if (error.stack) console.error(error.stack);
    }
}

checkCounts();
