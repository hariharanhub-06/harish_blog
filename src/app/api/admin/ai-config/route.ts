
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export async function GET(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);

        // Safety: Ensure table exists
        await sql(`
            CREATE TABLE IF NOT EXISTS ai_assistant_config (
                id TEXT PRIMARY KEY,
                persona TEXT,
                pricing TEXT,
                faq TEXT,
                convincing_tactics TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        const config = await sql(`SELECT * FROM ai_assistant_config WHERE id = 'default'`);
        if (config.length === 0) {
            return NextResponse.json({ persona: "", pricing: "", faq: "", convincingTactics: "" });
        }

        return NextResponse.json({
            persona: config[0].persona || "",
            pricing: config[0].pricing || "",
            faq: config[0].faq || "",
            convincingTactics: config[0].convincing_tactics || ""
        });
    } catch (error) {
        console.error("AI Config GET error:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { persona, pricing, faq, convincingTactics } = body;

        const sql = neon(process.env.DATABASE_URL!);

        await sql(`
            INSERT INTO ai_assistant_config (id, persona, pricing, faq, convincing_tactics)
            VALUES ('default', $1, $2, $3, $4)
            ON CONFLICT (id) DO UPDATE SET
                persona = EXCLUDED.persona,
                pricing = EXCLUDED.pricing,
                faq = EXCLUDED.faq,
                convincing_tactics = EXCLUDED.convincing_tactics,
                updated_at = NOW();
        `, [persona, pricing, faq, convincingTactics]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("AI Config POST error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
