import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        env: {
            hasUrl: !!process.env.TURSO_CONNECTION_URL,
            hasToken: !!process.env.TURSO_AUTH_TOKEN,
            urlPrefix: process.env.TURSO_CONNECTION_URL?.substring(0, 10),
        },
        steps: {}
    };

    try {
        console.log("Remote Seeding Diagnostics started...");

        // Step 0: Connectivity check
        try {
            await db.run(sql`SELECT 1`);
            diagnostics.steps.connectivity = "OK";
        } catch (e: any) {
            diagnostics.steps.connectivity = "FAILED: " + e.message;
            return NextResponse.json({ error: "Connectivity check failed", diagnostics }, { status: 500 });
        }

        // Step 1: Check for tables
        try {
            const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'`);
            diagnostics.steps.tableCheck = tables.rows.length > 0 ? "EXISTS" : "MISSING";
            if (tables.rows.length === 0) {
                return NextResponse.json({ error: "Profiles table is missing in the database", diagnostics }, { status: 500 });
            }
        } catch (e: any) {
            diagnostics.steps.tableCheck = "ERROR: " + e.message;
        }

        // Step 2: Cleanup
        console.log("Starting cleanup...");
        try {
            await db.delete(profiles);
            diagnostics.steps.cleanup = "OK";
        } catch (e: any) {
            diagnostics.steps.cleanup = "FAILED: " + e.message;
            // Provide more detail for the cleanup failure since that's where we're stuck
            return NextResponse.json({
                error: "Cleanup failed at 'profiles' table",
                message: e.message,
                diagnostics
            }, { status: 500 });
        }

        await db.delete(experience);
        await db.delete(education);
        await db.delete(skills);
        await db.delete(projects);

        // Step 3: Insertions
        console.log("Starting insertions...");
        const profileId = "hari-haran-profile-id";
        await db.insert(profiles).values({
            id: profileId,
            name: "Hari Haran Jeyaramamoorthy",
            headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro",
            bio: "Versatile professional with expertise in management, soft skills training, coding, and career consulting.",
            about: "I specialize in leading, managing, and mentoring individuals and teams to achieve professional goals. I integrate technology with business solutions and am passionate about empowering people, fostering growth, and driving innovation.",
            location: "Tamil Nadu, India",
            avatarUrl: "/hari_photo.png",
            socialLinks: {
                linkedin: "https://www.linkedin.com/in/hari-haran-jeyaramamoorthy/",
                github: "https://github.com/startup-digi-3119",
                twitter: "",
                instagram: "",
            },
            stats: [
                { label: "Years Experience", value: "3+", icon: "Briefcase" },
                { label: "Projects Completed", value: "10+", icon: "Code" },
                { label: "Clubs Led", value: "5+", icon: "Award" },
                { label: "Colleges Partnered", value: "42", icon: "User" },
            ],
        });

        await db.insert(experience).values([
            {
                company: "Handyman Technologies",
                role: "Partnerships Manager",
                duration: "Mar 2022 – Dec 2025",
                description: "Established and managed partnerships with 42 colleges, broadening market reach. Oversaw a team of 17 members.",
                displayOrder: 1,
            },
            {
                company: "ICA Edu Skills",
                role: "Branch Manager (Freelance)",
                duration: "Dec 2024 – Jun 2025",
                description: "Oversaw branch operations and strategic growth through marketing initiatives. Led and mentored a team.",
                displayOrder: 2,
            },
            {
                company: "Focus Edumatics Pvt Ltd",
                role: "Online Tutor",
                duration: "Mar 2022 – Dec 2022",
                description: "Trained students in English, Science, and Social subjects.",
                displayOrder: 3,
            },
        ]);

        await db.insert(education).values([
            {
                institution: "Kathir College of Engineering",
                degree: "Bachelor of Engineering (BE), Mechanical Engineering",
                period: "2017 – 2021",
                details: "Grade A; Class Representative; Basketball Team Captain.",
                displayOrder: 1,
            },
            {
                institution: "Sree Sakthi Matriculation Higher Secondary School",
                degree: "HSC, Computer Science",
                period: "2016 – 2017",
                details: "Grade A.",
                displayOrder: 2,
            },
        ]);

        await db.insert(skills).values([
            { name: "Python", category: "Technology", proficiency: 85, displayOrder: 1 },
            { name: "Firebase", category: "Technology", proficiency: 80, displayOrder: 2 },
            { name: "Razorpay", category: "Technology", proficiency: 75, displayOrder: 3 },
            { name: "Web Development", category: "Technology", proficiency: 90, displayOrder: 4 },
            { name: "Project Management", category: "Management", proficiency: 95, displayOrder: 5 },
            { name: "Public Speaking", category: "Soft Skills", proficiency: 90, displayOrder: 6 },
        ]);

        await db.insert(projects).values([
            {
                title: "startupmenswear.in",
                description: "Tech Founder; developed using Python, Firebase, and Razorpay.",
                liveUrl: "https://startupmenswear.in",
                technologies: ["Python", "Firebase", "Razorpay"],
                category: "Web Development",
                featured: true,
                displayOrder: 1
            },
        ]);

        return NextResponse.json({
            success: true,
            message: "Remote seeding completed successfully! All tables refreshed.",
            diagnostics
        });
    } catch (error: any) {
        console.error("Remote Seeding error:", error);
        return NextResponse.json({
            error: error.message,
            diagnostics
        }, { status: 500 });
    }
}
