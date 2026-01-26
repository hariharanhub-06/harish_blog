
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, userName } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
        const dbUrl = process.env.DATABASE_URL;

        if (!apiKey) {
            console.error("Missing Google Gemini API Key");
            return NextResponse.json({ error: "API Configuration incomplete (Key missing)" }, { status: 500 });
        }

        if (!dbUrl) {
            console.error("Missing Database URL");
            return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const sql = neon(dbUrl);

        // 1. Fetch AI Config & Context
        let config, profile, projectsData, experiencesData;
        try {
            console.log("DB: Starting fetch...");
            const [configData, profileData, projects, experiences] = await Promise.all([
                sql(`SELECT knowledge_base FROM ai_assistant_config WHERE id = 'default'`),
                sql(`SELECT name, about, headline, location FROM profiles LIMIT 1`),
                sql(`SELECT title, description, technologies FROM projects WHERE featured = true`),
                sql(`SELECT role, company, duration FROM experience ORDER BY "order" ASC`)
            ]);
            console.log("DB: Fetch successful");
            config = configData[0] || {};
            profile = profileData[0] || {};
            projectsData = projects || [];
            experiencesData = experiences || [];
        } catch (dbError: any) {
            console.error("DB Error:", dbError.message);
            return NextResponse.json({ error: "Database failure", details: dbError.message }, { status: 500 });
        }

        // 2. Build System Instruction
        const systemInstruction = `
            Your name is "Thenali". You are the official AI Assistant of Hari Haran Jeyaramamoorthy. 
            Represent Hari perfectly, answer questions about his work/portfolio, and help convert visitors.

            VISITOR CONTEXT:
            - Name: ${userName || "Guest"}

            ABOUT HARI HARAN (STRICT TRUTH):
            Hari is a dynamic multi-skilled personality. He is an expert in Web/App Development, a Business Consultant, a Job Placement Expert, and an Operations & Partnerships Manager. He runs a snack business, loves teaching (sessions in 10+ colleges), and is a Group Rotaract Representative. He is curious, jovial, and always learning.

            LANGUAGES HARI KNOWS (STRICT):
            - English
            - Tamil
            - Tanglish (Tamil-English mix)
            - Note: ONLY admit to knowing these. If asked about French or Hindi, politely say you/Hari prefer stucking to English, Tamil, and Tanglish.

            STRICT PERSONALITY RULES:
            - ALWAYS identify as Thenali IF ASKED, but DO NOT introduce yourself as "Thenali here" or "I am Thenali" in every message.
            - INITIAL RESPONSE: Use the visitor's name (${userName || "Guest"}) to make it personal.
            - MATCH USER LANGUAGE EXACTLY: If they use English, Tamil, or Tanglish, you must respond in that same language/mix. 
            - KEEP RESPONSES VERY SHORT AND CONCISE.
            - BE INTERACTIVE: Always end with a short follow-up question.
            - Never step out of character.
        `;

        // 3. Initialize Gemini
        console.log("GEMINI: Initializing model...");
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemInstruction
        });

        // 4. Start Chat
        console.log("GEMINI: Preparing history...");

        let history: any[] = [];
        let lastRole: string | null = null;

        // Process messages to ensure they start with 'user' and alternate roles
        for (const m of messages.slice(0, -1)) {
            const role = (m.role === "user") ? "user" : "model";
            const content = String(m.content || "").trim();

            if (!content) continue;

            // Must start with user
            if (history.length === 0 && role === "model") continue;

            // Must alternate - Gemini requirement
            if (role === lastRole) {
                history[history.length - 1].parts[0].text += "\n" + content;
            } else {
                history.push({
                    role,
                    parts: [{ text: content }]
                });
                lastRole = role;
            }
        }

        try {
            console.log("GEMINI: Starting chat session...");
            const chat = model.startChat({ history });

            const lastMsg = messages[messages.length - 1];
            const latestMessage = String(lastMsg.content || "").trim();
            if (!latestMessage) {
                return NextResponse.json({ error: "Empty message" }, { status: 400 });
            }

            console.log("GEMINI: Sending message...");
            const result = await chat.sendMessage(latestMessage);
            const responseText = result.response.text();
            console.log("GEMINI: Success");

            return NextResponse.json({ content: responseText });
        } catch (geminiError: any) {
            console.error("GEMINI ERROR FULL:", geminiError);
            let userFriendlyError = geminiError.message || "AI is currently resting.";

            if (geminiError.message?.includes("location is not supported")) {
                userFriendlyError = "Gemini API is not available in your current region.";
            } else if (geminiError.message?.includes("API_KEY_INVALID")) {
                userFriendlyError = "Invalid API Key in .env.local.";
            }

            return NextResponse.json({
                error: "AI processing error",
                details: userFriendlyError,
                raw: geminiError.message
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("GLOBAL Chat Error:", error.message);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
