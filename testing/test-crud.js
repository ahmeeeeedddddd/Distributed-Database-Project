const axios = require('axios');

const API_URL = 'http://localhost:3000/api/items';

async function runDatabaseTests() {
    console.log("--- Starting Distributed Database CRUD Tests ---");

    try {
        // 1. TEST CREATE
        console.log("\n[1/4] Testing CREATE...");
        const createRes = await axios.post(API_URL, {
            name: "Test Server Node",
            status: "Active",
            timestamp: new Date()
        });
        const itemId = createRes.data._id;
        console.log(" SUCCESS: Item created with ID:", itemId);

        // 2. TEST READ
        console.log("\n[2/4] Testing READ...");
        const readRes = await axios.get(API_URL);
        console.log("SUCCESS: Data retrieved. Total items:", readRes.data.length);

        // 3. TEST UPDATE
        console.log("\n[3/4] Testing UPDATE...");
        await axios.put(`${API_URL}/${itemId}`, { name: "Updated Node Name" });
        console.log(" SUCCESS: Item updated successfully.");

        // 4. TEST DELETE
        console.log("\n[4/4] Testing DELETE...");
        await axios.delete(`${API_URL}/${itemId}`);
        console.log(" SUCCESS: Item deleted successfully.");

        console.log("\n--- ALL TESTS PASSED SUCCESSFULLY (PASS) ---");
    } catch (error) {
        console.error("\n TEST FAILED: ", error.message);
        if (error.response) {
            console.error("Details:", error.response.data);
        }
    }
}

runDatabaseTests();