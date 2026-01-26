const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function verifyModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        console.log("Listing all available models for your API Key...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            // Filter and prioritize high-quota candidates
            const candidates = data.models.filter(m =>
                m.name.includes("flash") &&
                !m.name.includes("2.5") // AVOID 2.5 as it has the 20-req limit
            );

            console.log("\nRECOMMENDED HIGH-QUOTA MODELS:");
            candidates.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });

            if (candidates.length === 0) {
                console.log("\nNo high-quota Flash models found. Listing ALL available models:");
                data.models.forEach(m => console.log(`- ${m.name}`));
            }
        } else {
            console.log("Error fetching models:", data);
        }
    } catch (error) {
        console.error("SDK Error:", error);
    }
}

verifyModels();
