#!/usr/bin/env python3
"""
Fix Meta SQL file formatting issues
This script corrects the broken VALUES statements in the meta consolidated SQL file
"""

import re
import os

def fix_meta_sql_file():
    input_file = "meta_consolidated_final_fixed.sql"
    output_file = "meta_consolidated_corrected.sql"
    
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
        
        # Check if this is a broken VALUES statement
        if (line.startswith("('") and line.endswith("'nbclorobfotxrpbmyapi'),") and 
            i + 1 < len(lines) and lines[i + 1].strip() and 
            not lines[i + 1].strip().startswith("('") and 
            not lines[i + 1].strip().startswith("--") and
            not lines[i + 1].strip().startswith("INSERT")):
            
            # Extract the string part (everything before 'nbclorobfotxrpbmyapi'),)
            string_part = line[:-2]  # Remove '),
            
            # Get the numeric values from the next line
            if i + 1 < len(lines):
                numeric_line = lines[i + 1].strip()
                if numeric_line.endswith('),'):
                    numeric_part = numeric_line[:-2]  # Remove ),
                elif numeric_line.endswith(');'):
                    numeric_part = numeric_line[:-2]  # Remove );
                else:
                    numeric_part = numeric_line
                
                # Reconstruct the proper VALUES line
                if i + 2 < len(lines) and lines[i + 2].strip() == ');':
                    # This is the last value in the INSERT statement
                    fixed_line = f"    {string_part}, {numeric_part}, 'nbclorobfotxrpbmyapi');"
                    fixed_lines.append(fixed_line)
                    i += 3  # Skip the next two lines
                else:
                    # This is not the last value
                    fixed_line = f"    {string_part}, {numeric_part}, 'nbclorobfotxrpbmyapi'),"
                    fixed_lines.append(fixed_line)
                    i += 2  # Skip the next line
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
    fixed_file = fix_meta_sql_file()
    print(f"\n🚀 Ready to execute: {fixed_file}")