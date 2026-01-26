const { GoogleGenerativeAI } = require("@google/generative-ai");

// INSTRUCTIONS: 
// 1. Create a NEW API Key in Google AI Studio (try a new Project).
// 2. Paste it below and run 'node scripts/test_new_key.js'
const TEST_API_KEY = "PASTE_YOUR_NEW_KEY_HERE";

async function verifyNewKey() {
    if (TEST_API_KEY === "PASTE_YOUR_NEW_KEY_HERE") {
        console.error("Please paste a new API Key in the script first!");
        return;
    }

    const genAI = new GoogleGenerativeAI(TEST_API_KEY);

    try {
        console.log("Checking model availability for THIS key...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${TEST_API_KEY}`);
        const data = await response.json();

        if (data.models) {
            const has15Flash = data.models.some(m => m.name.includes("gemini-1.5-flash"));
            console.log("\n--- RESULT ---");
            if (has15Flash) {
                console.log("✅ SUCCESS: This key has access to Gemini 1.5 Flash (1,500 RPD).");
                console.log("You can safely put this key in your .env.local file!");
            } else {
                console.log("❌ RESTRICTED: This key is also limited to experimental models (20 RPD).");
                console.log("Suggestion: Try creating the key under a DIFFERENT Google Account.");
            }
        } else {
            console.log("Invalid Key or API Error:", data);
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

verifyNewKey();
