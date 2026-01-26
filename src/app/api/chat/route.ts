
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { neon } from "@neondatabase/serverless";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        if (!messages || messages.length === 0) {
            return NextResponse.json({ error: "No messages provided" }, { status: 400 });
        }

        const sql = neon(process.env.DATABASE_URL!);

        // 1. Fetch AI Config & Context
        const [configData, profileData, projectsData, experiencesData] = await Promise.all([
            sql(`SELECT knowledge_base FROM ai_assistant_config WHERE id = 'default'`),
            sql(`SELECT name, about, headline, location FROM profiles LIMIT 1`),
            sql(`SELECT title, description, technologies FROM projects WHERE featured = true`),
            sql(`SELECT role, company, duration FROM experience ORDER BY "order" ASC`)
        ]);

        const config = configData[0] || {};
        const profile = profileData[0] || {};

        // 2. Build System Instruction
        const systemInstruction = `
            You are the "AI Twin" and Digital Assistant of Hari Haran Jeyaramamoorthy. 
            Your goal is to represent Hari perfectly, answer questions about his work, and help convert visitors into clients or partners.

            HARI'S MASTER KNOWLEDGE BASE (Primary Source for Persona, Pricing, and Facts):
            ${config.knowledge_base || "Professional, confident, friendly, and helpful. You speak as Hari's official assistant."}

            HARI'S LIVE PROFILE INFO:
            - Name: ${profile.name || "Hari Haran Jeyaramamoorthy"}
            - Headline: ${profile.headline || "Developer & Consultant"}
            - Location: ${profile.location || "Tamil Nadu, India"}
            - About: ${profile.about || ""}

            FEATURED PROJECTS:
            ${projectsData.map(p => `- ${p.title}: ${p.description} (Tech: ${JSON.stringify(p.technologies)})`).join("\n")}

            KEY EXPERIENCE:
            ${experiencesData.map(e => `- ${e.role} at ${e.company} (${e.duration})`).join("\n")}

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
        const history = messages.slice(0, -1).map((m: any) => ({
            role: (m.role === "user") ? "user" : "model",
            parts: [{ text: m.content }]
        }));

        const chat = model.startChat({ history });

        const latestMessage = messages[messages.length - 1].content;
        const result = await chat.sendMessage(latestMessage);
        const responseText = result.response.text();

        return NextResponse.json({ content: responseText });
    } catch (error: any) {
        console.error("Chat error:", error);
        return NextResponse.json({
            error: "Connectivity issue",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        }, { status: 500 });
    }
}
