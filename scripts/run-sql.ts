
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log('Reading SQL file...');
    const sqlContent = fs.readFileSync('training_academy_setup.sql', 'utf8');

    // Split by statements (simple split by semicolon, might need more robust parsing if complex)
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements.`);

    for (const statement of statements) {
        try {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await sql(statement);
            console.log('Success.');
        } catch (e) {
            console.error('Error executing statement:', e);
        }
    }

    console.log('Done.');
}

main();
