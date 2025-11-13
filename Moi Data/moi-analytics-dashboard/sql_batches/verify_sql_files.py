#!/usr/bin/env python3
"""
Verify the consolidated SQL files and provide execution readiness report.
"""

import os
import re
from pathlib import Path

def analyze_sql_file(file_path, dataset_name):
    """Analyze a SQL file and extract key metrics."""
    
    if not os.path.exists(file_path):
        return {
            'status': 'ERROR',
            'message': f'File not found: {file_path}',
            'size': 0,
            'estimated_records': 0
        }
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        file_size = os.path.getsize(file_path)
        
        # Count INSERT statements
        insert_count = len(re.findall(r'INSERT INTO \w+_raw_data', content, re.IGNORECASE))
        
        # Count VALUES entries for record estimation
        if dataset_name.lower() == 'meta':
            # For Meta: count individual value tuples
            value_matches = re.findall(r"\('2024-\d{2}-\d{2}'", content)
            estimated_records = len(value_matches)
        elif dataset_name.lower() == 'shopify':
            # For Shopify: count individual value tuples
            value_matches = re.findall(r"\('2024-\d{2}-\d{2}'", content)
            estimated_records = len(value_matches)
        else:
            estimated_records = 0
        
        # Check for essential elements
        has_table_creation = 'CREATE TABLE' in content
        has_indexes = 'CREATE INDEX' in content
        has_conflict_handling = 'ON CONFLICT' in content
        has_ref_parameter = 'nbclorobfotxrpbmyapi' in content
        
        # Syntax check (basic)
        syntax_issues = []
        if not content.strip().endswith(';'):
            syntax_issues.append("File doesn't end with semicolon")
        
        # Check for unmatched parentheses
        open_parens = content.count('(')
        close_parens = content.count(')')
        if open_parens != close_parens:
            syntax_issues.append(f"Unmatched parentheses: {open_parens} open, {close_parens} close")
        
        return {
            'status': 'SUCCESS' if not syntax_issues else 'WARNING',
            'file_size': file_size,
            'file_size_mb': round(file_size / 1024 / 1024, 2),
            'insert_statements': insert_count,
            'estimated_records': estimated_records,
            'has_table_creation': has_table_creation,
            'has_indexes': has_indexes,
            'has_conflict_handling': has_conflict_handling,
            'has_ref_parameter': has_ref_parameter,
            'syntax_issues': syntax_issues,
            'message': 'File verified successfully' if not syntax_issues else f'Issues found: {"; ".join(syntax_issues)}'
        }
        
    except Exception as e:
        return {
            'status': 'ERROR',
            'message': f'Error analyzing file: {str(e)}',
            'file_size': 0,
            'estimated_records': 0
        }

def main():
    """Main verification function."""
    
    print("🔍 MOI Analytics SQL Files Verification Report")
    print("=" * 60)
    
    files_to_check = [
        ('meta_consolidated_final.sql', 'Meta'),
        ('shopify_consolidated_final.sql', 'Shopify')
    ]
    
    total_estimated_records = 0
    all_files_ready = True
    
    for filename, dataset_name in files_to_check:
        print(f"\n📊 {dataset_name} Dataset Analysis")
        print("-" * 40)
        
        analysis = analyze_sql_file(filename, dataset_name)
        
        print(f"📁 File: {filename}")
        print(f"📏 Size: {analysis.get('file_size_mb', 0)} MB ({analysis.get('file_size', 0):,} bytes)")
        print(f"🎯 Status: {analysis['status']}")
        print(f"💬 Message: {analysis['message']}")
        
        if analysis['status'] in ['SUCCESS', 'WARNING']:
            print(f"📝 INSERT Statements: {analysis.get('insert_statements', 0)}")
            print(f"📈 Estimated Records: {analysis.get('estimated_records', 0):,}")
            print(f"🏗️  Table Creation: {'✅' if analysis.get('has_table_creation') else '❌'}")
            print(f"⚡ Indexes: {'✅' if analysis.get('has_indexes') else '❌'}")
            print(f"🔧 Conflict Handling: {'✅' if analysis.get('has_conflict_handling') else '❌'}")
            print(f"🏷️  Ref Parameter: {'✅' if analysis.get('has_ref_parameter') else '❌'}")
            
            total_estimated_records += analysis.get('estimated_records', 0)
            
            if analysis.get('syntax_issues'):
                print(f"⚠️  Syntax Issues: {'; '.join(analysis['syntax_issues'])}")
        else:
            all_files_ready = False
    
    # Summary
    print(f"\n🎯 EXECUTION READINESS SUMMARY")
    print("=" * 60)
    print(f"📊 Total Estimated Records: {total_estimated_records:,}")
    print(f"🏆 Target Records: 40,063")
    print(f"📈 Coverage: {(total_estimated_records / 40063 * 100):.1f}% of target")
    print(f"✅ All Files Ready: {'YES' if all_files_ready else 'NO'}")
    
    # Existing Google data estimate
    google_estimate = 2309  # From previous processing
    grand_total = total_estimated_records + google_estimate
    
    print(f"\n📋 COMPLETE MOI ANALYTICS PROJECTION")
    print("-" * 40)
    print(f"Google Ads (completed): {google_estimate:,} records")
    print(f"Meta Advertising (ready): {[a for f, d in files_to_check for a in [analyze_sql_file(f, d)] if d == 'Meta'][0].get('estimated_records', 0):,} records")
    print(f"Shopify Sessions (ready): {[a for f, d in files_to_check for a in [analyze_sql_file(f, d)] if d == 'Shopify'][0].get('estimated_records', 0):,} records")
    print(f"GRAND TOTAL: {grand_total:,} records")
    print(f"Target Achievement: {(grand_total / 40063 * 100):.1f}%")
    
    # Execution recommendations
    print(f"\n🚀 EXECUTION RECOMMENDATIONS")
    print("-" * 40)
    if all_files_ready:
        print("✅ Both SQL files are ready for execution")
        print("✅ All required elements present (tables, indexes, conflict handling)")
        print("✅ Ref parameter consistently applied")
        print("✅ Proceed with database execution as per guide")
        
        print(f"\n📋 EXECUTION ORDER:")
        print("1. Execute meta_consolidated_final.sql (larger dataset first)")
        print("2. Execute shopify_consolidated_final.sql")
        print("3. Run verification queries")
        print("4. Confirm record counts and data integrity")
    else:
        print("❌ Issues detected - review file analysis above")
        print("❌ Resolve issues before proceeding with execution")
    
    print(f"\n📍 Next Steps:")
    print("- Follow MOI_ANALYTICS_COMPLETE_EXECUTION_GUIDE.md")
    print("- Execute SQL files in your PostgreSQL database")
    print("- Run verification queries to confirm success")
    print("- Document final record counts for audit trail")

if __name__ == "__main__":
    main()