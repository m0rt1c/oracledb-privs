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

ODIR=./site/tables
if [ ! -d "$ODIR" ]; then 
    mkdir "$ODIR"
fi

while read table
do
    echo Downloading "$table"
    usql -q oracle://$USR:$PAS@$HST:$PRT/$SID --csv -c "SELECT * FROM $table;" > "$ODIR/$table.csv"
done < tables.txt
