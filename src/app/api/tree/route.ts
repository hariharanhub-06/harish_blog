import { NextResponse } from "next/server";
import { db } from "@/db";
import { treeMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const letters = await db
            .select({
                id: treeMessages.id,
                message: treeMessages.message,
                posX: treeMessages.posX,
                posY: treeMessages.posY,
                color: treeMessages.color,
                createdAt: treeMessages.createdAt,
            })
            .from(treeMessages)
            .where(eq(treeMessages.status, "approved"));

        return NextResponse.json({ letters });
    } catch (error) {
        console.error("Failed to fetch tree letters", error);
        return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
    }
}

function resolveSource(ref: string | null): string {
    if (!ref) return "direct";
    const r = ref.toLowerCase();
    if (r.includes("insta")) return "instagram";
    if (r.includes("fb") || r.includes("facebook")) return "facebook";
    if (r.includes("whatsapp") || r.includes("wa")) return "whatsapp";
    return "direct";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { senderName, message, ref } = body;

        if (!senderName || typeof senderName !== "string" || senderName.trim().length === 0) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        if (!message || typeof message !== "string" || message.trim().length === 0) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }
        if (message.trim().length > 500) {
            return NextResponse.json({ error: "Message too long (max 500 chars)" }, { status: 400 });
        }

        const source = resolveSource(ref ?? null);

        await db.insert(treeMessages).values({
            senderName: senderName.trim(),
            message: message.trim(),
            source,
            sourceRef: ref ?? null,
            status: "pending",
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to submit letter", error);
        return NextResponse.json({ error: "Failed to submit letter" }, { status: 500 });
    }
}
