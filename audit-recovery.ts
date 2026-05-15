
import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

const url = "postgresql://neondb_owner:npg_UG86mxlgrkaL@ep-patient-scene-ahaulih6-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const sql = neon(url);

async function auditRecovery() {
    console.log("=== AUDITING RECOVERY DATABASE ===\n");
    try {
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;

        console.log("Total tables found:", tables.length);
        const tableNames = tables.map(t => t.table_name);

        const importantTables = [
            "stories", "story_episodes",
            "agile_projects", "agile_sprints", "agile_issues",
            "agile_meetings", "agile_epics", "agile_workflows",
            "finance_leads", "blog_posts", "projects"
        ];

        for (const t of importantTables) {
            if (tableNames.includes(t)) {
                const count = await sql(`SELECT count(*) as c FROM "${t}"`);
                console.log(`[✓] ${t}: ${count[0].c} records`);
            } else {
                console.log(`[X] ${t}: MISSING`);
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    }
    process.exit(0);
}

auditRecovery();
