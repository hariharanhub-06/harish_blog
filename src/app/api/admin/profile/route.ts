import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const profile = await db.query.profiles.findFirst();
        return NextResponse.json(profile || {});
    } catch (error: any) {
        console.error("GET Profile failed:", error);
        return NextResponse.json({
            error: "Database error. Please run /api/repair-db",
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const existing = await db.query.profiles.findFirst();

        if (existing) {
            await db.update(profiles).set({
                name: data.name,
                headline: data.headline,
                bio: data.bio,
                about: data.about,
                email: data.email,
                location: data.location,
                avatarUrl: data.avatarUrl,
                heroImageUrl: data.heroImageUrl,
                aboutImageUrl: data.aboutImageUrl,
                socialLinks: data.socialLinks,
                stats: data.stats,
                trainingStats: data.trainingStats,
                audioUrl: data.audioUrl,
                featuredVideoUrl: data.featuredVideoUrl,
                updatedAt: new Date(),
            }).where(eq(profiles.id, existing.id));
        } else {
            await db.insert(profiles).values(data);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("POST Profile failed:", error);
        return NextResponse.json({
            error: "Database save failed. Please run /api/repair-db",
            details: error.message
        }, { status: 500 });
    }
}
