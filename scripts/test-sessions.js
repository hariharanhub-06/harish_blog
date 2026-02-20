const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/admin/sessions';

async function runTests() {
    console.log("Starting Session API Tests...");

    // 1. Register a session
    console.log("1. Registering session...");
    const regRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userEmail: 'test@example.com',
            deviceName: 'Test Laptop',
            browser: 'Chrome 120',
            os: 'Windows 11',
            ipAddress: '127.0.0.1'
        })
    });
    const session = await regRes.json();
    console.log("Registered:", session);

    // 2. List sessions
    console.log("2. Listing sessions...");
    const listRes = await fetch(BASE_URL);
    const sessions = await listRes.json();
    console.log("Sessions count:", sessions.length);

    // 3. Update session
    console.log("3. Updating session...");
    const updRes = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: session.id,
            ipAddress: '192.168.1.1'
        })
    });
    console.log("Update status:", updRes.status);

    // 4. Revoke session
    console.log("4. Revoking specific session...");
    const delRes = await fetch(`${BASE_URL}?id=${session.id}`, {
        method: 'DELETE'
    });
    console.log("Revoke status:", delRes.status);

    // 5. Final check
    const finalRes = await fetch(BASE_URL);
    const finalSessions = await finalRes.json();
    console.log("Final sessions count:", finalSessions.length);

    console.log("Tests complete.");
}

runTests();
