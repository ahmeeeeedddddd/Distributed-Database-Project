# Distributed Database Technical Deep Dive

This document provides a comprehensive explanation of the concepts, infrastructure, and commands used in the WarehouseOS project.

---

## 🌎 1. Core Concepts

### Replication (High Availability)
Replication is the process of synchronizing data across multiple servers (nodes). In this project, we use a **3-node Replica Set**.
*   **How it benefits us:** If one server's hardware fails, the data is still safe on the other two nodes. It ensures "Data Redundancy."

### Failover (Automatic Recovery)
Failover is the automated transition from a failed primary node to a healthy secondary node.
*   **In this project:** If Node 1 (Primary) crashes, Node 2 or 3 will automatically detect the failure, hold an election, and become the new leader. Your application wont stop working.

### Fragmentation / Sharding (Horizontal Scaling)
Fragmentation (Sharding) is the process of splitting a large dataset into smaller pieces and distributing them across different servers.
*   **The Difference:**
    *   **Replication** = **Copies** of the same data (for safety).
    *   **Fragmentation** = **Pieces** of different data (for handling massive size).

---

## 🏗️ 2. Infrastructure Folder Deep Dive

The `infrastructure/` folder contains the "blueprints" for your database network.

### `mongod-node1.conf` (Explanation)
This file configures how the first database node starts.

| Line | Content | Purpose |
|:---|:---|:---|
| 1 | `storage:` | Root section for data storage settings. |
| 2 | `  dbPath: C:\data\rs0-0` | The absolute path on your disk where this node saves its data. |
| 4 | `net:` | Root section for network connectivity. |
| 5 | `  port: 27020` | The port number this node listens on for connections. |
| 6 | `  bindIp: 127.0.0.1` | Ensures the database only accepts connections from your own machine. |
| 8 | `replication:` | Root section for replica set settings. |
| 9 | `  replSetName: rs0` | The unique name of the replica set "team" this node belongs to. |

### `init-replica-set.js` (Explanation)
This script "welds" the three independent nodes into a single team.

| Line | Content | Purpose |
|:---|:---|:---|
| 1 | `rs.initiate({` | The MongoDB command to start a new replica set. |
| 2 | `  _id: "rs0",` | Assigns the team name `rs0`. |
| 3 | `  members: [` | Starts the list of database participants. |
| 4 | `{ _id: 0, host: "127.0.0.1:27020", priority: 2 },` | Adds Node 1. `priority: 2` makes it the preferred leader. |
| 5 | `{ _id: 1, host: "127.0.0.1:27018", priority: 1 },` | Adds Node 2 as a backup. |
| 6 | `{ _id: 2, host: "127.0.0.1:27019", priority: 1 }` | Adds Node 3 as a backup. |
| 7 | `  ]` | Closes the member list. |
| 8 | `});` | Closes the initiation command. |

---

## 💻 3. Command Reference

### Starting the Nodes
`mongod --config "path/to/node.conf"`
*   **What it does:** Launches the MongoDB engine using the specific settings in the config file. It allocates the memory, prepares the port, and checks the `dbPath`.

### Initializing the Team
`mongosh --port 27020 "path/to/init-replica-set.js"`
*   **What it does:** Connects to the primary node via the shell and sends the "initiate" data. The nodes then talk to each other to synchronize.

### Starting the Application
`node server.js`
*   **What it does:** Starts your backend. It reads your `Item` model, connects to all three database nodes via a connection string, and begins listening on port 3000 to serve the web interface.
