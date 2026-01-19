require('dotenv').config({ path: '.env.local' });
if (!process.env.DATABASE_URL) require('dotenv').config({ path: '.env' });

const { neon } = require('@neondatabase/serverless');

async function main() {
    console.log("Connecting...");
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log("Attempting insert...");
        // Mimic the query from the error message
        // insert into "projects" ("title", "displayOrder" mapped to "order")
        // We use raw SQL here to test if "order" column is the issue

        const title = "Test Project " + Date.now();

        // This attempts to insert into "order" column
        const result = await sql`
            INSERT INTO projects 
            (title, description, thumbnail, technologies, live_url, repo_url, category, featured, "order")
            VALUES 
            (${title}, 'Desc', 'http://example.com/img.jpg', '[]', 'http://live', 'http://repo', 'Cat', true, 0)
            RETURNING id
        `;

        console.log("Insert Success:", result);
    } catch (err) {
        console.error("Insert Failed!");
        console.error("Error Name:", err.name);
        console.error("Error Message:", err.message);
        console.error("Error Code:", err.code); // Postgres error code
        console.error("Full Error:", JSON.stringify(err, null, 2));
    }
}

main();
