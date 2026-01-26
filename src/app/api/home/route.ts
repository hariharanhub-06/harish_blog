import { db } from "@/db";
import { profiles, projects, experience, education, volunteering, youtubeVideos } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const profileData = await db.query.profiles.findFirst();
        const allProjects = await db.query.projects.findMany({
            orderBy: [desc(projects.displayOrder), desc(projects.createdAt)],
        });
        const videos = await db.query.youtubeVideos.findMany({
            where: eq(youtubeVideos.isActive, true),
            orderBy: [desc(youtubeVideos.displayOrder), desc(youtubeVideos.createdAt)],
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

        const allPartnerships = await db.query.partnerships.findMany({
            where: (p, { eq }) => eq(p.isActive, true),
            orderBy: (p, { desc }) => [desc(p.displayOrder), desc(p.createdAt)],
        });

        return NextResponse.json({
            profile: profileData,
            projects: allProjects,
            videos,
            experiences,
            educations,
            volunteerings,
            partnerships: allPartnerships
        });
    } catch (error) {
        console.error("Error fetching home data:", error);
        return NextResponse.json({ error: "Failed to fetch home data" }, { status: 500 });
    }
}
