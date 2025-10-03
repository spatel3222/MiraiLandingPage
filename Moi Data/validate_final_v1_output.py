#!/usr/bin/env python3
"""
Final validation of Default_Logic_v1.csv output file in the correct location
"""

import sys
sys.path.append('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data')
from validate_template import LogicTemplateValidator

if __name__ == "__main__":
    # Validate the final output file
    output_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/MOI Original Data/Default_Logic_v1.csv'
    validator = LogicTemplateValidator(output_path)
    errors, warnings = validator.validate()
    is_valid = validator.print_results()
    
    if not is_valid:
        print("❌ Final output Default_Logic_v1.csv has validation issues.")
        exit(1)
    else:
        print("✅ Default_Logic_v1.csv is perfectly validated and ready for production deployment!")
        print(f"📁 Output file location: {output_path}")
        print(f"📊 Template now includes {len(validator.rows)} field definitions")