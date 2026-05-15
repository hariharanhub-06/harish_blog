import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function restoreData() {
    try {
        const { db } = await import('./src/db');
        const { profiles, aiAssistantConfig, experience, education, volunteering, skills, projects } = await import('./src/db/schema');
        const fs = require('fs');

        const kbData = JSON.parse(fs.readFileSync('./src/data/knowledge_base.json', 'utf8'));

        console.log("--- Starting Deep Data Restoration ---");

        // 1. Profile Restoration
        try {
            const existingProfile = await db.query.profiles.findFirst();
            if (!existingProfile) {
                console.log("Seeding profile info...");
                const name = "Hari Haran Jeyaramamoorthy";
                const location = "Coimbatore, Tamil Nadu";
                const headline = "Web/App Developer | Business Consultant | Operations & Partnerships Manager | Project Management";
                const about = "I am a confident, hardworking, people-oriented person who believes strongly in character, growth, and meaningful success.";

                await db.insert(profiles).values({
                    name,
                    location,
                    headline,
                    about,
                    avatarUrl: "/hari_photo.png",
                });
                console.log("Profile seeded.");
            }
        } catch (e) {
            console.warn("Failed to seed profile:", e.message);
        }

        // 2. Experience Restoration
        try {
            const expCount = await db.select().from(experience);
            if (expCount.length <= 1) {
                console.log("Seeding deep experience...");
                const experiences = [
                    {
                        company: "Hariharanhub",
                        role: "Founder & Digital Solutions Architect",
                        duration: "2021 - Present",
                        description: "Building AI-integrated web and mobile applications for local and international brands.",
                        isCurrent: true,
                        displayOrder: 1
                    },
                    {
                        company: "Rotaract Club",
                        role: "President",
                        duration: "2022 - 2023",
                        description: "Led dynamic youth groups in Coimbatore for community impact and leadership development.",
                        isCurrent: false,
                        displayOrder: 2
                    }
                ];
                for (const item of experiences) {
                    await db.insert(experience).values(item);
                }
                console.log("Experience seeded.");
            }
        } catch (e) {
            console.warn("Failed to seed experience:", e.message);
        }

        // 3. Education Restoration
        try {
            const eduCount = await db.select().from(education);
            if (eduCount.length === 0) {
                console.log("Seeding education...");
                await db.insert(education).values({
                    institution: "Technical Institute, Coimbatore",
                    degree: "Technical Degree",
                    period: "2018 - 2021",
                    details: "Focused on software, web, app, and AI-related studies.",
                    displayOrder: 1
                });
                console.log("Education seeded.");
            }
        } catch (e) {
            console.warn("Failed to seed education:", e.message);
        }

        // 4. Volunteering Restoration
        try {
            const volCount = await db.select().from(volunteering);
            if (volCount.length === 0) {
                console.log("Seeding volunteering...");
                await db.insert(volunteering).values({
                    role: "Rotaractor",
                    organization: "Rotaract District 3201",
                    duration: "Long Term",
                    description: "Contributing to various social service and community development projects.",
                    displayOrder: 1
                });
                console.log("Volunteering seeded.");
            }
        } catch (e) {
            console.warn("Failed to seed volunteering:", e.message);
        }

        // 5. Skills Restoration
        try {
            const skillCount = await db.select().from(skills);
            if (skillCount.length <= 3) {
                console.log("Seeding more skills...");
                const moreSkills = [
                    { name: "Flutter", category: "App Development", proficiency: 85, displayOrder: 4 },
                    { name: "AI Integrations", category: "AI & Data", proficiency: 80, displayOrder: 5 },
                    { name: "Project Management", category: "Management", proficiency: 95, displayOrder: 6 },
                ];
                await db.insert(skills).values(moreSkills);
                console.log("Skills expanded.");
            }
        } catch (e) {
            console.warn("Failed to seed skills:", e.message);
        }

        console.log("Deep Restoration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Deep Restoration Fatal Error:", error.message);
        process.exit(1);
    }
}

restoreData();
