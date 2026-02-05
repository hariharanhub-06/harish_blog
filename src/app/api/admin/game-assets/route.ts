import { db } from "@/db";
import { gameAssets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get("gameId");

        let assets;
        if (gameId) {
            assets = await db.select().from(gameAssets).where(eq(gameAssets.gameId, gameId));
        } else {
            assets = await db.select().from(gameAssets);
        }

        return NextResponse.json(assets);
    } catch (error: any) {
        console.error("GET Game Assets failed:", error);
        return NextResponse.json({ error: "Failed to fetch game assets" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { gameId, assetUrl } = data;

        if (!gameId || !assetUrl) {
            return NextResponse.json({ error: "gameId and assetUrl are required" }, { status: 400 });
        }

        const newAsset = await db.insert(gameAssets).values({
            gameId,
            assetUrl,
            assetType: "image",
            isActive: true,
        }).returning();

        revalidatePath("/");
        return NextResponse.json(newAsset[0]);
    } catch (error: any) {
        console.error("POST Game Asset failed:", error);
        return NextResponse.json({ error: "Failed to save game asset" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "id is required" }, { status: 400 });
        }

        await db.delete(gameAssets).where(eq(gameAssets.id, id));

        revalidatePath("/");
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("DELETE Game Asset failed:", error);
        return NextResponse.json({ error: "Failed to delete game asset" }, { status: 500 });
    }
}
