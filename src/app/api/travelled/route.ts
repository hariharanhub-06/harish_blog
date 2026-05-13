import { db } from "@/db";
import { travelledPlaces } from "@/db/schema";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const places = await db.select().from(travelledPlaces);
        return NextResponse.json(places);
    } catch {
        return NextResponse.json([]);
    }
}
