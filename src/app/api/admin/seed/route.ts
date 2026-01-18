import { NextResponse } from "next/server";
import { db } from "@/db";
import { profiles, experience, education, skills, projects, volunteering } from "@/db/schema";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const diagnostics: any = {
        env: { TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL ? "SET" : "NOT SET" },
        steps: {}
    };

    try {
        console.log("Ultimate Seeding started...");

        // 1. Reset all tables
        const tables = ['experience', 'education', 'skills', 'projects', 'volunteering', 'profiles'];
        for (const table of tables) {
            try {
                await db.run(sql.raw(`DROP TABLE IF EXISTS "${table}"`));
            } catch (e: any) { }
        }

        // 2. Recreate Tables (Minimal matching schema)
        await db.run(sql`CREATE TABLE "groups" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL)`); // Just in case

        await db.run(sql`CREATE TABLE "profiles" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "headline" text, "bio" text, "about" text, "email" text, "location" text, "avatar_url" text, "hero_image_url" text, "about_image_url" text, "social_links" text, "stats" text, "updated_at" integer)`);

        await db.run(sql`CREATE TABLE "experience" ("id" text PRIMARY KEY NOT NULL, "company" text NOT NULL, "role" text NOT NULL, "duration" text, "description" text, "display_order" integer DEFAULT 0, "created_at" integer)`);

        await db.run(sql`CREATE TABLE "education" ("id" text PRIMARY KEY NOT NULL, "institution" text NOT NULL, "degree" text NOT NULL, "period" text, "details" text, "display_order" integer DEFAULT 0)`);

        await db.run(sql`CREATE TABLE "skills" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "category" text, "proficiency" integer DEFAULT 0, "icon" text, "display_order" integer DEFAULT 0)`);

        await db.run(sql`CREATE TABLE "projects" ("id" text PRIMARY KEY NOT NULL, "title" text NOT NULL, "description" text, "thumbnail" text, "technologies" text, "live_url" text, "repo_url" text, "category" text, "featured" integer DEFAULT 0, "display_order" integer DEFAULT 0, "created_at" integer)`);

        await db.run(sql`CREATE TABLE "volunteering" ("id" text PRIMARY KEY NOT NULL, "role" text NOT NULL, "organization" text NOT NULL, "duration" text, "description" text, "display_order" integer DEFAULT 0)`);

        diagnostics.steps.recreation = "SUCCESS";

        // 3. Insert Data
        await db.insert(profiles).values({
            id: "hari-haran",
            name: "Hari Haran Jeyaramamoorthy",
            headline: "Web/App Developer | Business Consultant | Operations & Partnerships Manager",
            bio: "Versatile professional with expertise in management and coding.",
            about: "I specialize in technology-driven business solutions.",
            location: "Tamil Nadu, India",
            avatarUrl: "/hari_photo.png",
            socialLinks: { linkedin: "https://linkedin.com/in/hari-haran-jeyaramamoorthy" },
            stats: [{ label: "Years Experience", value: "3+", icon: "Briefcase" }],
        });

        await db.insert(experience).values([
            { id: "exp-1", company: "Handyman Technologies", role: "Partnerships Manager", duration: "2022 - 2025", description: "Led 17 members.", displayOrder: 1 },
            { id: "exp-2", company: "ICA Edu Skills", role: "Branch Manager", duration: "2024 - 2025", description: "Oversaw operations.", displayOrder: 2 }
        ]);

        await db.insert(education).values([
            { id: "edu-1", institution: "Kathir College of Engineering", degree: "BE Mechanical", period: "2017 - 2021", details: "Grade A", displayOrder: 1 }
        ]);

        await db.insert(volunteering).values([
            { id: "vol-1", role: "Basketball Captain", organization: "Kathir College", duration: "2018 - 2021", description: "Led the team to victory.", displayOrder: 1 }
        ]);

        await db.insert(projects).values([
            { id: "proj-1", title: "startupmenswear.in", description: "Tech Founder", technologies: ["Python", "Firebase"], featured: true, displayOrder: 1 }
        ]);

        return NextResponse.json({ success: true, message: "Ultimate seeding successful!", diagnostics });

    } catch (error: any) {
        return NextResponse.json({ error: error.message, diagnostics }, { status: 500 });
    }
}
