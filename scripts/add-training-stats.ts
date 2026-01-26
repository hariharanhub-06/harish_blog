
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Adding training_stats column to profiles...');
    try {
        await sql`
        ALTER TABLE profiles 
        ADD COLUMN IF NOT EXISTS training_stats JSONB DEFAULT '[
            {"label": "Expert Sessions", "value": "150+", "icon": "Presentation"},
            {"label": "Partnered Colleges", "value": "42+", "icon": "GraduationCap"},
            {"label": "Minds Empowered", "value": "5000+", "icon": "Users"}
        ]'::jsonb;
      `;
        console.log('Success.');
    } catch (e) {
        console.error('Error executing statement:', e);
    }
}

main();
