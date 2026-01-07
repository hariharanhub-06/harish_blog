import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    const profile = await db.query.profiles.findFirst();
    return NextResponse.json(profile || {});
}

export async function POST(req: Request) {
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
            socialLinks: data.socialLinks,
            updatedAt: new Date(),
        }).where(eq(profiles.id, existing.id));
    } else {
        await db.insert(profiles).values(data);
    }

    return NextResponse.json({ success: true });
}
