import { db } from "@/db";
import { youtubeVideos } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const allVideos = await db.query.youtubeVideos.findMany({
            orderBy: [desc(youtubeVideos.displayOrder), desc(youtubeVideos.createdAt)],
        });
        return NextResponse.json(allVideos);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, title, youtubeVideoId, thumbnailUrl, description, category, displayOrder, isActive } = body;

        if (id) {
            // Update
            const updated = await db.update(youtubeVideos)
                .set({ title, youtubeVideoId, thumbnailUrl, description, category, displayOrder, isActive })
                .where(eq(youtubeVideos.id, id))
                .returning();
            return NextResponse.json(updated[0]);
        } else {
            // Create
            const created = await db.insert(youtubeVideos)
                .values({ title, youtubeVideoId, thumbnailUrl, description, category, displayOrder, isActive })
                .returning();
            return NextResponse.json(created[0]);
        }
    } catch (error) {
        return NextResponse.json({ error: "Failed to save video" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(youtubeVideos).where(eq(youtubeVideos.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
    }
}
