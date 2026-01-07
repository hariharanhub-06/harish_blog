import { db } from "@/db";
import { contactSubmissions } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validation could go here
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await db.insert(contactSubmissions).values({
            name: body.name,
            email: body.email,
            subject: body.subject || "No Subject", // Default subject if missing
            message: body.message,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
