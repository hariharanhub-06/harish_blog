
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, userName } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const dbUrl = process.env.DATABASE_URL;

        if (!apiKey) {
            console.error("Missing Groq API Key in environment");
            return NextResponse.json({ error: "SERVICE ERROR: API Configuration incomplete (Key missing)" }, { status: 500 });
        }

        if (!dbUrl) {
            console.error("Missing Database URL");
            return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
        }

        const groq = new Groq({ apiKey });
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
            console.error("DB Error:", dbError.message);
            return NextResponse.json({ error: "Database failure", details: dbError.message }, { status: 500 });
        }

        // 2. Build System Instruction (Now as the first message for Groq)
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
            - STICK TO THE USER'S CURRENT LANGUAGE: If the user types in English, you MUST respond in English. If they type in Tamil, respond in Tamil. If they use Tanglish, respond in Tanglish. 
            - NEVER assume the language based on the visitor's name.
            - ULTRA CONCISE: Keep responses EXTREMELY SHORT. Ideally just 1 sentence, maximum 2 sentences. 
            - BE INTERACTIVE: Always end with a very short follow-up question.
            - Never step out of character.

            KNOWLEDGE BASE:
            ${config.knowledge_base || "Professional, confident assistant."}
        `;

        // 3. Start Chat with Groq (with Fallback)
        try {
            const groqMessages: any[] = [
                { role: "system", content: systemInstruction },
                ...messages.map(m => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: m.content
                }))
            ];

            let completion;
            try {
                // LAYER 1: Premier Groq (Llama 3.3 70B)
                completion = await groq.chat.completions.create({
                    messages: groqMessages,
                    model: "llama-3.3-70b-versatile",
                    temperature: 0.7,
                    max_tokens: 1024,
                });
            } catch (limitError: any) {
                // If Rate Limit (429) hit, try LAYER 2: Fast Groq (Llama 3.1 8B)
                if (limitError.status === 429) {
                    console.warn("70B Fallback: Rate limit, trying 8B.");
                    try {
                        completion = await groq.chat.completions.create({
                            messages: groqMessages,
                            model: "llama-3.1-8b-instant",
                            temperature: 0.7,
                            max_tokens: 1024,
                        });
                    } catch (innerError: any) {
                        // If Groq completely exhausted, try LAYER 3: Gemini (1,500/day free limit)
                        console.warn("Groq Exhausted: Trying Gemini Safety Net.");
                        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
                        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                        const result = await model.generateContent({
                            contents: [
                                { role: "user", parts: [{ text: systemInstruction }] },
                                ...messages.map(m => ({
                                    role: m.role === "user" ? "user" : "model",
                                    parts: [{ text: m.content }]
                                }))
                            ]
                        });

                        const responseText = result.response.text();
                        return NextResponse.json({ content: responseText });
                    }
                } else {
                    throw limitError;
                }
            }

            const responseText = completion?.choices[0]?.message?.content || "Thenali is taking a short break. Please try again later.";
            return NextResponse.json({ content: responseText });
        } catch (groqError: any) {
            console.error("GROQ ERROR:", groqError);
            // Even more robust: Final safety fallback
            return NextResponse.json({
                error: "AI processing error",
                details: groqError.status === 429 ? "System busy: Please try again in 60 seconds." : groqError.message
            }, { status: groqError.status || 500 });
        }
    } catch (error: any) {
        console.error("GLOBAL Chat Error:", error.message);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message
        }, { status: 500 });
    }
}
