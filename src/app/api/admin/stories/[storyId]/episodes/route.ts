import { NextResponse } from "next/server";
import { db } from "@/db";
import { storyEpisodes } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getVideoDataFromUrl } from "@/lib/services/youtube";

// GET: Fetch all episodes for a story
export async function GET(
    request: Request,
    { params }: { params: Promise<{ storyId: string }> }
) {
    try {
        const { storyId } = await params;
        const episodes = await db.query.storyEpisodes.findMany({
            where: eq(storyEpisodes.storyId, storyId),
            orderBy: [asc(storyEpisodes.episodeNumber)],
        });

        return NextResponse.json(episodes);
    } catch (error) {
        console.error("Error fetching episodes:", error);
        return NextResponse.json({ error: "Failed to fetch episodes" }, { status: 500 });
    }
}

// POST: Add episode (with YouTube video URL - no API required)
export async function POST(
    request: Request,
    { params }: { params: Promise<{ storyId: string }> }
) {
    try {
        const { storyId } = await params;
        const body = await request.json();
        const { title, description, thumbnailUrl, youtubeVideoUrl, episodeNumber, isActive } = body;

        // If YouTube video URL provided, extract video ID and generate thumbnail
        let videoData = null;
        if (youtubeVideoUrl) {
            videoData = getVideoDataFromUrl(youtubeVideoUrl);
        }

        // Validate video data
        if (!videoData?.videoId) {
            return NextResponse.json(
                { error: "Valid YouTube video URL is required" },
                { status: 400 }
            );
        }

        // Validate title (required since we don't auto-fetch)
        if (!title) {
            return NextResponse.json(
                { error: "Title is required" },
                { status: 400 }
            );
        }

        // Determine episode number
        let newEpisodeNumber = episodeNumber;
        if (!newEpisodeNumber) {
            const existingEpisodes = await db.query.storyEpisodes.findMany({
                where: eq(storyEpisodes.storyId, storyId),
            });
            newEpisodeNumber = existingEpisodes.length + 1;
        }

        // Create episode with manual data + auto-generated thumbnail
        const [newEpisode] = await db
            .insert(storyEpisodes)
            .values({
                storyId: storyId,
                title,
                description: description || null,
                youtubeVideoId: videoData.videoId,
                // Use custom thumbnail if provided, otherwise use auto-generated
                thumbnailUrl: thumbnailUrl || videoData.thumbnailUrl,
                duration: null, // Can be added manually if needed
                episodeNumber: newEpisodeNumber,
                isActive: isActive ?? true,
            })
            .returning();

        return NextResponse.json(newEpisode, { status: 201 });
    } catch (error) {
        console.error("Error creating episode:", error);
        return NextResponse.json({ error: "Failed to create episode" }, { status: 500 });
    }
}

// PUT: Update episode
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ storyId: string }> }
) {
    try {
        const { storyId } = await params;
        const body = await request.json();
        const { episodeId, title, description, thumbnailUrl, episodeNumber, isActive } = body;

        if (!episodeId) {
            return NextResponse.json({ error: "Episode ID is required" }, { status: 400 });
        }

        const [updatedEpisode] = await db
            .update(storyEpisodes)
            .set({
                title,
                description,
                thumbnailUrl,
                episodeNumber,
                isActive,
            })
            .where(eq(storyEpisodes.id, episodeId))
            .returning();

        if (!updatedEpisode) {
            return NextResponse.json({ error: "Episode not found" }, { status: 404 });
        }

        return NextResponse.json(updatedEpisode);
    } catch (error) {
        console.error("Error updating episode:", error);
        return NextResponse.json({ error: "Failed to update episode" }, { status: 500 });
    }
}

// DELETE: Delete episode
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ storyId: string }> }
) {
    try {
        const { storyId } = await params;
        const { searchParams } = new URL(request.url);
        const episodeId = searchParams.get("episodeId");

        if (!episodeId) {
            return NextResponse.json({ error: "Episode ID is required" }, { status: 400 });
        }

        const [deletedEpisode] = await db
            .delete(storyEpisodes)
            .where(eq(storyEpisodes.id, episodeId))
            .returning();

        if (!deletedEpisode) {
            return NextResponse.json({ error: "Episode not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Episode deleted" });
    } catch (error) {
        console.error("Error deleting episode:", error);
        return NextResponse.json({ error: "Failed to delete episode" }, { status: 500 });
    }
}
