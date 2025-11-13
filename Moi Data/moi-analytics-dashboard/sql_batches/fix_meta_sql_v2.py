#!/usr/bin/env python3
"""
Fix Meta SQL file formatting issues (Version 2)
This script properly reconstructs the VALUES statements with correct column ordering
"""

import re
import os

def fix_meta_sql_file_v2():
    input_file = "meta_consolidated_final_fixed.sql"
    output_file = "meta_consolidated_final_corrected.sql"
    
    print(f"🔧 Fixing SQL formatting in {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split content into lines for processing
    lines = content.split('\n')
    
    # Process lines to fix VALUES statements
    fixed_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i].strip()
        
        # If this is an INSERT statement, just copy it but fix the column order
        if line.startswith("INSERT INTO meta_raw_data"):
            # Add the corrected INSERT statement
            fixed_lines.append("INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name,")
            fixed_lines.append("                           amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter)")
            i += 1
            continue
        
        # Copy the VALUES line as-is
        if line == "VALUES":
            fixed_lines.append("VALUES")
            i += 1
            continue
        
        # Check if this is a broken VALUES statement
        if (line.startswith("('") and "'nbclorobfotxrpbmyapi'" in line and line.endswith("),") and 
            i + 1 < len(lines) and lines[i + 1].strip() and 
            not lines[i + 1].strip().startswith("('") and 
            not lines[i + 1].strip().startswith("--") and
            not lines[i + 1].strip().startswith("INSERT")):
            
            # Extract the data before 'nbclorobfotxrpbmyapi'
            # Pattern: ('date', 'campaign', 'adset', 'ad', 'nbclorobfotxrpbmyapi'),
            
            # Find where 'nbclorobfotxrpbmyapi' appears and extract everything before it
            match = re.match(r"(\s*\('.*?'), 'nbclorobfotxrpbmyapi'\),", line)
            if match:
                data_part = match.group(1)
                
                # Get the numeric values from the next line
                if i + 1 < len(lines):
                    numeric_line = lines[i + 1].strip()
                    if numeric_line.endswith('),'):
                        numeric_part = numeric_line[:-2]  # Remove ),
                    elif numeric_line.endswith(');'):
                        numeric_part = numeric_line[:-2]  # Remove );
                        # This is the last value in the INSERT statement
                        fixed_line = f"    {data_part}, {numeric_part}, 'nbclorobfotxrpbmyapi');"
                        fixed_lines.append(fixed_line)
                        i += 2  # Skip the next line
                        continue
                    else:
                        numeric_part = numeric_line
                    
                    # Reconstruct the proper VALUES line
                    fixed_line = f"    {data_part}, {numeric_part}, 'nbclorobfotxrpbmyapi'),"
                    fixed_lines.append(fixed_line)
                    i += 2  # Skip the next line
                else:
                    fixed_lines.append(line)
                    i += 1
            else:
                fixed_lines.append(line)
                i += 1
        else:
            fixed_lines.append(line)
            i += 1
    
    # Write the fixed content
    fixed_content = '\n'.join(fixed_lines)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(fixed_content)
    
    print(f"✅ Fixed SQL file saved as {output_file}")
    
    # Get file sizes for comparison
    original_size = os.path.getsize(input_file)
    fixed_size = os.path.getsize(output_file)
    
    print(f"📊 Original file: {original_size:,} bytes")
    print(f"📊 Fixed file: {fixed_size:,} bytes")
    
    return output_file

if __name__ == "__main__":
    fixed_file = fix_meta_sql_file_v2()
    print(f"\n🚀 Ready to execute: {fixed_file}")