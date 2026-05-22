import { NextResponse } from "next/server";
import crypto from "crypto";
import { validateAdminSession } from "@/lib/adminAuth";

export async function GET(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    try {
        const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
        if (!privateKey) {
            return NextResponse.json({ error: "IMAGEKIT_PRIVATE_KEY is not defined" }, { status: 500 });
        }

        const token = crypto.randomUUID();
        const expire = Math.floor(Date.now() / 1000) + 1800; // 30 mins from now

        const signature = crypto
            .createHmac("sha1", privateKey)
            .update(token + expire)
            .digest("hex");

        return NextResponse.json({
            token,
            expire,
            signature
        });
    } catch (error: unknown) {
        console.error("ImageKit Auth Error:", error);
        return NextResponse.json({ error: "Failed to generate auth token" }, { status: 500 });
    }
}
