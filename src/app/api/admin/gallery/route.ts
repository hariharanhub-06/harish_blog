import { db } from "@/db";
import { gallery } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const items = await db.select().from(gallery).orderBy(gallery.createdAt);
        return NextResponse.json(items);
    } catch (error) {
        console.error("Gallery GET error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        console.log("Gallery POST data:", data);

        // Handle both new items and updates
        if (data.id) {
            const { id, createdAt, ...updateData } = data;
            await db.update(gallery).set(updateData).where(eq(gallery.id, id));
        } else {
            await db.insert(gallery).values(data);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Gallery POST error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await db.delete(gallery).where(eq(gallery.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Gallery DELETE error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
