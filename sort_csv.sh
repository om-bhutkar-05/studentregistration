#!/bin/bash

# Check if correct arguments are passed
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <csv_file> <column_name>"
    exit 1
fi

csv_file=$1
column_name=$2

# Check if the file exists
if [ ! -f "$csv_file" ]; then
    echo "Error: File '$csv_file' not found!"
    exit 1
fi

# Get the index of the column name (1-based index)
column_index=$(head -n 1 "$csv_file" | awk -F, -v col="$column_name" '{
    for (i=1; i<=NF; i++) {
        if ($i == col) {
            print i;
            exit;
        }
    }
}')

# Check if the column was found
if [ -z "$column_index" ]; then
    echo "Error: Column '$column_name' not found in the file."
    exit 1
fi

# Sort the CSV file based on the given column (ignoring the header)
header=$(head -n 1 "$csv_file")
{
    echo "$header"
    tail -n +2 "$csv_file" | sort -t, -k"$column_index","$column_index"
} > sorted_"$csv_file"

echo "File sorted by column '$column_name'. Output saved to sorted_$csv_file"

