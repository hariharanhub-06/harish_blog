import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        env: {
            TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? "SET (Starts with " + process.env.TURSO_CONNECTION_URL.substring(0, 10) + ")" : "NOT SET",
            TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "SET" : "NOT SET",
            isUsingDummy: !process.env.TURSO_CONNECTION_URL,
        },
        steps: {}
    };

    try {
        console.log("Remote Seeding Diagnostics started...");

        // 1. Connectivity & Table Check
        let tableExists = false;
        try {
            const tableCheck = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'`);
            tableExists = tableCheck.rows.length > 0;
            diagnostics.steps.tableCheck = tableExists ? "EXISTS" : "MISSING";
        } catch (e: any) {
            diagnostics.steps.tableCheck = "ERROR: " + e.message;
            return NextResponse.json({ error: "Failed to query database schema", message: e.message, diagnostics }, { status: 500 });
        }

        // 2. Self-Healing: Create tables if missing
        if (!tableExists) {
            console.log("Profiles table missing. Attempting emergency schema creation...");
            try {
                // We create the most critical tables needed for the homepage
                await db.run(sql`
                    CREATE TABLE IF NOT EXISTS "profiles" (
                        "id" text PRIMARY KEY NOT NULL,
                        "name" text NOT NULL,
                        "headline" text,
                        "bio" text,
                        "about" text,
                        "email" text,
                        "location" text,
                        "avatar_url" text,
                        "hero_image_url" text,
                        "about_image_url" text,
                        "social_links" text,
                        "stats" text,
                        "updated_at" integer DEFAULT (strftime('%s', 'now'))
                    )
                `);

                await db.run(sql`
                    CREATE TABLE IF NOT EXISTS "experience" (
                        "id" text PRIMARY KEY NOT NULL,
                        "company" text NOT NULL,
                        "role" text NOT NULL,
                        "duration" text,
                        "description" text,
                        "display_order" integer DEFAULT 0,
                        "created_at" integer DEFAULT (strftime('%s', 'now'))
                    )
                `);

                await db.run(sql`
                    CREATE TABLE IF NOT EXISTS "education" (
                        "id" text PRIMARY KEY NOT NULL,
                        "institution" text NOT NULL,
                        "degree" text NOT NULL,
                        "period" text,
                        "details" text,
                        "display_order" integer DEFAULT 0
                    )
                `);

                await db.run(sql`
                    CREATE TABLE IF NOT EXISTS "projects" (
                        "id" text PRIMARY KEY NOT NULL,
                        "title" text NOT NULL,
                        "description" text,
                        "thumbnail" text,
                        "technologies" text,
                        "live_url" text,
                        "repo_url" text,
                        "category" text,
                        "featured" integer DEFAULT false,
                        "display_order" integer DEFAULT 0,
                        "created_at" integer DEFAULT (strftime('%s', 'now'))
                    )
                `);

                await db.run(sql`
                    CREATE TABLE IF NOT EXISTS "skills" (
                        "id" text PRIMARY KEY NOT NULL,
                        "name" text NOT NULL,
                        "category" text,
                        "proficiency" integer DEFAULT 0,
                        "icon" text,
                        "display_order" integer DEFAULT 0
                    )
                `);

                diagnostics.steps.schemaCreation = "SUCCESS";
            } catch (e: any) {
                diagnostics.steps.schemaCreation = "FAILED: " + e.message;
                return NextResponse.json({ error: "Schema creation failed", message: e.message, diagnostics }, { status: 500 });
            }
        }

        // 3. Cleanup existing data (now that we're sure tables exist)
        console.log("Starting data cleanup...");
        try {
            await db.delete(profiles);
            await db.delete(experience);
            await db.delete(education);
            await db.delete(skills);
            await db.delete(projects);
            diagnostics.steps.cleanup = "OK";
        } catch (e: any) {
            diagnostics.steps.cleanup = "FAILED: " + e.message;
            return NextResponse.json({ error: "Cleanup failed", message: e.message, diagnostics }, { status: 500 });
        }

        // 4. Insert Fresh Data
        console.log("Starting data insertion...");
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
            message: "Remote seeding completed successfully! Schema verified and data restored.",
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
