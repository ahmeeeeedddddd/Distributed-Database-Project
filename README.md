# WarehouseOS: Distributed Database Project

A distributed inventory management system built with a MongoDB Replica Set architecture, an Express.js backend, and a modern web interface.

## 🚀 Quick Start

### 1. Infrastructure Setup (MongoDB Replica Set)
The project uses a 3-node replica set for high availability.
- **Node 1:** Port 27020 (Primary)
- **Node 2:** Port 27018
- **Node 3:** Port 27019

Follow the detailed guide in [infrastructure/setup-guide.md](infrastructure/setup-guide.md) to initialize the database nodes and configure the replica set.

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```

### 3. Access the Interface
Once the server is running, open your browser and go to:
**[http://localhost:3000](http://localhost:3000)**

## 📂 Project Structure
- **/infrastructure**: Configuration files and initialization scripts for the MongoDB Replica Set.
- **/backend**: Express.js server and Mongoose database connection logic.
- **/web-app**: Frontend assets (HTML, CSS, JS) served statically by the backend.
- **/replication**: PowerShell scripts for simulating failover and testing high availability.
- **/testing**: Monitoring scripts and test suites to verify system consistency.

## 🛠 Features
- **Distributed Architecture**: 3-node MongoDB Replica Set ensures data redundancy.
- **Automatic Failover**: System remains operational if the primary node goes down.
- **Real-time Integration**: Backend serves the UI and API seamlessly via a single port (3000).
- **Inventory Management**: Full CRUD operations for warehouse items.

## 🤝 Team Contributions
- **Replication Architecture**: Deployment and management of local MongoDB nodes.
- **Backend API**: Optimized Mongoose connections and Express route handling.
- **Web App**: Responsive WarehouseOS dashboard for inventory control.
- **Validation**: Failover simulation and infrastructure monitoring.
