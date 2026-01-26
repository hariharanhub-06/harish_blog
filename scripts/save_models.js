const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

async function listModels() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            const list = data.models.map(m => m.name).join("\n");
            fs.writeFileSync("available_models.txt", list, "utf8");
            console.log("Written available_models.txt");
        }
    } catch (error) {
        console.error(error);
    }
}

listModels();
