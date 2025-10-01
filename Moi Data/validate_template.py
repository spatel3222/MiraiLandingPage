#!/usr/bin/env python3
"""
Logic Template Validator
Validates MOI logic template CSV files against business rules
"""

import csv
import re
from typing import List, Dict, Any, Tuple

class LogicTemplateValidator:
    """Validates logic template structure and business rules"""
    
    # Essential fields required for each output file
    ESSENTIAL_FIELDS = {
        'Ad Set Level.csv': ['Date', 'Campaign name', 'Ad Set Name'],
        'Top Level Daily.csv': ['Total Users']
    }
    
    # Valid values for different columns
    VALID_OUTPUT_FILES = ['Ad Set Level.csv', 'Top Level Daily.csv']
    VALID_INPUT_SOURCES = ['Shopify Export', 'Meta Ads', 'Google Ads', 'Calculate', 'Manual']
    VALID_DATA_TYPES = ['Date', 'Text', 'Number']
    
    # Required columns in template
    REQUIRED_COLUMNS = ['Fields', 'Output File Name', 'Input from?', 'Type', 'Formula', 'Notes']
    
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.rows = []
        self.errors = []
        self.warnings = []
        
    def load_template(self):
        """Load CSV template file"""
        try:
            with open(self.filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                self.rows = list(reader)
                return True
        except Exception as e:
            self.errors.append(f"Error loading file: {str(e)}")
            return False
    
    def validate(self) -> Tuple[List[str], List[str]]:
        """Run all validation checks"""
        if not self.load_template():
            return self.errors, self.warnings
            
        # Check column headers
        self._validate_headers()
        
        # Validate each row
        for idx, row in enumerate(self.rows, start=2):  # Start at 2 (header is row 1)
            self._validate_row(idx, row)
        
        # Check business logic requirements
        self._validate_business_logic()
        
        # Check for circular dependencies
        self._check_circular_dependencies()
        
        return self.errors, self.warnings
    
    def _validate_headers(self):
        """Validate that all required columns are present"""
        if not self.rows:
            self.errors.append("Template is empty")
            return
            
        headers = list(self.rows[0].keys())
        for required in self.REQUIRED_COLUMNS:
            if required not in headers:
                self.errors.append(f"Missing required column: {required}")
    
    def _validate_row(self, row_num: int, row: Dict[str, str]):
        """Validate individual row data"""
        # Check required fields (except Notes which is optional)
        for field in ['Fields', 'Output File Name', 'Input from?', 'Type']:
            if not row.get(field, '').strip():
                self.errors.append(f"Row {row_num}: {field} is required and cannot be empty")
        
        # Check Formula is present for non-Manual inputs
        if row.get('Input from?', '').strip() != 'Manual':
            if not row.get('Formula', '').strip():
                self.errors.append(f"Row {row_num}: Formula is required for input source '{row.get('Input from?')}'")
        
        # Validate Output File Name
        output_file = row.get('Output File Name', '').strip()
        if output_file and output_file not in self.VALID_OUTPUT_FILES:
            self.errors.append(f"Row {row_num}: Invalid output file '{output_file}'. Must be one of: {', '.join(self.VALID_OUTPUT_FILES)}")
        
        # Validate Input Source
        input_from = row.get('Input from?', '').strip()
        if input_from and input_from not in self.VALID_INPUT_SOURCES:
            self.errors.append(f"Row {row_num}: Invalid input source '{input_from}'. Must be one of: {', '.join(self.VALID_INPUT_SOURCES)}")
        
        # Validate Data Type
        data_type = row.get('Type', '').strip()
        if data_type and data_type not in self.VALID_DATA_TYPES:
            self.errors.append(f"Row {row_num}: Invalid data type '{data_type}'. Must be one of: {', '.join(self.VALID_DATA_TYPES)}")
        
        # Check for duplicate field names within same output file
        self._check_duplicates(row_num, row)
    
    def _validate_business_logic(self):
        """Validate business logic requirements"""
        # Group fields by output file
        fields_by_file = {}
        for row in self.rows:
            output_file = row.get('Output File Name', '').strip()
            field_name = row.get('Fields', '').strip()
            
            if output_file not in fields_by_file:
                fields_by_file[output_file] = []
            fields_by_file[output_file].append(field_name)
        
        # Check essential fields for each output file
        for output_file, required_fields in self.ESSENTIAL_FIELDS.items():
            provided_fields = fields_by_file.get(output_file, [])
            for required_field in required_fields:
                if required_field not in provided_fields:
                    self.errors.append(f"Essential field '{required_field}' is missing for output file '{output_file}'")
    
    def _check_duplicates(self, row_num: int, row: Dict[str, str]):
        """Check for duplicate field names"""
        output_file = row.get('Output File Name', '').strip()
        field_name = row.get('Fields', '').strip()
        
        # Count occurrences
        count = 0
        for r in self.rows:
            if (r.get('Output File Name', '').strip() == output_file and 
                r.get('Fields', '').strip() == field_name):
                count += 1
        
        if count > 1:
            self.warnings.append(f"Row {row_num}: Duplicate field name '{field_name}' found in {output_file}")
    
    def _check_circular_dependencies(self):
        """Check for circular dependencies in calculated fields"""
        # Build dependency graph
        field_map = {}
        for row in self.rows:
            if row.get('Input from?', '').strip() == 'Calculate':
                field_name = row.get('Fields', '').strip().lower()
                formula = row.get('Formula', '').strip()
                
                # Extract field references from formula (simple pattern matching)
                # This looks for field names in formulas like "Field1 / Field2"
                dependencies = []
                if formula:
                    # Split by operators and extract potential field names
                    parts = re.split(r'[+\-*/()]+', formula)
                    for part in parts:
                        clean_part = part.strip()
                        if clean_part and not clean_part.replace('.', '').isdigit():
                            dependencies.append(clean_part.lower())
                
                field_map[field_name] = dependencies
        
        # Check for circular dependencies using DFS
        def has_cycle(field, visited, rec_stack):
            visited.add(field)
            rec_stack.add(field)
            
            for dep in field_map.get(field, []):
                if dep not in visited:
                    if has_cycle(dep, visited, rec_stack):
                        return True
                elif dep in rec_stack:
                    self.errors.append(f"Circular dependency detected involving field '{field}'")
                    return True
            
            rec_stack.remove(field)
            return False
        
        visited = set()
        for field in field_map:
            if field not in visited:
                rec_stack = set()
                has_cycle(field, visited, rec_stack)
    
    def print_results(self):
        """Print validation results in a formatted way"""
        print("\n" + "="*60)
        print("TEMPLATE VALIDATION RESULTS")
        print("="*60)
        
        if not self.errors and not self.warnings:
            print("✅ Template is VALID - No errors or warnings found!")
        else:
            if self.errors:
                print(f"\n❌ ERRORS FOUND: {len(self.errors)}")
                print("-"*40)
                for i, error in enumerate(self.errors, 1):
                    print(f"{i}. {error}")
            
            if self.warnings:
                print(f"\n⚠️ WARNINGS FOUND: {len(self.warnings)}")
                print("-"*40)
                for i, warning in enumerate(self.warnings, 1):
                    print(f"{i}. {warning}")
        
        print("\n" + "="*60)
        print(f"Summary: {len(self.errors)} errors, {len(self.warnings)} warnings")
        print("="*60 + "\n")
        
        return len(self.errors) == 0


if __name__ == "__main__":
    # Validate the template
    validator = LogicTemplateValidator('/Users/shivangpatel/Downloads/Fixed_Logic_Template.csv')
    errors, warnings = validator.validate()
    is_valid = validator.print_results()
    
    if not is_valid:
        print("Please fix the errors above and run validation again.")
    else:
        print("Template is ready to be used as the default!")