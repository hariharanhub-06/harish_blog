const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function listAllModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            console.log("ACCESSIBLE STABLE FLASH MODELS:");
            data.models.forEach(m => {
                const name = m.name;
                const isFlash = name.includes("flash");
                const isExperimental = name.includes("exp") || name.includes("preview");
                if (isFlash && !isExperimental) {
                    console.log(`- ${name} (Stable)`);
                }
            });
        }
    } catch (error) {
        console.error(error);
    }
}

listAllModels();
