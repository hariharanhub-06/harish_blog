import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const path = formData.get("path") as string || "uploads";

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert File to ArrayBuffer for firebase uploadBytes
        const arrayBuffer = await file.arrayBuffer();
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);

        // Upload to Firebase Storage (Server-side, so no CORS issues)
        await uploadBytes(storageRef, arrayBuffer);
        const url = await getDownloadURL(storageRef);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
    }
}
