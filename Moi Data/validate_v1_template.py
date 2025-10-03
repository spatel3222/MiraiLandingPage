#!/usr/bin/env python3
"""
Validate Default_Logic_v1.csv template
"""

import sys
sys.path.append('/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data')
from validate_template import LogicTemplateValidator

if __name__ == "__main__":
    # Validate the v1 template
    validator = LogicTemplateValidator('/Users/shivangpatel/Downloads/Default_Logic_v1.csv')
    errors, warnings = validator.validate()
    is_valid = validator.print_results()
    
    if not is_valid:
        print("❌ Default_Logic_v1.csv has validation issues.")
        exit(1)
    else:
        print("✅ Default_Logic_v1.csv is perfectly validated and ready for deployment!")