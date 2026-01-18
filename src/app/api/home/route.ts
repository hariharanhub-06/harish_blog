import { db } from "@/db";
import { profiles, projects, experience, education, volunteering } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const profileData = await db.query.profiles.findFirst();
        const allProjects = await db.query.projects.findMany({
            orderBy: [desc(projects.displayOrder), desc(projects.createdAt)],
        });
        const experiences = await db.query.experience.findMany({
            orderBy: [desc(experience.displayOrder)],
        });
        const educations = await db.query.education.findMany({
            orderBy: [desc(education.displayOrder)],
        });
        const volunteerings = await db.query.volunteering.findMany({
            orderBy: [desc(volunteering.displayOrder)],
        });

        return NextResponse.json({
            profile: profileData,
            projects: allProjects,
            experiences,
            educations,
            volunteerings
        });
    } catch (error) {
        console.error("Error fetching home data:", error);
        return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }
}
