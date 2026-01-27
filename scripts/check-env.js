
const dotenv = require("dotenv");
const path = require("path");

const envPath = path.resolve(__dirname, "../.env.local");
const result = dotenv.config({ path: envPath });

console.log("Loading .env from:", envPath);
if (result.error) {
    console.error("Error loading .env:", result.error);
}

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL is undefined!");
} else {
    console.log("DATABASE_URL loaded. Length:", url.length);
    console.log("Starts with:", url.substring(0, 15) + "...");
}
