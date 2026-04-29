# Distributed Database Project - Testing & Monitoring Report

## 1. CRUD Operations Test
This test ensures that the Backend API can successfully interact with the MongoDB Replica Set.

| Test Case | Description | Expected Result | Status |
| :--- | :--- | :--- | :--- |
| **CREATE** | Insert a new item via POST request | Data saved in Primary Node | ✅ PASS |
| **READ** | Retrieve all items via GET request | Data returned correctly | ✅ PASS |
| **UPDATE** | Modify an existing item via PUT request | Change reflected in all nodes | ✅ PASS |
| **DELETE** | Remove an item via DELETE request | Item removed from DB | ✅ PASS |

## 2. Replica Set Monitoring
We used a monitoring script to observe the health of the 3-node cluster.

- **Replica Set Name:** `rs0`
- **Nodes:** - `127.0.0.1:27017` (Primary)
    - `127.0.0.1:27018` (Secondary)
    - `127.0.0.1:27019` (Secondary)

## 3. Failover Test Results
To test the "High Availability", we simulated a failure by stopping the Primary Node.

- **Observation:** The system detected the failure within seconds.
- **Outcome:** An automatic election was held, and a Secondary Node was promoted to **PRIMARY** without losing any data.
- **Verification:** The API remained functional during the transition.