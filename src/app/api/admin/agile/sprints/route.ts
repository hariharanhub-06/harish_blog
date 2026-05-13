import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

const NOT_IMPLEMENTED = NextResponse.json({ error: "Agile module not yet implemented" }, { status: 501 });

export async function GET(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    return NOT_IMPLEMENTED;
}

export async function POST(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    return NOT_IMPLEMENTED;
}

export async function DELETE(req: Request) {
    const authError = await validateAdminSession(req);
    if (authError) return authError;
    return NOT_IMPLEMENTED;
}
