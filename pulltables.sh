#!/bin/bash

if [ ! -s "./.env" ]; then
    echo "No env file"
    exit 1
fi

source .env

if [ ! $(which usql) ]; then
    echo "usql bin not found"
    exit 2
fi

while read table
do
    echo Downloading "$table"
    usql -q oracle://$USR:$PWD@$HST:$PORT/$SID --csv -c "SELECT * FROM $table;" > ./site/tables/$table.csv
done < tables.txt