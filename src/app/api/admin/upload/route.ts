import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/adminAuth";

export async function POST(req: Request) {
    try {
        const authError = await validateAdminSession(req);
        if (authError) return authError;
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const ALLOWED_PATH_PREFIXES = ["uploads", "profile", "projects", "gallery", "assets", "sessions", "partners", "misc"];
        const requestedPath = (formData.get("path") as string || "").trim().replace(/^\/+/, "");
        const pathPrefix = requestedPath.split("/")[0];
        const path = ALLOWED_PATH_PREFIXES.includes(pathPrefix) ? requestedPath : "uploads";

        console.log("Upload request received:", { fileName: file?.name, fileSize: file?.size, path });

        if (!file) {
            console.error("Upload failed: No file provided");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const ALLOWED_MIME = ["image/jpeg","image/png","image/webp","image/gif","image/svg+xml","video/mp4","video/webm","audio/mpeg","audio/mp3","audio/wav"];
        if (!ALLOWED_MIME.includes(file.type)) {
            return NextResponse.json({ error: `File type '${file.type}' is not allowed.` }, { status: 400 });
        }

        const MAX_SIZE = 100 * 1024 * 1024; // 100MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File too large. Maximum 100MB allowed." }, { status: 400 });
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
    } catch (error: unknown) {
        console.error("CRITICAL UPLOAD FAILURE:", error);
        return NextResponse.json({ error: "Upload failed. Check server logs." }, { status: 500 });
    }
}
