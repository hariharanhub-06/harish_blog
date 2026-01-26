require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function diagnose() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Most likely candidates that should have free tier
    const models = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-8b",
        "gemini-1.5-pro",
        "gemini-1.0-pro"
    ];

    console.log("--- SYSTEM DIAGNOSTIC ---");
    for (const mId of models) {
        process.stdout.write(`Testing [${mId}]... `);
        try {
            const model = genAI.getGenerativeModel({ model: mId });
            const result = await model.generateContent("ping");
            console.log("SUCCESS ✅");
            console.log(`>>> RECOMMENDED MODEL: "${mId}"`);
            return;
        } catch (e) {
            const msg = e.message.split('\n')[0].substring(0, 100);
            if (msg.includes("404")) {
                console.log("NOT FOUND ❌");
            } else if (msg.includes("429")) {
                console.log("RATE LIMITED/NO QUOTA ⚠️");
            } else {
                console.log(`FAILED ❌ (${msg})`);
            }
        }
    }
    console.log("--- DIAGNOSTIC COMPLETE ---");
}

diagnose();
