import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function auditDatabase() {
    try {
        const { db } = await import('./src/db');
        const { sql } = await import('drizzle-orm');

        console.log("--- Database Table Audit ---");

        // Query to list all tables in the public schema
        const result = await db.execute(sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);

        const tables = result.rows.map((row: any) => row.table_name);
        console.log("Current Tables in Database:", tables);

        // Expected tables from schema.ts (partial list based on what we saw)
        const expected = [
            "profiles", "projects", "blog_posts", "skills", "experience",
            "education", "achievements", "contact_submissions", "volunteering",
            "gallery", "visitor_analytics", "snack_products", "snack_orders",
            "coupons", "admin_push_tokens", "admin_sessions", "admin_trusted_devices",
            "snack_reviews", "abandoned_carts", "affiliates", "affiliate_transactions",
            "payout_requests", "affiliate_config", "vendors", "vendor_payouts",
            "order_shipments", "partnerships", "affiliate_products", "youtube_videos",
            "ai_assistant_config", "feedbacks", "quizzes", "quiz_questions",
            "quiz_options", "quiz_submissions", "quiz_sessions", "quiz_participants",
            "quiz_live_answers", "finance_debts", "finance_loans", "finance_transactions",
            "typing_test_results", "meeting_availability", "meeting_schedules",
            "scheduler_documents", "live_sessions", "session_registrations",
            "live_session_moderator_policies", "live_session_minutes", "game_assets",
            "game_scores", "scheduler_config", "client_projects", "pricing_base_costs",
            "routines", "routine_logs"
        ];

        const missing = expected.filter(t => !tables.includes(t));
        console.log("Missing Tables:", missing);

        process.exit(0);
    } catch (error: any) {
        console.error("Audit failed:", error.message);
        process.exit(1);
    }
}

auditDatabase();
