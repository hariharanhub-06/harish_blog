import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        env: { TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? "SET" : "NOT SET" },
        steps: {}
    };

    try {
        console.log("Nuclear Seeding started...");

        // 1. DROP and RECREATE tables to ensure clean SQLite schema
        // We only do this for the problematic tables. Profiles seems fine as it succeeded.
        const tablesToReset = ['experience', 'education', 'skills', 'projects'];
        for (const table of tablesToReset) {
            try {
                await db.run(sql.raw(`DROP TABLE IF EXISTS "${table}"`));
                diagnostics.steps[`drop_${table}`] = "OK";
            } catch (e: any) {
                diagnostics.steps[`drop_${table}`] = "FAILED: " + e.message;
            }
        }

        // Recreate Experience
        await db.run(sql`
            CREATE TABLE "experience" (
                "id" text PRIMARY KEY NOT NULL,
                "company" text NOT NULL,
                "role" text NOT NULL,
                "duration" text,
                "description" text,
                "display_order" integer DEFAULT 0,
                "created_at" integer DEFAULT (strftime('%s', 'now'))
            )
        `);

        // Recreate Education
        await db.run(sql`
            CREATE TABLE "education" (
                "id" text PRIMARY KEY NOT NULL,
                "institution" text NOT NULL,
                "degree" text NOT NULL,
                "period" text,
                "details" text,
                "display_order" integer DEFAULT 0
            )
        `);

        // Recreate Skills
        await db.run(sql`
            CREATE TABLE "skills" (
                "id" text PRIMARY KEY NOT NULL,
                "name" text NOT NULL,
                "category" text,
                "proficiency" integer DEFAULT 0,
                "icon" text,
                "display_order" integer DEFAULT 0
            )
        `);

        // Recreate Projects
        await db.run(sql`
            CREATE TABLE "projects" (
                "id" text PRIMARY KEY NOT NULL,
                "title" text NOT NULL,
                "description" text,
                "thumbnail" text,
                "technologies" text,
                "live_url" text,
                "repo_url" text,
                "category" text,
                "featured" integer DEFAULT 0,
                "display_order" integer DEFAULT 0,
                "created_at" integer DEFAULT (strftime('%s', 'now'))
            )
        `);

        diagnostics.steps.recreation = "SUCCESS";

        // 2. Insert Profiles (Cleanup first)
        await db.delete(profiles);
        await db.insert(profiles).values({
            id: "hari-haran-profile-id",
            name: "Hari Haran Jeyaramamoorthy",
            headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management Pro",
            bio: "Versatile professional with expertise in management, soft skills training, coding, and career consulting.",
            about: "I specialize in leading, managing, and mentoring individuals and teams to achieve professional goals...",
            location: "Tamil Nadu, India",
            avatarUrl: "/hari_photo.png",
            socialLinks: { linkedin: "https://linkedin.com/in/hari-haran-jeyaramamoorthy" },
            stats: [{ label: "Years Experience", value: "3+", icon: "Briefcase" }],
        });
        diagnostics.steps.profiles = "OK";

        // 3. Insert Experience (Static IDs)
        await db.insert(experience).values([
            {
                id: "exp-1",
                company: "Handyman Technologies",
                role: "Partnerships Manager",
                duration: "2022 - 2025",
                description: "Managed partnerships with 42 colleges.",
                displayOrder: 1,
            },
            {
                id: "exp-2",
                company: "ICA Edu Skills",
                role: "Branch Manager",
                duration: "2024 - 2025",
                description: "Oversaw branch operations.",
                displayOrder: 2,
            }
        ]);
        diagnostics.steps.experience = "OK";

        // 4. Insert Education
        await db.insert(education).values([
            {
                id: "edu-1",
                institution: "Kathir College of Engineering",
                degree: "BE Mechanical",
                period: "2017 - 2021",
                details: "Grade A",
                displayOrder: 1,
            }
        ]);
        diagnostics.steps.education = "OK";

        // 5. Insert Skills
        await db.insert(skills).values([
            { id: "skill-1", name: "Next.js", category: "Tech", proficiency: 90, displayOrder: 1 },
            { id: "skill-2", name: "Turso", category: "DB", proficiency: 85, displayOrder: 2 }
        ]);
        diagnostics.steps.skills = "OK";

        // 6. Insert Projects
        await db.insert(projects).values([
            {
                id: "proj-1",
                title: "Portfolio",
                description: "Built with Next.js and Turso",
                technologies: ["Next.js", "Turso"],
                featured: true, // Drizzle converts to 1
                displayOrder: 1
            }
        ]);
        diagnostics.steps.projects = "OK";

        return NextResponse.json({
            success: true,
            message: "Nuclear seeding successful! Database is now clean and populated.",
            diagnostics
        });

    } catch (error: any) {
        console.error("Nuclear Seeding failure:", error);
        return NextResponse.json({
            error: error.message,
            diagnostics
        }, { status: 500 });
    }
}
