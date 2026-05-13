import { NextResponse } from "next/server";
import { db } from "@/db";
import { volunteering } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const data = await db.select({
            id: volunteering.id,
            role: volunteering.role,
            organization: volunteering.organization,
            logo: volunteering.logo,
            duration: volunteering.duration,
            displayOrder: volunteering.displayOrder,
        }).from(volunteering).orderBy(asc(volunteering.displayOrder));
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const body = await req.json();
        const { id, ...data } = body;
        console.log("Volunteering POST data:", data);
        if (id) {
            await db.update(volunteering).set(data).where(eq(volunteering.id, id));
        } else {
            await db.insert(volunteering).values(data);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Volunteering POST error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        await db.delete(volunteering).where(eq(volunteering.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
