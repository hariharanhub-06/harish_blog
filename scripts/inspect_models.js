const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            const targets = data.models.filter(m =>
                m.name.includes("gemini-1.5-flash") ||
                m.name.includes("gemini-2.0-flash") ||
                m.name.includes("gemini-flash-latest")
            );
            console.log("CANDIDATE MODELS DETAILS:");
            targets.forEach(m => {
                console.log(`- NAME: ${m.name}`);
                console.log(`  DISPLAY NAME: ${m.displayName}`);
                console.log(`  DESCRIPTION: ${m.description}`);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

listModels();
