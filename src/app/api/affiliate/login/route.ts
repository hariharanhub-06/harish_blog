import { NextResponse } from "next/server";
import { db } from "@/db";
import { affiliates } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { mobile, password } = body;

        if (!mobile || !password) {
            return NextResponse.json(
                { error: "Mobile number and Password are required" },
                { status: 400 }
            );
        }

        // Search for affiliate with matching mobile
        const [affiliate] = await db
            .select()
            .from(affiliates)
            .where(eq(affiliates.mobile, mobile))
            .limit(1);

        if (!affiliate) {
            return NextResponse.json(
                { error: "No account found with this mobile number." },
                { status: 401 }
            );
        }

        // Check password and status
        if (affiliate.password !== password) {
            return NextResponse.json(
                { error: "Invalid password." },
                { status: 401 }
            );
        }

        if (affiliate.status !== 'Approved') {
            return NextResponse.json(
                { error: "Your account is not yet approved by an admin." },
                { status: 401 }
            );
        }


        // For simplicity, we return the affiliate data. 
        // In a production app, you'd set a JWT cookie here.
        return NextResponse.json({
            success: true,
            affiliate: {
                id: affiliate.id,
                fullName: affiliate.fullName,
                couponCode: affiliate.couponCode,
            }
        });

    } catch (error) {
        console.error("Affiliate login error:", error);
        return NextResponse.json(
            { error: "Login failed. Please try again." },
            { status: 500 }
        );
    }
}
