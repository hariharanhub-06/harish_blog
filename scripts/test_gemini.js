require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function test() {
    console.log("Testing Gemini API Key...");
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: No GOOGLE_GEMINI_API_KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelId = "gemini-2.5-flash";
    console.log(`Testing [${modelId}]...`);
    const model = genAI.getGenerativeModel({ model: modelId });

    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();
        console.log("SUCCESS! Gemini Response:", text);
    } catch (error) {
        console.error("GEMINI API ERROR FULL:", error);
        console.error("ERROR MESSAGE:", error.message);
    }
}

test();
