
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
            const [configData, profileData, projects, experiences] = await Promise.all([
                sql(`SELECT knowledge_base FROM ai_assistant_config WHERE id = 'default'`),
                sql(`SELECT name, about, headline, location FROM profiles LIMIT 1`),
                sql(`SELECT title, description, technologies FROM projects WHERE featured = true`),
                sql(`SELECT role, company, duration FROM experience ORDER BY "order" ASC`)
            ]);
            config = configData[0] || {};
            profile = profileData[0] || {};
            projectsData = projects || [];
            experiencesData = experiences || [];
        } catch (dbError: any) {
            console.error("Database fetch error:", dbError);
            return NextResponse.json({ error: "Knowledge base offline", details: dbError.message }, { status: 500 });
        }

        // 2. Build System Instruction
        const systemInstruction = `
            You are the "AI Twin" and Digital Assistant of Hari Haran Jeyaramamoorthy. 
            Your goal is to represent Hari perfectly, answer questions about his work, and help convert visitors into clients or partners.

            HARI'S MASTER KNOWLEDGE BASE:
            ${config.knowledge_base || "Professional, confident, friendly, and helpful. You speak as Hari's official assistant."}

            HARI'S LIVE PROFILE INFO:
            - Name: ${profile.name || "Hari Haran Jeyaramamoorthy"}
            - Headline: ${profile.headline || "Developer & Consultant"}
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
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemInstruction
        });

        // 4. Start Chat
        // Map roles correctly for Gemini: user -> user, assistant/ai/model -> model
        // CRITICAL: History must start with 'user' role or be empty.
        let history = messages.slice(0, -1).map((m: any) => ({
            role: (m.role === "user") ? "user" : "model",
            parts: [{ text: String(m.content) }]
        }));

        // If history starts with 'model', remove it (Gemini requirement)
        if (history.length > 0 && history[0].role === "model") {
            history.shift();
        }

        const chat = model.startChat({ history });

        const latestMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(String(latestMessage));
        const responseText = result.response.text();

        return NextResponse.json({ content: responseText });
    } catch (error: any) {
        console.error("Chat Global Error:", error);
        return NextResponse.json({
            error: "Connectivity issue",
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
