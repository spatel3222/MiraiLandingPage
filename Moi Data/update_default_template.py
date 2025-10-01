#!/usr/bin/env python3
"""
Convert validated CSV template to TypeScript format for DEFAULT_LOGIC_TEMPLATE
"""

import csv
import json

def csv_to_typescript(csv_path):
    """Convert CSV template to TypeScript LogicTemplateRow array"""
    
    rows = []
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            ts_row = {
                'fields': row['Fields'].strip(),
                'outputFileName': row['Output File Name'].strip(),
                'inputFrom': row['Input from?'].strip(),
                'type': row['Type'].strip(),
                'formula': row['Formula'].strip()
            }
            
            # Add notes only if not empty
            notes = row.get('Notes', '').strip()
            if notes:
                ts_row['notes'] = notes
            
            rows.append(ts_row)
    
    return rows

def generate_typescript_code(template_rows):
    """Generate TypeScript code for DEFAULT_LOGIC_TEMPLATE"""
    
    ts_code = "// Default template structure matching the validated logic file\n"
    ts_code += "export const DEFAULT_LOGIC_TEMPLATE: LogicTemplateRow[] = [\n"
    
    for i, row in enumerate(template_rows):
        ts_code += "  {\n"
        ts_code += f"    fields: '{row['fields']}',\n"
        ts_code += f"    outputFileName: '{row['outputFileName']}',\n"
        ts_code += f"    inputFrom: '{row['inputFrom']}',\n"
        ts_code += f"    type: '{row['type']}',\n"
        
        # Escape single quotes in formula
        formula = row['formula'].replace("'", "\\'")
        ts_code += f"    formula: '{formula}'"
        
        if 'notes' in row and row['notes']:
            notes = row['notes'].replace("'", "\\'")
            ts_code += f",\n    notes: '{notes}'"
        
        ts_code += "\n  }"
        
        if i < len(template_rows) - 1:
            ts_code += ","
        ts_code += "\n"
    
    ts_code += "];\n"
    
    return ts_code

# Convert the validated template
csv_path = '/Users/shivangpatel/Downloads/Default_Logic.csv'
template_rows = csv_to_typescript(csv_path)

# Generate TypeScript code
ts_code = generate_typescript_code(template_rows)

# Save to a temporary file for review
output_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/new_default_template.ts'
with open(output_path, 'w') as f:
    f.write(ts_code)

print("TypeScript template generated successfully!")
print(f"Output saved to: {output_path}")
print(f"\nTotal fields configured: {len(template_rows)}")

# Group by output file for summary
by_file = {}
for row in template_rows:
    file_name = row['outputFileName']
    if file_name not in by_file:
        by_file[file_name] = 0
    by_file[file_name] += 1

print("\nFields per output file:")
for file_name, count in by_file.items():
    print(f"  {file_name}: {count} fields")