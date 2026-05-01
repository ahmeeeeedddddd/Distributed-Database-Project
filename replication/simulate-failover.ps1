<#
.SYNOPSIS
Simulates a failover in the MongoDB replica set by forcefully terminating the primary node.

.DESCRIPTION
Finds the mongod process listening on the specified port (default 27020 for Node 1) and kills it.
This triggers an election among the remaining secondary nodes.
#>

$primaryDoc = node -e "const { MongoClient } = require('mongodb'); async function run() { const client = new MongoClient('mongodb://127.0.0.1:27018/?directConnection=true'); await client.connect(); const adminDb = client.db('admin'); const res = await adminDb.command({ isMaster: 1 }); console.log(res.primary); await client.close(); } run().catch(() => {});"

if (-not $primaryDoc) {
    Write-Host "Could not query the replica set to find the primary." -ForegroundColor Red
    exit 1
}

$PrimaryPort = $primaryDoc.Split(":")[1]
Write-Host "Found Primary Node running on port: $PrimaryPort" -ForegroundColor Cyan

# Find the PID listening on the port
$pidInfo = netstat -ano | findstr ":$PrimaryPort " | Select-Object -First 1
if (-not $pidInfo) {
    Write-Host "Could not find any process listening on port $PrimaryPort." -ForegroundColor Red
    Write-Host "Usage: .\simulate-failover.ps1 -PrimaryPort <port number>" -ForegroundColor Yellow
    exit 1
}

# Extract PID from the end of the string
$PrimaryPID = ($pidInfo -split '\s+')[-1]

Write-Host "Found Primary Mongod with PID: $PrimaryPID" -ForegroundColor Green
Write-Host "Sending Stop-Process to terminate the primary node..." -ForegroundColor Yellow

# Kill the process
Stop-Process -Id $PrimaryPID -Force -ErrorAction Stop

Write-Host "`nPrimary node terminated successfully!" -ForegroundColor Green
Write-Host "The remaining secondary nodes will now detect the failure (loss of heartbeat)."
Write-Host "An election should occur within a few seconds.`n"

Write-Host "mongosh --port 27018 ../replication/check-replica-status.js (or just check Compass!)" -ForegroundColor Yellow
