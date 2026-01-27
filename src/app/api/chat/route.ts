
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { neon } from "@neondatabase/serverless";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { messages, userName }: { messages: { role: string; content: string }[], userName?: string } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
        }

        const apiKey = process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;
        const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;
        const dbUrl = process.env.DATABASE_URL;

        if (!apiKey && !geminiKey) {
            console.error("Missing all AI API Keys");
            return NextResponse.json({ error: "SERVICE ERROR: AI Configuration incomplete" }, { status: 500 });
        }

        if (!dbUrl) {
            console.error("Missing Database URL");
            return NextResponse.json({ error: "Database configuration missing" }, { status: 500 });
        }

        const groq = new Groq({ apiKey });
        const sql = neon(dbUrl);

        // 1. Fetch AI Config & Context
        let config: { knowledge_base?: string };
        let profile: { name?: string; about?: string; headline?: string; location?: string };
        let projectsData: { title: string; description: string; technologies: string[] | null }[];
        let experiencesData: { role: string; company: string; duration: string }[];

        type QueryResult = Record<string, any>[];

        try {
            const [configData, profileData, projects, experiences] = await Promise.all([
                sql(`SELECT knowledge_base FROM ai_assistant_config WHERE id = 'default'`),
                sql(`SELECT name, about, headline, location FROM profiles LIMIT 1`),
                sql(`SELECT title, description, technologies FROM projects WHERE featured = true`),
                sql(`SELECT role, company, duration FROM experience ORDER BY "order" ASC`)
            ]) as [QueryResult, QueryResult, QueryResult, QueryResult];

            config = (configData[0] as any) || {};
            profile = (profileData[0] as any) || {};
            projectsData = projects as any[] || [];
            experiencesData = experiences as any[] || [];
        } catch (dbError: unknown) {
            const message = dbError instanceof Error ? dbError.message : "Unknown database error";
            console.error("DB Error:", message);
            return NextResponse.json({ error: "Database failure", details: message }, { status: 500 });
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
            // Truncate history to last 10 messages to save quota/tokens and improve speed
            const recentMessages = messages.slice(-10);

            const groqMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
                { role: "system", content: systemInstruction },
                ...recentMessages.map(m => ({
                    role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
                    content: m.content
                }))
            ];

            const fetchWithTimeout = async (modelName: string, timeoutMs: number) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                try {
                    const response = await groq.chat.completions.create({
                        messages: groqMessages as any,
                        model: modelName,
                        temperature: 0.6,
                        max_tokens: 150,
                    }, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    return response;
                } catch (e: unknown) {
                    clearTimeout(timeoutId);
                    throw e;
                }
            };

            let completion;
            let usedModel = "";

            try {
                // LAYER 1: Rapid 8B Model (2.5s Limit)
                usedModel = "llama-3.1-8b-instant";
                completion = await fetchWithTimeout(usedModel, 2500);
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                console.warn(`Layer 1 (${usedModel}) failed: ${message}`);
                try {
                    // LAYER 2: Versatile 70B Model (4.0s Limit)
                    usedModel = "llama-3.3-70b-versatile";
                    completion = await fetchWithTimeout(usedModel, 4000);
                } catch (innerErr: unknown) {
                    const innerMsg = innerErr instanceof Error ? innerErr.message : String(innerErr);
                    // LAYER 3: Gemini Final Fallback
                    console.warn(`Layer 2 (${usedModel}) failed: ${innerMsg}. Trying Gemini.`);
                    if (!geminiKey) throw new Error("No Gemini key available for fallback");

                    try {
                        const genAI = new GoogleGenerativeAI(geminiKey);
                        // Correct way to use System Instruction in Gemini
                        const genModel = genAI.getGenerativeModel({
                            model: "gemini-1.5-flash",
                            systemInstruction: systemInstruction
                        });

                        // Ensure roles alternate and handle potential double-user message at start
                        const geminiContents = [];
                        let lastRole = "";

                        for (const m of recentMessages) {
                            const currentRole = m.role === "user" ? "user" : "model";
                            if (currentRole === lastRole) continue; // Skip if same role as last

                            geminiContents.push({
                                role: currentRole,
                                parts: [{ text: m.content }]
                            });
                            lastRole = currentRole;
                        }

                        // Gemini requires the first message to be "user"
                        if (geminiContents.length > 0 && geminiContents[0].role !== "user") {
                            geminiContents.shift();
                        }

                        if (geminiContents.length === 0) {
                            throw new Error("No valid messages for Gemini fallback");
                        }

                        const result = await genModel.generateContent({
                            contents: geminiContents
                        });

                        const text = result.response.text();
                        if (text) {
                            console.log("Success: Gemini Safety Net caught the fall.");
                            return NextResponse.json({ content: text });
                        }
                        throw new Error("Gemini returned empty response");
                    } catch (geminiErr: unknown) {
                        const gemMsg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
                        console.error("Layer 3 (Gemini) Critical Failure:", gemMsg);
                        throw geminiErr;
                    }
                }
            }

            const responseText = completion?.choices[0]?.message?.content || "Thenali is here!";
            return NextResponse.json({ content: responseText });

        } catch (aiError: unknown) {
            const aiMsg = aiError instanceof Error ? aiError.message : String(aiError);
            console.error("CRYSTAL AI ERROR:", aiMsg);
            return NextResponse.json({
                error: "AI processing error",
                details: "System busy. Please try again."
            }, { status: 500 });
        }
    } catch (globalError: unknown) {
        const globalMsg = globalError instanceof Error ? globalError.message : String(globalError);
        console.error("GLOBAL Chat Error:", globalMsg);
        return NextResponse.json({
            error: "Internal Server Error",
            details: globalMsg
        }, { status: 500 });
    }
}
