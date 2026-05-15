import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function inspectData() {
    try {
        const { db } = await import('./src/db');
        const { profiles, projects, blogPosts, experience, education, volunteering, skills } = await import('./src/db/schema');

        console.log("--- Data Inspection ---");

        const profile = await db.query.profiles.findFirst();
        console.log("Profile Data Found:", !!profile);
        if (profile) {
            console.log("Name:", profile.name);
            console.log("Headline:", profile.headline);
        }

        const exp = await db.select().from(experience);
        const edu = await db.select().from(education);
        const skill = await db.select().from(skills);
        const vol = await db.select().from(volunteering);
        const proj = await db.select().from(projects);

        console.log("Counts:", {
            experience: exp.length,
            education: edu.length,
            skills: skill.length,
            volunteering: vol.length,
            projects: proj.length
        });

        process.exit(0);
    } catch (error: any) {
        console.error("Inspection failed:", error.message);
        process.exit(1);
    }
}

inspectData();
