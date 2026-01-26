require('dotenv').config({ path: '.env.local' });

async function rawTest() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    console.log("--- RAW v1 TEST ---");

    // Testing the most standard model in the v1 API
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "hi" }] }]
            })
        });

        const status = response.status;
        const data = await response.json();

        console.log(`Status: ${status}`);
        if (status === 200) {
            console.log("SUCCESS ✅");
            console.log("Response:", data.candidates[0].content.parts[0].text);
        } else {
            console.log("FAILED ❌");
            console.log("JSON:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("FETCH ERROR:", e.message);
    }
}

rawTest();
