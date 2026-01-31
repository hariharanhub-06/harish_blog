
import { db } from "./src/db";
import { youtubeVideos } from "./src/db/schema";

async function checkVideos() {
    const videos = await db.select().from(youtubeVideos);
    console.log(JSON.stringify(videos, null, 2));
    process.exit(0);
}

checkVideos();
