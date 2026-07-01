import { db } from "@/db";
import { gameAssets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Public, unauthenticated read-only endpoint so the games (Memory Card, Picture
// Puzzle) can load their custom assets when viewed by non-admin visitors.
// Admin create/list/delete stays on the authenticated /api/admin/game-assets route.
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get("gameId");

        const rows = gameId
            ? await db.select().from(gameAssets).where(and(eq(gameAssets.gameId, gameId), eq(gameAssets.isActive, true)))
            : await db.select().from(gameAssets).where(eq(gameAssets.isActive, true));

        // Only expose fields the public games actually need.
        const assets = rows.map((a) => ({ id: a.id, assetUrl: a.assetUrl, assetType: a.assetType }));

        return NextResponse.json(assets);
    } catch (error: any) {
        console.error("GET /api/game-assets failed:", error);
        return NextResponse.json({ error: "Failed to fetch game assets" }, { status: 500 });
    }
}
