// ============================================================
// init-replica-set.js
// Run with:  mongosh --port 27020 init-replica-set.js
// ============================================================

// Initiate the replica set with 3 members
rs.initiate({
  _id: "rs0",
  members: [
    { _id: 0, host: "127.0.0.1:27020" },
    { _id: 1, host: "127.0.0.1:27018" },
    { _id: 2, host: "127.0.0.1:27019" }
  ]
});

// Wait a few seconds for election to complete
print("\n⏳ Waiting 5 seconds for replica set election...\n");
sleep(5000);

// Print the replica set status
printjson(rs.status());

print("\n✅ Replica set 'rs0' initialized successfully!");
print("   Primary should be elected on one of the 3 nodes.");
print("   Run rs.status() in mongosh to verify.\n");
