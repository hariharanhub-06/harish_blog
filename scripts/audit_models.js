const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listAllModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("FULL MODEL CAPABILITIES:");
            data.models.forEach(m => {
                // Check if it's a stable model or a preview/exp
                const name = m.name;
                const isStable = !name.includes("exp") && !name.includes("preview");
                console.log(`- ${name} [${isStable ? "STABLE" : "EXPERIMENTAL/PREVIEW"}]`);
            });
        }
    } catch (error) {
        console.error(error);
    }
}

listAllModels();
