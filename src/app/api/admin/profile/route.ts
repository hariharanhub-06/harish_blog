import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
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
    showLiveSessionsSection: true,
    showKnowAboutYouSection: true
};

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        // Ensure all new columns exist on the production DB (safe no-op if already present)
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS click_effect TEXT DEFAULT 'none'`).catch(() => {});
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_know_about_you_section BOOLEAN DEFAULT true`).catch(() => {});
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_tree_section BOOLEAN DEFAULT true`).catch(() => {});

        // Use SELECT * via raw SQL — resilient to any missing columns, returns whatever exists
        const rows = await db.execute(sql`SELECT * FROM profiles ORDER BY updated_at DESC LIMIT 1`);
        const raw = (rows as any).rows?.[0] ?? (Array.isArray(rows) ? rows[0] : null);

        if (!raw) return NextResponse.json(DEFAULT_PROFILE);

        // Map snake_case DB columns → camelCase for the frontend
        const profile = {
            id:                          raw.id,
            name:                        raw.name,
            headline:                    raw.headline,
            bio:                         raw.bio,
            about:                       raw.about,
            email:                       raw.email,
            location:                    raw.location,
            avatarUrl:                   raw.avatar_url,
            heroImageUrl:                raw.hero_image_url,
            aboutImageUrl:               raw.about_image_url,
            audioUrl:                    raw.audio_url,
            featuredVideoUrl:            raw.featured_video_url,
            businessSolutionVideoUrl:    raw.business_solution_video_url,
            businessSolutionVideoConfig: raw.business_solution_video_config,
            socialLinks:                 raw.social_links,
            stats:                       raw.stats,
            trainingStats:               raw.training_stats,
            updatedAt:                   raw.updated_at,
            showHeroSection:             raw.show_hero_section ?? true,
            showStatsSection:            raw.show_stats_section ?? true,
            showTrainingSection:         raw.show_training_section ?? true,
            showExperienceSection:       raw.show_experience_section ?? true,
            showEducationSection:        raw.show_education_section ?? true,
            showVolunteeringSection:     raw.show_volunteering_section ?? true,
            showAboutSection:            raw.show_about_section ?? true,
            showProjectsSection:         raw.show_projects_section ?? true,
            showQuizzesSection:          raw.show_quizzes_section ?? true,
            showTypingTestSection:       raw.show_typing_test_section ?? true,
            showFeedbackSection:         raw.show_feedback_section ?? true,
            showGamesSection:            raw.show_games_section ?? true,
            showLiveSessionsSection:     raw.show_live_sessions_section ?? true,
            showKnowAboutYouSection:     raw.show_know_about_you_section ?? true,
            showTreeSection:             raw.show_tree_section ?? true,
            clickEffect:                 raw.click_effect ?? "none",
        };

        return NextResponse.json(profile);
    } catch (error: unknown) {
        console.error("GET Profile failed:", error);
        return NextResponse.json(DEFAULT_PROFILE);
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await req.json();

        // Ensure all new columns exist on the production DB
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS click_effect TEXT DEFAULT 'none'`).catch(() => {});
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_know_about_you_section BOOLEAN DEFAULT true`).catch(() => {});
        await db.execute(sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS show_tree_section BOOLEAN DEFAULT true`).catch(() => {});

        const existingRows = await db.select().from(profiles).orderBy(desc(profiles.updatedAt)).limit(1);
        const existing = existingRows[0] ?? null;

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
            showKnowAboutYouSection: data.showKnowAboutYouSection,
            showTreeSection: data.showTreeSection ?? true,
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
    } catch (error: unknown) {
        console.error("POST Profile failed:", error);
        return NextResponse.json({ error: "Database save failed." }, { status: 500 });
    }
}
