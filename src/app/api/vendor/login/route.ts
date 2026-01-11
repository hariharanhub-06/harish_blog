import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { vendors } from "@/db/schema";
import { eq } from "drizzle-orm";

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email)).limit(1);

        if (!vendor || vendor.password !== password) { // Plaintext for now as per previous plan
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: vendor.id, email: vendor.email, type: 'vendor' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return vendor info and token
        return NextResponse.json({
            success: true,
            token,
            vendor: {
                id: vendor.id,
                name: vendor.name,
                email: vendor.email,
                pickupLocationId: vendor.pickupLocationId
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
