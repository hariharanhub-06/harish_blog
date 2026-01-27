
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const envPath = fs.existsSync(path.join(__dirname, '..', '.env.local'))
    ? path.join(__dirname, '..', '.env.local')
    : path.join(__dirname, '.env.local');
const env = fs.readFileSync(envPath, 'utf8');

const groqMatch = env.match(/GROQ_API_KEY=(.*)/);
const geminiMatch = env.match(/GOOGLE_GEMINI_API_KEY=["']?(.*?)["']?(\r?\n|$)/);

const GROQ_API_KEY = groqMatch ? groqMatch[1].trim() : null;
const GEMINI_API_KEY = geminiMatch ? geminiMatch[1].trim() : null;

console.log('--- DIAGNOSTIC START ---');
console.log('GROQ KEY:', GROQ_API_KEY ? 'Present (' + GROQ_API_KEY.substring(0, 10) + '...)' : 'Missing');
console.log('GEMINI KEY:', GEMINI_API_KEY ? 'Present (' + GEMINI_API_KEY.substring(0, 10) + '...)' : 'Missing');

async function testGroq() {
    if (!GROQ_API_KEY) return;
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    console.log('\n[Testing Groq 8B]');
    try {
        const start = Date.now();
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say "Groq 8B is OK"' }],
            model: 'llama-3.1-8b-instant',
            max_tokens: 20
        });
        console.log('Result:', completion.choices[0].message.content);
        console.log('Time:', Date.now() - start, 'ms');
    } catch (e) {
        console.error('FAILED:', e.message);
    }

    console.log('\n[Testing Groq 70B]');
    try {
        const start = Date.now();
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say "Groq 70B is OK"' }],
            model: 'llama-3.3-70b-versatile',
            max_tokens: 20
        });
        console.log('Result:', completion.choices[0].message.content);
        console.log('Time:', Date.now() - start, 'ms');
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}

async function testGemini() {
    if (!GEMINI_API_KEY) return;
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    console.log('\n[Testing Gemini 1.5 Flash]');
    try {
        const start = Date.now();
        // Use a very safe prompt to avoid safety filters
        const result = await model.generateContent("Respond with the word 'Blue'.");
        console.log('Result:', result.response.text().trim());
        console.log('Time:', Date.now() - start, 'ms');
    } catch (e) {
        console.error('FAILED:', e.message);
    }
}

async function run() {
    await testGroq();
    await testGemini();
    console.log('\n--- DIAGNOSTIC END ---');
}

run();
