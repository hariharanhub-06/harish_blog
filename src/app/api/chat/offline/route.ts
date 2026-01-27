
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, mobile, message } = body;

        if (!name || !mobile || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
        }

        const sql = neon(dbUrl);

        await sql`
            INSERT INTO contact_submissions (name, email, mobile, message, status, category, subject)
            VALUES (${name}, ${email || ""}, ${mobile}, ${message}, 'Fresh', 'Chat Fallback', 'Offline Chat Message')
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Offline message save error:", error);
        return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }
}
