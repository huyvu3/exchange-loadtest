#!/bin/bash

# Database connection details for the Docker container
DB_NAME="monas"
DB_USER="monas"
TOTAL_USERS=1000
ASSETS=("btc" "usdt" "eos" "ada" "eth")
DOCKER_CONTAINER_NAME="postgres_db"

# Check if docker container is running
if ! docker ps --filter "name=$DOCKER_CONTAINER_NAME" --quiet; then
    echo "Docker container '$DOCKER_CONTAINER_NAME' is not running. Exiting."
    exit 1
fi


for (( i=1; i<=TOTAL_USERS; i++ ))
do
    EMAIL="bot_${i}@sotatek.com"
    PASSWORD='$2b$10$XsguBT.pceZm8uXh5zsGWerqkFfe3vDjUbAukHLMdSNpVyd1tEv2q' # Test@12345
    MAX_SECURITY_LEVEL=1
    STATUS="active"
    IS_TESTER="inactive"
    TYPE="normal"
    UUID_GEN=$(uuidgen)


    SQL="INSERT INTO users (email, password, max_security_level, status, is_tester, type, uid) \
         VALUES ('$EMAIL', '$PASSWORD', $MAX_SECURITY_LEVEL, '$STATUS', '$IS_TESTER', '$TYPE', '$UUID_GEN') RETURNING id, email;"


    USER_INSERT_RESULT=$(docker exec -i $DOCKER_CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "$SQL")

    USER_ID=$(echo "$USER_INSERT_RESULT" | sed 's/[[:space:]]*\([0-9]*\).*/\1/')

    for asset in "${ASSETS[@]}"
    do
       ACCOUNT_INSERT_SQL="INSERT INTO accounts (user_id, asset, balance, user_email) \
                                   VALUES ($USER_ID, '$asset', 999999999999, '$EMAIL');"
        docker exec -i $DOCKER_CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "$ACCOUNT_INSERT_SQL"
    done

    USER_SECURITY_SETTING="INSERT INTO user_security_settings (user_id, email_verified) \
                                    VALUES ($USER_ID, 1);"

     docker exec -i $DOCKER_CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -t -c "$USER_SECURITY_SETTING"
    echo "============ DONE INSERT $USER_ID WITH EMAIL $EMAIL"
done

echo "Insertion completed! $TOTAL_USERS users, accounts, and security settings inserted."


