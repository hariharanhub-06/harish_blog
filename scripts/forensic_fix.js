require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function solve() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log("Starting Deep Forensic Diagnostic...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (!data.models) {
            console.error("CRITICAL: Failed to list models. Response:", data);
            return;
        }

        const candidates = data.models
            .filter(m => m.supportedGenerationMethods.includes("generateContent"))
            .map(m => m.name.replace('models/', ''));

        console.log(`Found ${candidates.length} candidate models. Testing them one by one...`);

        const genAI = new GoogleGenerativeAI(apiKey);

        for (const modelId of candidates) {
            process.stdout.write(`Testing [${modelId}]... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelId });
                const result = await model.generateContent("hi");
                const text = result.response.text();
                console.log("SUCCESS ✅");
                console.log(`\n>>> THE WORKING MODEL IS: "${modelId}" <<<\n`);
                return;
            } catch (e) {
                console.log(`FAILED ❌ (${e.message.split('\n')[0].substring(0, 50)}...)`);
            }
        }
        console.error("\nCRITICAL FAILURE: No models from the list actually work with generateContent.");
    } catch (error) {
        console.error("DIAGNOSTIC ERROR:", error.message);
    }
}

solve();
