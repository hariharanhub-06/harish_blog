import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const path = formData.get("path") as string || "uploads";

        console.log("Upload request received:", { fileName: file?.name, fileSize: file?.size, path });

        if (!file) {
            console.error("Upload failed: No file provided");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Check if storage is initialized with a bucket
        if (!storage.app.options.storageBucket) {
            console.error("Upload failed: Firebase Storage bucket not configured");
            return NextResponse.json({ error: "Firebase Storage bucket not configured. Check your environment variables." }, { status: 500 });
        }

        // Convert File to Uint8Array for firebase uploadBytes (more reliable in Node.js)
        console.log("Converting file to buffer...");
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = ref(storage, `${path}/${fileName}`);

        console.log("Uploading to Firebase Storage:", `${path}/${fileName}`);

        // Upload to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, buffer);
        console.log("Upload result metadata:", uploadResult.metadata);

        const url = await getDownloadURL(storageRef);
        console.log("Upload successful. URL:", url);

        return NextResponse.json({ url });
    } catch (error: any) {
        console.error("CRITICAL UPLOAD FAILURE:", {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({
            error: error.message || "Internal Upload Error",
            debug: "Check server logs for full stack trace."
        }, { status: 500 });
    }
}
