
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages } = body;

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
            You are the "AI Twin" and Digital Assistant of Hari Haran Jeyaramamoorthy. 
            Your goal is to represent Hari perfectly, answer questions about his work, and help convert visitors into clients or partners.

            HARI'S MASTER KNOWLEDGE BASE:
            ${config.knowledge_base || "Professional, confident assistant."}

            HARI'S LIVE PROFILE INFO:
            - Name: ${profile.name || "Hari Haran"}
            - Headline: ${profile.headline || ""}
            - Location: ${profile.location || "Tamil Nadu, India"}
            - About: ${profile.about || ""}

            FEATURED PROJECTS:
            ${projectsData.map((p: any) => `- ${p.title}: ${p.description}`).join("\n")}

            KEY EXPERIENCE:
            ${experiencesData.map((e: any) => `- ${e.role} at ${e.company} (${e.duration})`).join("\n")}

            STRICT RULES:
            - Never step out of character.
            - If you don't know an answer, politely ask them to use the contact form or Reach out to Hari via WhatsApp.
            - Keep responses concise and engaging.
            - Focus on Hari's value proposition.
        `;

        // 3. Initialize Gemini
        console.log("GEMINI: Initializing model...");
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // 4. Start Chat
        console.log("GEMINI: Preparing history...");
        // Ensure alternating roles and non-empty content
        let history = messages
            .slice(0, -1)
            .filter((m: any) => m.content && String(m.content).trim() !== "")
            .map((m: any) => ({
                role: (m.role === "user") ? "user" : "model",
                parts: [{ text: String(m.content).trim() }]
            }));

        // If history starts with 'model', remove it (Gemini requirement)
        if (history.length > 0 && history[0].role === "model") {
            history.shift();
        }

        try {
            console.log("GEMINI: Starting chat session...");
            const chat = model.startChat({ history });

            const latestMessage = String(messages[messages.length - 1].content || "").trim();
            if (!latestMessage) {
                return NextResponse.json({ error: "Empty message" }, { status: 400 });
            }

            console.log("GEMINI: Sending message...");
            const result = await chat.sendMessage(latestMessage);
            const responseText = result.response.text();
            console.log("GEMINI: Success");

            return NextResponse.json({ content: responseText });
        } catch (geminiError: any) {
            console.error("GEMINI Error:", geminiError.message);
            return NextResponse.json({ error: "AI processing error", details: geminiError.message }, { status: 500 });
        }
    } catch (error: any) {
        console.error("GLOBAL Chat Error:", error.message);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
