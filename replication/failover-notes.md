# Replica Set Failover Test Observations

**Date:** April 10, 2026
**Tester (Member 2):** Mohand

## Overview
This document contains the step-by-step observations of triggering a failover in our 3-node MongoDB Replica Set. The goal of this test is to verify that if the primary database node crashes unexpectedly, the remaining secondary nodes automatically hold an election and promote a new primary without manual intervention.

## Observations

### 1. Initial State (Before Failover)
- **Primary Node:** `Node 1` (Port `27020`)
- **Secondary Nodes:** `Node 2` (Port `27018`), `Node 3` (Port `27019`)
- **Action Taken:** Captured a screenshot showing the healthy state and Node 1 acting as the Primary.
  *(See `screenshots/before-failover.png`)*

### 2. During Election
- **Observation:** Node 1 (port 27020) was forcefully terminated using the kill script (`simulate-failover.ps1`). 
- **Time to Detect:** Within ~3 to 5 seconds, the remaining nodes registered that heartbeats to Node 1 were failing.
- **Process:** Node 2 and Node 3 held a democratic election. Since Node 3 received the votes, it won the election.

### 3. After Failover (Recovery State)
- **New Primary Node:** `Node 3` (Port `27019`)
- **Remaining Secondary Node(s):** `Node 2` (Port `27018`)
- **Status of Old Primary:** Node 1 (`127.0.0.1:27020`) reports as `(not reachable/healthy)` according to the cluster status.
- **Action Taken:** Captured a screenshot showing Node 3 running as the new Primary!
  *(See `screenshots/after-failover.png`)*

## Conclusion
The MongoDB Replica Set successfully demonstrated high availability. Upon the sudden death of the primary node, the cluster automatically detected the failure and promoted a secondary node within seconds. The distributed database is functioning correctly!
