require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    console.log("Fetching available models...");
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: No GOOGLE_GEMINI_API_KEY found.");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // In the newer SDKs, genAI doesn't have listModels directly on the main instance sometimes,
        // it depends on the version. But usually it's there or via a specific client.
        // Actually, the common way is to use the countTokens or generateContent but 
        // listModels is part of the API.

        // Let's try a direct fetch to the discovery endpoint if the SDK doesn't expose it cleanly.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(", ")})`);
            });
        } else {
            console.log("No models found or error:", data);
        }
    } catch (error) {
        console.error("DEBUG ERROR:", error.message);
    }
}

list();
