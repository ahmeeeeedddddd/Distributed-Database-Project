// Standalone script to test CRUD operations against the Express backend
const backendUrl = 'http://localhost:3000/api/items';

async function runDemo() {
    console.log("Starting CRUD Demo against: ", backendUrl);
    let createdItemId = null;

    try {
        // 1. CREATE
        console.log("\n--- [CREATE] Adding a new item ---");
        const createRes = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Distributed DB Book', description: 'Concepts of replication', price: 29.99, quantity: 10 })
        });
        if (!createRes.ok) throw new Error("Create failed: " + await createRes.text());
        const createdItem = await createRes.json();
        console.log("Created Item Response:");
        console.log(createdItem);
        createdItemId = createdItem._id;

        if (!createdItemId) {
            throw new Error("Item creation failed or did not return an _id.");
        }

        // 2. READ (All)
        console.log("\n--- [READ All] Fetching all items ---");
        const readAllRes = await fetch(backendUrl);
        if (!readAllRes.ok) throw new Error("Read All failed: " + await readAllRes.text());
        const allItems = await readAllRes.json();
        console.log(`Found ${allItems.length} items total.`);
        
        // 3. READ (Single)
        console.log("\n--- [READ Single] Fetching just created item by ID ---");
        const readSingleRes = await fetch(`${backendUrl}/${createdItemId}`);
        if (!readSingleRes.ok) throw new Error("Read Single failed: " + await readSingleRes.text());
        const singleItem = await readSingleRes.json();
        console.log("Fetched item:");
        console.log(singleItem);

        // 4. UPDATE
        console.log("\n--- [UPDATE] Modifying the created item ---");
        const updateRes = await fetch(`${backendUrl}/${createdItemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: 25.00, quantity: 8 }) // Change price and quantity
        });
        if (!updateRes.ok) throw new Error("Update failed: " + await updateRes.text());
        const updatedItem = await updateRes.json();
        console.log("Updated Item Response:");
        console.log(updatedItem);

        // 5. DELETE
        console.log("\n--- [DELETE] Removing the created item ---");
        const deleteRes = await fetch(`${backendUrl}/${createdItemId}`, {
            method: 'DELETE'
        });
        if (!deleteRes.ok) throw new Error("Delete failed: " + await deleteRes.text());
        const deleteResult = await deleteRes.json();
        console.log("Delete Response:");
        console.log(deleteResult);
        
        // 6. VERIFY DELETE
        console.log("\n--- [VERIFY DELETE] Fetching all items again ---");
        const readVerifyRes = await fetch(backendUrl);
        if (!readVerifyRes.ok) throw new Error("Verify Delete failed: " + await readVerifyRes.text());
        const verifyItems = await readVerifyRes.json();
        console.log(`Found ${verifyItems.length} items total after deletion.`);

        console.log("\n✅ CRUD Demo completed successfully.");

    } catch (err) {
        console.error("\n❌ Error during CRUD Demo operation:");
        console.error(err);
    }
}

runDemo();
