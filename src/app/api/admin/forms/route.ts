import { db } from "@/db";
import { forms } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const data = await db.select().from(forms).orderBy(desc(forms.createdAt));
        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/admin/forms error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        const newForm = await db.insert(forms).values({
            title,
            description: description || "",
            isPublished: false,
        }).returning();

        return NextResponse.json(newForm[0]);
    } catch (error) {
        console.error("POST /api/admin/forms error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
