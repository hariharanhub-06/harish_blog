import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runSql() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log("Creating forms tables...");

        await sql`
            CREATE TABLE IF NOT EXISTS "forms" (
                "id" text PRIMARY KEY NOT NULL,
                "title" text NOT NULL,
                "description" text,
                "is_published" boolean DEFAULT false,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS "form_questions" (
                "id" text PRIMARY KEY NOT NULL,
                "form_id" text NOT NULL,
                "type" text NOT NULL,
                "question_text" text NOT NULL,
                "required" boolean DEFAULT false,
                "options" jsonb,
                "order" integer DEFAULT 0
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS "form_responses" (
                "id" text PRIMARY KEY NOT NULL,
                "form_id" text NOT NULL,
                "created_at" timestamp DEFAULT now()
            );
        `;

        await sql`
            CREATE TABLE IF NOT EXISTS "form_response_answers" (
                "id" text PRIMARY KEY NOT NULL,
                "response_id" text NOT NULL,
                "question_id" text NOT NULL,
                "answer_text" text,
                "answer_choices" jsonb
            );
        `;

        console.log("Tables created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("SQL Error:", error);
        process.exit(1);
    }
}

runSql();
