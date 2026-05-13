import { db } from "@/db";
import { travelledPlaces } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    try {
        const places = await db.select().from(travelledPlaces).orderBy(travelledPlaces.createdAt);
        return NextResponse.json(places);
    } catch {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    try {
        const { cityName, country, lat, lng } = await req.json();
        if (!cityName?.trim() || !country?.trim() || lat == null || lng == null) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        const [place] = await db.insert(travelledPlaces).values({
            cityName: cityName.trim(),
            country: country.trim(),
            lat: parseFloat(lat),
            lng: parseFloat(lng),
        }).returning();
        if (!place) return NextResponse.json({ error: "Failed to save" }, { status: 500 });
        return NextResponse.json(place, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to save" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
        await db.delete(travelledPlaces).where(eq(travelledPlaces.id, id));
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
