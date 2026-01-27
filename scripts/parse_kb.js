
const fs = require('fs');
const path = require('path');

const RAW_FILE = path.join(__dirname, '../src/data/chatbot_raw.txt');
const OUT_FILE = path.join(__dirname, '../src/data/knowledge_base.json');

try {
    const rawData = fs.readFileSync(RAW_FILE, 'utf-8');
    const lines = rawData.split('\n');
    const qaPairs = [];

    let currentQ = null;
    let currentA = [];
    let currentId = null;

    // Regex to match "1. Question" or "1001. Question"
    // Also handling Q: and A: formats if present
    const qRegex = /^(\d+)\s*[\.:]\s*(.+)/;
    const qAltRegex = /^Q:\s*(.+)/;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Check for new Question number
        const qMatch = trimmed.match(qRegex);
        if (qMatch) {
            // Save previous
            if (currentQ) {
                qaPairs.push({
                    id: currentId,
                    question: currentQ,
                    answer: currentA.join('\n').trim()
                });
            }
            // Start new
            currentId = qMatch[1];
            currentQ = qMatch[2];
            currentA = [];
            return;
        }

        // Check for "Q:" format
        const qAltMatch = trimmed.match(qAltRegex);
        if (qAltMatch) {
            if (currentQ) {
                qaPairs.push({
                    id: currentId || 'gen_' + Date.now(),
                    question: currentQ,
                    answer: currentA.join('\n').trim()
                });
            }
            currentId = 'gen_' + Math.random().toString(36).substr(2, 9);
            currentQ = qAltMatch[1];
            currentA = [];
            return;
        }

        // It's part of the answer (or A: prefix)
        if (currentQ) {
            let answerLine = trimmed;
            if (answerLine.startsWith('A:') || answerLine.startsWith('Answer:')) { // Remove A: prefix
                answerLine = answerLine.replace(/^(A:|Answer:)\s*/, '');
            }
            if (answerLine.startsWith('Bot:')) { // Remove Bot: prefix
                answerLine = answerLine.replace(/^Bot:\s*/, '');
            }
            currentA.push(answerLine);
        }
    });

    // Push last one
    if (currentQ) {
        qaPairs.push({
            id: currentId,
            question: currentQ,
            answer: currentA.join('\n').trim()
        });
    }

    // Write to JSON
    fs.writeFileSync(OUT_FILE, JSON.stringify(qaPairs, null, 2));
    console.log(`Successfully parsed ${qaPairs.length} Q&A items to ${OUT_FILE}`);

} catch (err) {
    console.error("Error parsing KB:", err);
}
