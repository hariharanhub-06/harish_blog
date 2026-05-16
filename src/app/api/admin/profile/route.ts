import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { validateAdminSession } from "@/lib/adminAuth";

const DEFAULT_PROFILE = {
    name: "Hari Haran Jeyaramamoorthy",
    headline: "Web/App Developer | Business Consultant | Job Placement Expert | Operations & Partnerships Manager | Snack Business Owner | Project Management",
    about: "Passionate developer and business strategist focused on building innovative solutions.",
    location: "Tamil Nadu, India",
    avatarUrl: "/hari_photo.png",
    heroImageUrl: null,
    aboutImageUrl: null,
    audioUrl: null,
    featuredVideoUrl: null,
    businessSolutionVideoUrl: null,
    businessSolutionVideoConfig: { scale: 1, x: 0, y: 0, mixBlendMode: 'screen' },
    socialLinks: { linkedin: "https://linkedin.com/in/hari-haran-j", github: "https://github.com/hari-haran-j", twitter: "", instagram: "" },
    stats: [
        { label: "Years Experience", value: "3+", icon: "Briefcase" },
        { label: "Projects Completed", value: "10+", icon: "Code" },
        { label: "Clubs Led", value: "5+", icon: "Award" },
        { label: "Colleges Partnered", value: "42", icon: "User" },
    ],
    trainingStats: [
        { label: "Expert Sessions", value: "150+", icon: "Presentation" },
        { label: "Partnered Colleges", value: "42+", icon: "GraduationCap" },
        { label: "Minds Empowered", value: "5000+", icon: "Users" },
    ],
    // Default visibility for all sections
    showHeroSection: true,
    showStatsSection: true,
    showTrainingSection: true,
    showExperienceSection: true,
    showEducationSection: true,
    showVolunteeringSection: true,
    showAboutSection: true,
    showProjectsSection: true,
    showQuizzesSection: true,
    showTypingTestSection: true,
    showFeedbackSection: true,
    showGamesSection: true,
    showLiveSessionsSection: true
};

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        // Always get the most-recently-updated profile row to avoid returning a stale duplicate
        const profile = await db.query.profiles.findFirst({
            orderBy: (p, { desc }) => [desc(p.updatedAt)],
        });
        return NextResponse.json(profile || DEFAULT_PROFILE);
    } catch (error: any) {
        console.error("GET Profile failed:", error);
        return NextResponse.json(DEFAULT_PROFILE); // Return defaults instead of error for UI stability
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();

        // Auto-add any new columns that may not exist yet
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS click_effect TEXT DEFAULT 'none'`).catch(() => {});

        // Get most recently updated row; if duplicates exist this picks the right one
        const existing = await db.query.profiles.findFirst({
            orderBy: (p, { desc }) => [desc(p.updatedAt)],
        });

        const fields = {
            name: data.name,
            headline: data.headline,
            bio: data.bio,
            about: data.about,
            email: data.email,
            location: data.location,
            avatarUrl: data.avatarUrl,
            heroImageUrl: data.heroImageUrl,
            aboutImageUrl: data.aboutImageUrl,
            audioUrl: data.audioUrl,
            featuredVideoUrl: data.featuredVideoUrl,
            businessSolutionVideoUrl: data.businessSolutionVideoUrl,
            businessSolutionVideoConfig: data.businessSolutionVideoConfig,
            socialLinks: data.socialLinks,
            stats: data.stats,
            trainingStats: data.trainingStats,
            showHeroSection: data.showHeroSection,
            showStatsSection: data.showStatsSection,
            showTrainingSection: data.showTrainingSection,
            showExperienceSection: data.showExperienceSection,
            showEducationSection: data.showEducationSection,
            showVolunteeringSection: data.showVolunteeringSection,
            showAboutSection: data.showAboutSection,
            showProjectsSection: data.showProjectsSection,
            showQuizzesSection: data.showQuizzesSection,
            showTypingTestSection: data.showTypingTestSection,
            showFeedbackSection: data.showFeedbackSection,
            showGamesSection: data.showGamesSection,
            showLiveSessionsSection: data.showLiveSessionsSection,
            clickEffect: data.clickEffect ?? "none",
        };

        if (existing) {
            await db.update(profiles).set({
                ...fields,
                updatedAt: new Date(),
            }).where(eq(profiles.id, existing.id));
        } else {
            await db.insert(profiles).values(fields);
        }

        revalidatePath("/");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("POST Profile failed:", error);
        return NextResponse.json({
            error: "Database save failed.",
            details: error.message
        }, { status: 500 });
    }
}
