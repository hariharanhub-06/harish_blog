
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env.local
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) {
    console.log("Loading .env.local...");
    dotenv.config({ path: envLocal });
} else {
    console.log(".env.local not found");
}

// We need to import db after env vars are loaded
// Also we need to handle the fact that src/db/index might use @ alias or not. 
// Let's assume we can import it.
// If aliases are used in src/db/index.ts, we might need to register them or modify the import.
// src/db/index.ts uses relative import for schema: import * as schema from "./schema";
// So importing src/db/index.ts from here should be fine if we are careful.

import { db } from '../src/db/index';
import { experience } from '../src/db/schema';

async function main() {
    try {
        console.log("Database URL:", process.env.DATABASE_URL ? "********* (Defined)" : "Undefined");

        console.log("Attempting insert into experience table...");
        const result = await db.insert(experience).values({
            company: "Debug Company",
            role: "Debug Role",
            duration: "2023",
            description: "Debug Description",
            displayOrder: 100
        }).returning();

        console.log("Insert successful! Result:", result);
    } catch (error) {
        console.error("Insert FAILED.");
        console.error("Error Object:", error);
        if (typeof error === 'object' && error !== null) {
            console.error("Full Error Details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        }
    }
    process.exit(0);
}

main();
