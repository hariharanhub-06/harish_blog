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

        // Check if storage is initialized with a bucket
        if (!storage.app.options.storageBucket) {
            return NextResponse.json({ error: "Firebase Storage bucket not configured. Check your environment variables." }, { status: 500 });
        }

        // Convert File to Uint8Array for firebase uploadBytes (more reliable in Node.js)
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);

        // Upload to Firebase Storage
        await uploadBytes(storageRef, buffer);
        const url = await getDownloadURL(storageRef);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("Critical Upload failure:", error);
        return NextResponse.json({
            error: error.message || "Internal Upload Error",
            debug: "Ensure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set correctly."
        }, { status: 500 });
    }
}
