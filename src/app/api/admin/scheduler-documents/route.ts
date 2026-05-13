import { db } from "@/db";
import { schedulerDocuments } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const docs = await db.query.schedulerDocuments.findMany({
            orderBy: [desc(schedulerDocuments.createdAt)]
        });
        return NextResponse.json(docs);
    } catch (error) {
        console.error("Failed to fetch documents:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const body = await req.json();
        const { name, fileUrl } = body;

        if (!name || !fileUrl) {
            return NextResponse.json({ error: "Missing name or fileUrl" }, { status: 400 });
        }

        const result = await db.insert(schedulerDocuments).values({
            name,
            fileUrl,
            isActive: true
        }).returning();

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error("Failed to create document:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await db.delete(schedulerDocuments).where(eq(schedulerDocuments.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete document:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
