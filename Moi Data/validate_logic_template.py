#!/usr/bin/env python3
"""
Validate Logic Template Default_Logic.csv file
"""

import sys
sys.path.append('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data')
from validate_template import LogicTemplateValidator

if __name__ == "__main__":
    # Validate the logic template file
    input_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/Default_Logic.csv'
    validator = LogicTemplateValidator(input_path)
    errors, warnings = validator.validate()
    is_valid = validator.print_results()
    
    if not is_valid:
        print("❌ Logic Template Default_Logic.csv has validation issues.")
        print("Issues found that need to be fixed before proceeding.")
        exit(1)
    else:
        print("✅ Logic Template Default_Logic.csv is perfectly validated and ready!")