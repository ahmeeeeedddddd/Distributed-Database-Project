URI="mongodb://127.0.0.1:27017,127.0.0.1:27018,127.0.0.1:27019/?replicaSet=rs0" # at2kd mn el url da 

echo "------------------------------------------------------"
echo " Monitoring MongoDB Replica Set Status (Every 5s)"
echo "------------------------------------------------------"

while true; do
    clear
    echo "Last Updated: $(date)"
    echo "------------------------------------------------------"
    
    # Run mongosh to get the status of each member
    mongosh "$URI" --quiet --eval "
        rs.status().members.forEach(member => {
            print('Node: ' + member.name + ' | State: ' + member.stateStr + ' | Health: ' + (member.health == 1 ? 'UP' : 'DOWN'));
        })
    "
    
    echo "------------------------------------------------------"
    echo "Hold [CTRL+C] to exit monitoring."
    sleep 5
done