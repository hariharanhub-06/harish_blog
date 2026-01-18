import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.TURSO_CONNECTION_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Throwing a clear error if missing, but avoiding the crash at the top-level 
// if we're just in a build environment where these might be injected later.
// However, LibSQL createClient requires a valid URL. 
// For build time safety, we can provide a dummy URL if missing.
const client = createClient({
    url: url || "libsql://dummy-url-for-build.turso.io",
    authToken: authToken || "dummy-token",
});

export const db = drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
});
