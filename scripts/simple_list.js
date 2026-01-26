require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function list() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log("Checking API Key: " + (apiKey ? "Present" : "Missing"));

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            console.log("Error listing models: " + response.status + " " + response.statusText);
            const text = await response.text();
            console.log(text);
            return;
        }

        const data = await response.json();
        if (data.models) {
            console.log("--- START MODEL LIST ---");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(m.name);
                }
            });
            console.log("--- END MODEL LIST ---");
        } else {
            console.log("No models found in response.");
        }
    } catch (e) {
        console.error("Script Error:", e);
    }
}

list();
