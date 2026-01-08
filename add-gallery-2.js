import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function addImage() {
    try {
        const imagePath = "C:/Users/Hari Haran/.gemini/antigravity/brain/28e34df5-ac60-4206-a292-0e75ebec2c6a/uploaded_image_1767869771179.png";
        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`;

        const title = "Interactive Coding Seminar";
        const location = "Coimbatore, India";

        await sql`
            INSERT INTO gallery (title, location, image_url, created_at)
            VALUES (${title}, ${location}, ${base64Image}, NOW())
        `;

        console.log("SUCCESS: Second image added to gallery.");
    } catch (error) {
        console.error("ERROR:", error);
    }
}

addImage();
