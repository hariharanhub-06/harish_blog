
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
            - STICK TO THE USER'S CURRENT LANGUAGE: If the user types in English, you MUST respond in English. If they type in Tamil, respond in Tamil. If they use Tanglish, respond in Tanglish. 
            - NEVER assume the language based on the visitor's name.
            - ULTRA CONCISE: Keep responses EXTREMELY SHORT. Ideally just 1 sentence, maximum 2 sentences. 
            - BE INTERACTIVE: Always end with a very short follow-up question.
            - Never step out of character.

            KNOWLEDGE BASE:
            ${config.knowledge_base || "Professional, confident assistant."}
        `;

        // 3. Start Chat with Groq (with Guaranteed 2.0s Total AI Window)
        try {
            const groqMessages: any[] = [
                { role: "system", content: systemInstruction },
                ...messages.map(m => ({
                    role: m.role === "user" ? "user" : "assistant",
                    content: m.content
                }))
            ];

            const fetchWithTimeout = async (modelName: string, timeoutMs: number) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                try {
                    const response = await groq.chat.completions.create({
                        messages: groqMessages,
                        model: modelName,
                        temperature: 0.6,
                        max_tokens: 150,
                    }, { signal: controller.signal } as any);
                    clearTimeout(timeoutId);
                    return response;
                } catch (e: any) {
                    clearTimeout(timeoutId);
                    throw e;
                }
            };

            let completion;
            let usedModel = "";

            try {
                // LAYER 1: Rapid 8B Model (1.2s Limit)
                usedModel = "llama-3.1-8b-instant";
                completion = await fetchWithTimeout(usedModel, 1200);
            } catch (err: any) {
                console.warn(`Layer 1 (${usedModel}) failed: ${err.message}. Trying Layer 2.`);
                try {
                    // LAYER 2: Versatile 70B Model (1.5s Limit)
                    usedModel = "llama-3.3-70b-versatile";
                    completion = await fetchWithTimeout(usedModel, 1500);
                } catch (innerErr: any) {
                    // LAYER 3: Gemini Final Fallback (Fastest fallback)
                    console.warn(`Layer 2 (${usedModel}) failed: ${innerErr.message}. Activating Gemini Safety Net.`);
                    try {
                        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
                        const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

                        const result = await genModel.generateContent({
                            contents: [
                                { role: "user", parts: [{ text: systemInstruction }] },
                                ...messages.map(m => ({
                                    role: m.role === "user" ? "user" : "model",
                                    parts: [{ text: m.content }]
                                }))
                            ]
                        });

                        const text = result.response.text();
                        if (text) {
                            return NextResponse.json({ content: text });
                        }
                        throw new Error("Gemini returned empty response");
                    } catch (geminiErr: any) {
                        console.error("Layer 3 (Gemini) Critical Failure:", geminiErr.message);
                        throw geminiErr; // Bubble up to global catch
                    }
                }
            }

            const responseText = completion?.choices[0]?.message?.content || "Thenali is here!";
            return NextResponse.json({ content: responseText });

        } catch (aiError: any) {
            console.error("CRYSTAL AI ERROR:", aiError.message);
            return NextResponse.json({
                error: "AI processing error",
                details: "System busy. Please try again."
            }, { status: 500 });
        }
    } catch (globalError: any) {
        console.error("GLOBAL Chat Error:", globalError.message);
        return NextResponse.json({
            error: "Internal Server Error",
            details: globalError.message
        }, { status: 500 });
    }
}
