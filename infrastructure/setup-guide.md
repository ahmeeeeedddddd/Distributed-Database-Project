# Infrastructure Setup Guide — MongoDB Replica Set

This guide explains how to set up a **3-node MongoDB replica set** (`rs0`) on a single Windows machine using different ports.

---

## Prerequisites

| Requirement | Details |
|---|---|
| **MongoDB Community Server** | v7.0+ recommended — [Download](https://www.mongodb.com/try/download/community) |
| **mongosh** | Included with MongoDB 6+, or install separately |
| **OS** | Windows 10/11 or Windows Server |

> Make sure `mongod` and `mongosh` are in your system **PATH**.  
> To verify: open PowerShell and run `mongod --version` and `mongosh --version`.

---

## Network / Port Layout

| Node | Port | Data Directory | Config File |
|------|------|----------------|-------------|
| Node 1 | 27020 | `C:\data\rs0-0` | `mongod-node1.conf` |
| Node 2 | 27018 | `C:\data\rs0-1` | `mongod-node2.conf` |
| Node 3 | 27019 | `C:\data\rs0-2` | `mongod-node3.conf` |

All nodes bind to `127.0.0.1` and belong to replica set **`rs0`**.

---

## Step-by-Step Setup

### 1. Create Data Directories

Open **PowerShell** and run:

```powershell
mkdir C:\data\rs0-0
mkdir C:\data\rs0-1
mkdir C:\data\rs0-2
```

### 2. Start the 3 MongoDB Nodes

Open **3 separate PowerShell windows** (one per node) and run the following commands.

**Window 1 — Node 1 (port 27020):**
```powershell
mongod --config "C:\Users\Administrator\Documents\Distributed-db-project\infrastructure\mongod-node1.conf"
```

**Window 2 — Node 2 (port 27018):**
```powershell
mongod --config "C:\Users\Administrator\Documents\Distributed-db-project\infrastructure\mongod-node2.conf"
```

**Window 3 — Node 3 (port 27019):**
```powershell
mongod --config "C:\Users\Administrator\Documents\Distributed-db-project\infrastructure\mongod-node3.conf"
```

> Each window will stay open while the node is running. **Do not close them.**

### 3. Initialize the Replica Set

Open a **4th PowerShell window** and run:

```powershell
cd "C:\Users\Administrator\Documents\Distributed-db-project\infrastructure"
mongosh --port 27020 init-replica-set.js
```

You should see output showing `rs.status()` with all 3 members — one as **PRIMARY** and two as **SECONDARY**.

### 4. Verify the Replica Set

Connect to the primary:

```powershell
mongosh --port 27020
```

Then inside the shell:

```javascript
// Check replica set status
rs.status()

// You should see:
//   members[0].stateStr: "PRIMARY"
//   members[1].stateStr: "SECONDARY"
//   members[2].stateStr: "SECONDARY"
```

### 5. Quick Replication Test

Still in `mongosh` on the PRIMARY:

```javascript
// Insert a test document
use testDB
db.testCollection.insertOne({ name: "hello", source: "primary" })
```

Open another shell connected to a SECONDARY:

```powershell
mongosh --port 27018
```

```javascript
// Allow reads on secondary
db.getMongo().setReadPref("secondary")
use testDB
db.testCollection.find()
// You should see the document inserted on the primary
```

---

## Stopping the Nodes

To shut down the nodes gracefully, connect to each via `mongosh` and run:

```javascript
use admin
db.shutdownServer()
```

Or simply press `Ctrl+C` in each PowerShell window.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `mongod` not recognized | Add MongoDB `bin` folder to your system PATH |
| Port already in use | Check if another `mongod` is running: `netstat -ano \| findstr 27020` |
| Replica set not initializing | Ensure all 3 nodes are running before executing `init-replica-set.js` |
| Secondary shows `STARTUP2` | Wait 10–15 seconds for initial sync to complete |

---

## Deliverable Checklist

- [x] 3 MongoDB nodes configured on ports 27020, 27018, 27019
- [x] Replica set `rs0` initialized with `rs.initiate()`
- [x] Network and port setup documented
- [x] Working replica set ready for CRUD backend (Member 3) and Web App (Member 4)
