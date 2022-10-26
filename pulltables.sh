#!/bin/bash

while read table
do
    usql -q oracle://$USR:$PWD@$HST:1540/$SID --csv -c "SELECT * FROM $table" > ./site/tables/$table.csv
done < tables.txt