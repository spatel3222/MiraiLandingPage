#!/usr/bin/env python3
"""
Check which fields from the validated template are missing in the current TypeScript default
"""

import csv

# Load the validated template
validated_fields = []
with open('/Users/shivangpatel/Downloads/Default_Logic.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        validated_fields.append(row['Fields'].strip())

# Current fields in the TypeScript (based on what we saw)
current_fields = [
    'Date',
    'Campaign name',
    'Ad Set Name',
    'Ad Set Delivery',
    'Ad Set Level Spent',
    'Ad Set Level Users',
    'Cost per user',
    'Ad Set Level  ATC',
    'Ad Set Level  Reached Checkout',
    'Ad Set Level Conversions',
    # Missing from current: Average session duration, Users with Session above 1 min, etc.
    'Meta Spend',
    'Meta CTR',
    'Meta CPM',
    'Google Spend',
    'Google CTR',
    'Google CPM',
    'Total Users',
    'Total  ATC',
    'Total  Reached Checkout ',
    'Total Abandoned Checkout',
    'Session Duration',
    'Users with Session above 1 min',
    'Users with Above 5 page views and above 1 min',
    'ATC with session duration above 1 min',
    'Reached Checkout with session duration above 1 min'
]

# Find missing fields
missing_fields = []
for field in validated_fields:
    if field not in current_fields:
        missing_fields.append(field)

print("Fields in validated template:", len(validated_fields))
print("Fields in current TypeScript:", len(current_fields))
print("\nMissing fields:")
for field in missing_fields:
    print(f"  - {field}")