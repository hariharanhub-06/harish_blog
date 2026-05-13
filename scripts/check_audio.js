
const { db } = require("./src/db");

async function checkProfile() {
    try {
        const profile = await db.query.profiles.findFirst();
        console.log("Profile Data:", JSON.stringify(profile, null, 2));
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

checkProfile();
