
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
export async function GET(req: Request) {
    try {
        const sql = neon(process.env.DATABASE_URL!);

        // Safety: Ensure table and column exists
        await sql(`
            CREATE TABLE IF NOT EXISTS ai_assistant_config (
                id TEXT PRIMARY KEY,
                knowledge_base TEXT,
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // Migration: Ensure the knowledge_base column exists even if table was created with old schema
        await sql(`ALTER TABLE ai_assistant_config ADD COLUMN IF NOT EXISTS knowledge_base TEXT`);

        // Check if old columns exist and drop them or just ensure new one exists
        // simplified: assuming fresh start for new schema

        const config = await sql(`SELECT * FROM ai_assistant_config WHERE id = 'default'`);
        if (config.length === 0) {
            return NextResponse.json({ knowledgeBase: "" });
        }

        return NextResponse.json({
            knowledgeBase: config[0].knowledge_base || ""
        });
    } catch (error) {
        console.error("AI Config GET error:", error);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { knowledgeBase } = body;

        const sql = neon(process.env.DATABASE_URL!);

        await sql(`
            INSERT INTO ai_assistant_config (id, knowledge_base)
            VALUES ('default', $1)
            ON CONFLICT (id) DO UPDATE SET
                knowledge_base = EXCLUDED.knowledge_base,
                updated_at = NOW();
        `, [knowledgeBase]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("AI Config POST error:", error);
        return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
    }
}
