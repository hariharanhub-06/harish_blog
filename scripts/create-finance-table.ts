import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runSql() {
    const sql = neon(process.env.DATABASE_URL!);
    try {
        console.log("Creating finance_leads table...");
        await sql`
            CREATE TABLE IF NOT EXISTS "finance_leads" (
                "id" text PRIMARY KEY NOT NULL,
                "lead_id" text NOT NULL,
                "loan_type" text NOT NULL,
                "status" text DEFAULT 'Document Collection',
                "approved_bank" text,
                "approved_amount" real DEFAULT 0,
                "disbursement_date" timestamp,
                "commission_amount" real DEFAULT 0,
                "commission_collected_date" timestamp,
                "rejection_reason" text,
                "admin_notes" text,
                "created_at" timestamp DEFAULT now(),
                "updated_at" timestamp DEFAULT now()
            );
        `;
        console.log("Table created or already exists.");

        // Check columns to be sure
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'finance_leads'
        `;
        console.log("Columns in finance_leads:", columns);

        process.exit(0);
    } catch (error) {
        console.error("SQL Error:", error);
        process.exit(1);
    }
}

runSql();
