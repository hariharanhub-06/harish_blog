import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
    try {
        const { name, email, mobile } = await req.json();

        if (!name || !email || !mobile) {
            return NextResponse.json({ error: "Name, email, and mobile are required" }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL!);

        // Save to contact_submissions so it appears in Admin Messages
        await sql(`
            INSERT INTO contact_submissions (
                name, 
                email, 
                mobile, 
                subject, 
                message, 
                category, 
                status
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7
            )
        `, [
            name,
            email,
            mobile,
            "New Lead (AI Chat)",
            `Lead captured via AI Chat. \nEmail: ${email}\nMobile: ${mobile}`,
            "AI Lead",
            "Fresh"
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Lead Capture Error:", error);
        return NextResponse.json({ error: "Failed to save lead information" }, { status: 500 });
    }
}
