import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
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
    } catch (error: any) {
        console.error("ImageKit Auth Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
