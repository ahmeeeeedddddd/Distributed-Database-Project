// check-replica-status.js
// Script to check the status of the MongoDB replica set

print("Checking replica set status...");
const status = rs.status();

if (status.ok === 1) {
    print("Replica set is healthy.");
    print(`Set Name: ${status.set}`);
    print("Members:");
    status.members.forEach(member => {
        print(` - ID: ${member._id}, Name: ${member.name}, State: ${member.stateStr} (Health: ${member.health})`);
    });
} else {
    print("Failed to get replica set status or replica set is not initialized.");
    printjson(status);
}
