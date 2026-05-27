import { NextResponse } from "next/server";
import { db } from "@/db";
import { treeMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

const BRANCH_POSITIONS = [
    { x: 48, y: 15 }, { x: 30, y: 22 }, { x: 65, y: 20 },
    { x: 20, y: 35 }, { x: 75, y: 32 }, { x: 38, y: 28 },
    { x: 58, y: 25 }, { x: 25, y: 42 }, { x: 70, y: 40 },
    { x: 42, y: 38 }, { x: 55, y: 18 }, { x: 35, y: 45 },
    { x: 62, y: 35 }, { x: 22, y: 50 }, { x: 78, y: 45 },
    { x: 45, y: 52 }, { x: 52, y: 42 }, { x: 28, y: 30 },
    { x: 68, y: 28 }, { x: 40, y: 20 }, { x: 60, y: 48 },
    { x: 18, y: 38 }, { x: 80, y: 38 }, { x: 50, y: 30 },
    { x: 32, y: 55 }, { x: 72, y: 55 }, { x: 44, y: 60 },
    { x: 56, y: 58 }, { x: 36, y: 33 }, { x: 64, y: 12 },
];

const LETTER_COLORS = [
    "#fef3c7", "#fce7f3", "#e0f2fe", "#dcfce7",
    "#fef9c3", "#ffe4e6", "#f3e8ff",
];

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        let rows;
        if (status && ["pending", "approved", "rejected"].includes(status)) {
            rows = await db
                .select()
                .from(treeMessages)
                .where(eq(treeMessages.status, status))
                .orderBy(desc(treeMessages.createdAt));
        } else {
            rows = await db
                .select()
                .from(treeMessages)
                .orderBy(desc(treeMessages.createdAt));
        }

        return NextResponse.json({ letters: rows });
    } catch (error) {
        console.error("Failed to fetch tree letters (admin)", error);
        return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const body = await req.json();
        const { id, status } = body;

        if (!id || !["approved", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        if (status === "approved") {
            // Assign a branch position and color
            const approved = await db
                .select({ posX: treeMessages.posX, posY: treeMessages.posY })
                .from(treeMessages)
                .where(eq(treeMessages.status, "approved"));

            const usedPositions = new Set(
                approved.map((r) => `${r.posX},${r.posY}`)
            );

            const available = BRANCH_POSITIONS.filter(
                (p) => !usedPositions.has(`${p.x},${p.y}`)
            );

            const pos =
                available.length > 0
                    ? available[Math.floor(Math.random() * available.length)]
                    : BRANCH_POSITIONS[Math.floor(Math.random() * BRANCH_POSITIONS.length)];

            const color =
                LETTER_COLORS[Math.floor(Math.random() * LETTER_COLORS.length)];

            await db
                .update(treeMessages)
                .set({ status: "approved", posX: pos.x, posY: pos.y, color })
                .where(eq(treeMessages.id, id));
        } else {
            await db
                .update(treeMessages)
                .set({ status: "rejected" })
                .where(eq(treeMessages.id, id));
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update letter status", error);
        return NextResponse.json({ error: "Failed to update letter" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }

        await db.delete(treeMessages).where(eq(treeMessages.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete letter", error);
        return NextResponse.json({ error: "Failed to delete letter" }, { status: 500 });
    }
}
