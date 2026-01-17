import { NextResponse } from "next/server";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Fetch single story
export async function GET(
    request: Request,
    { params }: { params: { storyId: string } }
) {
    try {
        const story = await db.query.stories.findFirst({
            where: eq(stories.id, params.storyId),
        });

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        return NextResponse.json(story);
    } catch (error) {
        console.error("Error fetching story:", error);
        return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
    }
}

// PUT: Update story
export async function PUT(
    request: Request,
    { params }: { params: { storyId: string } }
) {
    try {
        const body = await request.json();
        const { title, description, thumbnailUrl, isActive, displayOrder } = body;

        const [updatedStory] = await db
            .update(stories)
            .set({
                title,
                description,
                thumbnailUrl,
                isActive,
                displayOrder,
                updatedAt: new Date(),
            })
            .where(eq(stories.id, params.storyId))
            .returning();

        if (!updatedStory) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        return NextResponse.json(updatedStory);
    } catch (error) {
        console.error("Error updating story:", error);
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
    }
}

// DELETE: Delete story and all episodes
export async function DELETE(
    request: Request,
    { params }: { params: { storyId: string } }
) {
    try {
        // Delete story (episodes will cascade if foreign key constraint is set)
        const [deletedStory] = await db
            .delete(stories)
            .where(eq(stories.id, params.storyId))
            .returning();

        if (!deletedStory) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Story deleted" });
    } catch (error) {
        console.error("Error deleting story:", error);
        return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
    }
}
