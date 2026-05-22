import { NextResponse } from "next/server";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = process.env.STREAM_API_KEY!;
const apiSecret = process.env.STREAM_API_SECRET!;

export async function POST(req: Request) {
    try {
        const { userId, name } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        if (!apiKey || !apiSecret) {
            return NextResponse.json({ error: "Stream API credentials not configured" }, { status: 500 });
        }

        const client = new StreamClient(apiKey, apiSecret);

        // Optional: Upsert user to Stream if needed, but token generation alone is enough for joining
        // await client.upsertUsers([{ id: userId, name: name || userId }]);

        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const issuedAt = Math.floor(Date.now() / 1000) - 60;

        const token = client.generateUserToken({ user_id: userId, validity_in_seconds: 3600 });

        return NextResponse.json({ token, apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY || apiKey });
    } catch (error) {
        console.error("Stream token generation failed:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
