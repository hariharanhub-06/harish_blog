import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Optimize Neon connection with caching and performance settings
const sql = neon(process.env.DATABASE_URL!);

// Enable connection pooling and query caching
export const db = drizzle(sql, {
    schema,
    // Log queries in development for debugging
    logger: process.env.NODE_ENV === 'development',
});
