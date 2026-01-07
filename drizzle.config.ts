import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

try {
    dotenv.config({ path: ".env.local" });
} catch (e) {
    // Ignore error if dotenv is missing (e.g. in some production environments)
}

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
