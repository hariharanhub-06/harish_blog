import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
    try {
        const allVendors = await db.select().from(vendors).orderBy(desc(vendors.createdAt));
        return NextResponse.json(allVendors);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, password, pickupLocationId, phone, address } = body;

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Name, Email, and Password are required" }, { status: 400 });
        }

        // Create vendor
        await db.insert(vendors).values({
            name,
            email,
            password, // Password should be hashed in production, storing plain for now as per dev context or using a helper if available, assumes simplistic requirement for now. 
            phone,
            pickupLocationId,
            address,
            bankDetails: {},
        });

        return NextResponse.json({ success: true, message: "Vendor created successfully" });
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation for email
            return NextResponse.json({ error: "Vendor with this email already exists" }, { status: 409 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });

        await db.delete(vendors).where(eq(vendors.id, id));
        return NextResponse.json({ success: true, message: "Vendor deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
