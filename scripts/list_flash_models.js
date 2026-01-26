const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("API Key not found in .env.local");
        return;
    }

    try {
        console.log("Fetching flash-capable models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            const flashModels = data.models.filter(m => m.name.toLowerCase().includes("flash"));
            console.log("ACCESSIBLE FLASH MODELS:");
            flashModels.forEach(m => {
                console.log(`- ${m.name}`);
            });
        } else {
            console.log("No models returned. Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
