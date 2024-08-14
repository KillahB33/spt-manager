#!/bin/ash

HOST_CONTAINER_IP=`awk 'END{print $1}' /etc/hosts`
CONTAINER_IP=${HOST_CONTAINER_IP:-127.0.0.1}
BACKEND_IP=${SPT_BACKEND_IP:-127.0.0.1}

echo "Replacing configuration with container ip_addr $CONTAINER_IP"

# If configs have been deleted / reset, restore them from our backup when 
# building the container
CONFIGS=SPT_Data/Server/configs
if [ ! -d "$CONFIGS" ]; then
    cp -R /app/SPT_Data/Server.backup/* /app/SPT_Data/Server
fi

# Update server ips for listening / accepting connections
HTTP_CONFIG=$CONFIGS/http.json
sed -ir 's/"ip": .*,/"ip": "'$CONTAINER_IP'",/' $HTTP_CONFIG
sed -ir 's/"backendIp": .*,/"backendIp": "'$BACKEND_IP'",/' $HTTP_CONFIG

# Update Log Requests
if [ "$SPT_LOG_REQUESTS" = "false" ]; then
    sed -ir 's/"logRequests": true,/"logRequests": false,/g' $HTTP_CONFIG
fi

# Run SPT and Next App
exec supervisord -c /app/supervisord.conf