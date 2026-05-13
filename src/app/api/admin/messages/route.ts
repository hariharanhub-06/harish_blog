import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const limit = Math.min(parseInt(searchParams.get("limit") || "50") || 50, 500);
        const offset = parseInt(searchParams.get("offset") || "0") || 0;

        const data = await db.select({
            id: contactSubmissions.id,
            name: contactSubmissions.name,
            company: contactSubmissions.company,
            businessType: contactSubmissions.businessType,
            requestedService: contactSubmissions.requestedService,
            mobile: contactSubmissions.mobile,
            email: contactSubmissions.email,
            website: contactSubmissions.website,
            socialMedia: contactSubmissions.socialMedia,
            category: contactSubmissions.category,
            status: contactSubmissions.status,
            subject: contactSubmissions.subject,
            message: contactSubmissions.message,
            adminNotes: contactSubmissions.adminNotes,
            createdAt: contactSubmissions.createdAt,
        }).from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt)).limit(limit).offset(offset);

        return NextResponse.json(data);
    } catch (error) {
        console.error("GET /api/admin/messages error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ success: false }, { status: 400 });
        await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE /api/admin/messages error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const body = await req.json();
        const { id, category, status, adminNotes } = body;

        if (!id) {
            return NextResponse.json({ error: "Missing ID" }, { status: 400 });
        }

        await db.update(contactSubmissions)
            .set({ category, status, adminNotes })
            .where(eq(contactSubmissions.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("PUT /api/admin/messages error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
