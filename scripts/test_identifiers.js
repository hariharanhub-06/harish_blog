const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config({ path: ".env.local" });

async function testModel() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) return;
    const genAI = new GoogleGenerativeAI(apiKey);

    const models = ["gemini-1.5-flash", "gemini-1.5-flash-001", "gemini-1.5-flash-002", "gemini-2.0-flash"];

    for (const m of models) {
        try {
            console.log(`Testing ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS: ${m} works!`);
        } catch (error) {
            console.log(`FAILED: ${m} - ${error.message}`);
        }
    }
}

testModel();
