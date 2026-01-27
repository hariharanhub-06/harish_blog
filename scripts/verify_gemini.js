
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

async function test() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const geminiKey = env.match(/GOOGLE_GEMINI_API_KEY=['\"]?(.*?)['\"]?(\r?\n|$)/)[1].trim();
        const genAI = new GoogleGenerativeAI(geminiKey);
        const genModel = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: 'Respond with the word "Green".'
        });

        console.log('Sending request to Gemini...');
        const result = await genModel.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
        });
        console.log('GEMINI SUCCESS:', result.response.text().trim());
    } catch (e) {
        console.error('GEMINI FAILED:', e.message);
        process.exit(1);
    }
}

test();
