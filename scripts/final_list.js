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
                m.name.includes("gemini-flash-latest") ||
                m.name.includes("gemini-2.5-flash")
            );
            console.log("ACCURATE MODEL LIST:");
            targets.forEach(m => {
                console.log(`[${m.name}] -> ${m.description} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

listModels();
