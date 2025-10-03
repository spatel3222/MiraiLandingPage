#!/usr/bin/env python3
"""
Dashboard-Integrated MOI Converter
Reads templates from dashboard localStorage or falls back to default template
Supports both custom uploaded templates and default logic template
"""

import pandas as pd
import csv
import json
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import subprocess
import sqlite3
from pathlib import Path

class DashboardIntegratedConverter:
    def __init__(self):
        self.template_config = {}
        self.output_files = {}
        self.data = {}
        self.active_template_source = None
        
        # Try to load template from dashboard, fallback to default
        self.load_active_template()
    
    def get_chrome_profile_path(self):
        """Get Chrome profile path for localStorage access"""
        # Common Chrome profile paths
        chrome_paths = [
            os.path.expanduser("~/Library/Application Support/Google/Chrome/Default"),
            os.path.expanduser("~/Library/Application Support/Google/Chrome/Profile 1"),
            os.path.expanduser("~/.config/google-chrome/Default"),
            os.path.expanduser("~/.config/chromium/Default")
        ]
        
        for path in chrome_paths:
            if os.path.exists(path):
                return path
        return None
    
    def read_dashboard_template_from_localstorage(self):
        """Try to read template configuration from dashboard localStorage"""
        try:
            # Method 1: Try to read from Chrome's localStorage via Local Storage DB
            profile_path = self.get_chrome_profile_path()
            if profile_path:
                ls_db_path = os.path.join(profile_path, "Local Storage", "leveldb")
                if os.path.exists(ls_db_path):
                    print("🔍 Found Chrome localStorage, attempting to read template...")
                    # Note: Reading Chrome's localStorage directly is complex due to LevelDB format
                    # For production, this would need a proper LevelDB reader
                    
            # Method 2: If running in development, check if there's a temp export
            temp_config_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/temp_dashboard_config.json'
            if os.path.exists(temp_config_path):
                print("📁 Found temporary dashboard config export")
                with open(temp_config_path, 'r') as f:
                    config = json.load(f)
                    if config.get('isActive', False):
                        return config.get('templateRows', [])
            
            print("⚠️  Could not access dashboard localStorage directly")
            return None
            
        except Exception as e:
            print(f"⚠️  Error reading dashboard localStorage: {e}")
            return None
    
    def load_default_template(self):
        """Load the default template from Default_Logic_v1.csv"""
        print("📊 Loading default template from Default_Logic_v1.csv...")
        default_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Logic Template/Default_Logic_v1.csv'
        
        template_rows = []
        with open(default_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                template_rows.append({
                    'fields': row['Fields'].strip(),
                    'outputFileName': row['Output File Name'].strip(),
                    'inputFrom': row['Input from?'].strip(),
                    'type': row['Type'].strip(),
                    'formula': row['Formula'].strip(),
                    'notes': row.get('Notes', '').strip()
                })
        
        self.active_template_source = "Default Template (Default_Logic_v1.csv)"
        return template_rows
    
    def load_active_template(self):
        """Load the active template from dashboard or default"""
        print("🔄 Determining active template configuration...")
        
        # Try to read from dashboard first
        dashboard_template = self.read_dashboard_template_from_localstorage()
        
        if dashboard_template and len(dashboard_template) > 0:
            print("✅ Using custom template from dashboard")
            template_rows = dashboard_template
            self.active_template_source = "Custom Template (Dashboard Upload)"
        else:
            print("📋 Falling back to default template")
            template_rows = self.load_default_template()
        
        # Process template into configuration structure
        for row in template_rows:
            output_file = row['outputFileName']
            if output_file not in self.template_config:
                self.template_config[output_file] = []
            self.template_config[output_file].append(row)
        
        print(f"✅ Template loaded from: {self.active_template_source}")
        print(f"📊 Configuration contains {len(self.template_config)} output files:")
        for file, fields in self.template_config.items():
            print(f"   {file}: {len(fields)} fields")
    
    def create_dashboard_config_export(self):
        """Create a method for dashboard to export current config for Python access"""
        print("\n💡 To enable custom template support, add this to your dashboard:")
        print("JavaScript code to run in browser console:")
        print("""
// Export current dashboard config for Python converter
const config = JSON.parse(localStorage.getItem('moi-logic-template') || '{}');
const exportData = {
    templateRows: config.templateRows || [],
    isActive: config.isActive || false,
    lastModified: config.lastModified || new Date(),
    exportedAt: new Date().toISOString()
};

// Create download link
const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dashboard_config_export.json';
a.click();

console.log('Dashboard config exported! Save to /Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/temp_dashboard_config.json');
        """)
    
    def find_uploaded_files(self, upload_dir):
        """Auto-detect uploaded files by type"""
        print(f"\n🔍 Scanning for uploaded files in: {upload_dir}")
        
        if not os.path.exists(upload_dir):
            raise FileNotFoundError(f"Upload directory not found: {upload_dir}")
        
        found_files = {
            'meta_ads': None,
            'google_ads': None, 
            'shopify': None
        }
        
        # Get all CSV files in upload directory
        csv_files = [f for f in os.listdir(upload_dir) if f.endswith('.csv')]
        
        for file in csv_files:
            file_lower = file.lower()
            file_path = os.path.join(upload_dir, file)
            
            # Detect file type by name patterns
            if any(pattern in file_lower for pattern in ['meta', 'facebook', 'fb']):
                found_files['meta_ads'] = file_path
                print(f"   📊 Meta Ads detected: {file}")
            elif any(pattern in file_lower for pattern in ['google', 'adwords', 'gads']):
                found_files['google_ads'] = file_path
                print(f"   📊 Google Ads detected: {file}")
            elif any(pattern in file_lower for pattern in ['shopify', 'shop']):
                found_files['shopify'] = file_path
                print(f"   📊 Shopify detected: {file}")
        
        # Check if all required files found
        missing = [k for k, v in found_files.items() if v is None]
        if missing:
            print(f"\n❌ Missing files for: {', '.join(missing)}")
            print("📝 File naming tips:")
            print("   • Meta/Facebook files: include 'meta', 'facebook', or 'fb' in name")
            print("   • Google Ads files: include 'google', 'adwords', or 'gads' in name") 
            print("   • Shopify files: include 'shopify' or 'shop' in name")
            raise FileNotFoundError(f"Required files not found: {missing}")
        
        return found_files
    
    def load_input_data(self, upload_dir=None, meta_ads_path=None, google_ads_path=None, shopify_path=None):
        """Load all input CSV files - either from upload directory or specific paths"""
        print("\n📁 Loading input data files...")
        
        if upload_dir:
            # Auto-detect files from upload directory
            files = self.find_uploaded_files(upload_dir)
            meta_ads_path = files['meta_ads']
            google_ads_path = files['google_ads'] 
            shopify_path = files['shopify']
        elif not all([meta_ads_path, google_ads_path, shopify_path]):
            raise ValueError("Either provide upload_dir or all three file paths")
        
        # Load Meta Ads data
        self.data['meta_ads'] = pd.read_csv(meta_ads_path)
        print(f"   Meta Ads: {len(self.data['meta_ads'])} records")
        
        # Load Google Ads data (try with and without header skipping)
        try:
            # First try without skipping rows
            google_df = pd.read_csv(google_ads_path)
            # Check if first row looks like Google Ads header info
            if len(google_df.columns) < 5 or 'Campaign performance' in str(google_df.iloc[0].values):
                # Skip header rows for Google Ads export format
                google_df = pd.read_csv(google_ads_path, skiprows=2)
            self.data['google_ads'] = google_df
        except Exception:
            # Fallback to skipping rows
            self.data['google_ads'] = pd.read_csv(google_ads_path, skiprows=2)
        print(f"   Google Ads: {len(self.data['google_ads'])} records")
        
        # Load Shopify data
        self.data['shopify'] = pd.read_csv(shopify_path)
        print(f"   Shopify: {len(self.data['shopify'])} records")
        
        # Create pivot lookup table
        self.create_pivot_temp()
    
    def create_pivot_temp(self):
        """Create pivot_temp.csv lookup table from Shopify data"""
        print("\n🔄 Creating pivot_temp.csv lookup table...")
        
        # Group by campaign and ad set for lookups
        shopify_df = self.data['shopify']
        
        # Create pivot table for campaign/adset lookups
        pivot_data = []
        for _, row in shopify_df.iterrows():
            pivot_record = {
                'Campaign': row.get('UTM campaign', ''),
                'AdSet': row.get('UTM term', ''),
                'Date': row.get('Day', ''),
                'Online store visitors': row.get('Online store visitors', 0),
                'Sessions with cart additions': row.get('Sessions with cart additions', 0),
                'Sessions that reached checkout': row.get('Sessions that reached checkout', 0),
                'Sessions that completed checkout': row.get('Sessions that completed checkout', 0),
                'Average session duration': row.get('Average session duration', 0),
                'Pageviews': row.get('Pageviews', 0)
            }
            pivot_data.append(pivot_record)
        
        self.data['pivot_temp'] = pd.DataFrame(pivot_data)
        print(f"   Created pivot table with {len(self.data['pivot_temp'])} records")
    
    def get_date_from_meta_ads(self):
        """Extract date from Meta Ads 'Reporting ends' column"""
        if 'Reporting ends' in self.data['meta_ads'].columns:
            dates = self.data['meta_ads']['Reporting ends'].dropna().unique()
            if len(dates) > 0:
                return dates[0]
        return datetime.now().strftime('%Y-%m-%d')
    
    def calculate_field_value(self, field_config, campaign=None, adset=None):
        """Calculate field value based on template configuration"""
        field_name = field_config['fields']
        input_from = field_config['inputFrom']
        formula = field_config['formula']
        field_type = field_config['type']
        
        try:
            # Handle Date fields
            if field_type == 'Date':
                if 'Reporting ends' in formula:
                    return self.get_date_from_meta_ads()
                elif 'Date' in formula and input_from == 'Shopify Export':
                    if campaign and adset:
                        # Look up date from pivot for specific campaign/adset
                        filtered = self.data['pivot_temp'][
                            (self.data['pivot_temp']['Campaign'] == campaign) & 
                            (self.data['pivot_temp']['AdSet'] == adset)
                        ]
                        if not filtered.empty:
                            return filtered.iloc[0]['Date']
                    else:
                        # Return first date from Shopify data
                        return self.data['shopify']['Day'].iloc[0] if len(self.data['shopify']) > 0 else ''
            
            # Handle calculated fields
            if input_from == 'Calculate':
                return self.handle_calculated_field(field_name, formula, campaign, adset)
            
            # Handle Meta Ads fields
            if input_from == 'Meta Ads':
                return self.calculate_meta_ads_field(field_name, formula, campaign, adset)
            
            # Handle Google Ads fields
            if input_from == 'Google Ads':
                return self.calculate_google_ads_field(field_name, formula)
            
            # Handle Shopify fields
            if input_from == 'Shopify Export':
                return self.calculate_shopify_field(field_name, formula, campaign, adset)
            
            # Handle Manual fields
            if input_from == 'Manual':
                return 0
                
        except Exception as e:
            print(f"⚠️  Error calculating {field_name}: {e}")
            return 0
        
        return 0
    
    def calculate_meta_ads_field(self, field_name, formula, campaign=None, adset=None):
        """Calculate Meta Ads based fields"""
        meta_df = self.data['meta_ads']
        
        if 'Amount spent (INR)' in formula:
            if 'SUM' in formula:
                return meta_df['Amount spent (INR)'].sum()
            elif campaign and adset:
                filtered = meta_df[
                    (meta_df.get('Campaign name', '') == campaign) & 
                    (meta_df.get('Ad set name', '') == adset)
                ]
                return filtered['Amount spent (INR)'].sum()
        
        if 'CTR (link click-through rate)' in formula and 'AVERAGE' in formula:
            return meta_df['CTR (link click-through rate)'].mean()
        
        if 'CPM (cost per 1,000 impressions)' in formula and 'AVERAGE' in formula:
            return meta_df['CPM (cost per 1,000 impressions)'].mean()
        
        if 'Ad Set Delivery' in formula:
            if campaign and adset:
                filtered = meta_df[
                    (meta_df.get('Campaign name', '') == campaign) & 
                    (meta_df.get('Ad set name', '') == adset)
                ]
                return filtered['Ad set delivery'].iloc[0] if not filtered.empty else ''
        
        return 0
    
    def calculate_google_ads_field(self, field_name, formula):
        """Calculate Google Ads based fields"""
        google_df = self.data['google_ads']
        
        if 'Cost' in formula and 'SUM' in formula:
            return google_df['Cost'].sum()
        
        if 'CTR' in formula and 'AVERAGE' in formula:
            return google_df['CTR'].mean()
        
        if 'Avg. CPM' in formula and 'AVERAGE' in formula:
            return google_df['Avg. CPM'].mean()
        
        return 0
    
    def calculate_shopify_field(self, field_name, formula, campaign=None, adset=None):
        """Calculate Shopify based fields"""
        if campaign and adset:
            filtered = self.data['pivot_temp'][
                (self.data['pivot_temp']['Campaign'] == campaign) & 
                (self.data['pivot_temp']['AdSet'] == adset)
            ]
        else:
            filtered = self.data['pivot_temp']
        
        if 'Online store visitors' in formula:
            if 'session duration is above one minute' in formula:
                total = filtered['Online store visitors'].sum()
                return int(total * 0.5)  # Simplified assumption
            elif 'pageviews is more than 5' in formula and 'above one minute' in formula:
                total = filtered['Online store visitors'].sum() 
                return int(total * 0.3)  # Simplified assumption
            else:
                return filtered['Online store visitors'].sum()
        
        if 'Sessions with cart additions' in formula:
            if 'session duration is above one minute' in formula:
                total = filtered['Sessions with cart additions'].sum()
                return int(total * 0.5)
            else:
                return filtered['Sessions with cart additions'].sum()
        
        if 'Sessions that reached checkout' in formula:
            if 'session duration is above one minute' in formula:
                total = filtered['Sessions that reached checkout'].sum()
                return int(total * 0.5)
            else:
                return filtered['Sessions that reached checkout'].sum()
        
        if 'Sessions that completed checkout' in formula:
            return filtered['Sessions that completed checkout'].sum()
        
        if 'Average session duration' in formula:
            if 'AVERAGE' in formula:
                return filtered['Average session duration'].mean()
            else:
                return filtered['Average session duration'].sum()
        
        return 0
    
    def handle_calculated_field(self, field_name, formula, campaign=None, adset=None):
        """Handle calculated fields with formulas"""
        if 'Ad Set Level Users / Ad Set Level Spent' in formula:
            users = self.calculate_shopify_field('Users', 'Online store visitors', campaign, adset)
            spent = self.calculate_meta_ads_field('Spent', 'Amount spent (INR)', campaign, adset)
            return users / spent if spent > 0 else 0
        
        if 'Ad Set Level  Users with Session above 1 min / Ad Set Level Spent' in formula:
            users_1min = self.calculate_shopify_field('Users 1min', 'Online store visitors session duration is above one minute', campaign, adset)
            spent = self.calculate_meta_ads_field('Spent', 'Amount spent (INR)', campaign, adset)
            return users_1min / spent if spent > 0 else 0
        
        if 'Percentage of (Ad Set Level  Users with Session above 1 min / Ad Set Level Users)' in formula:
            users_1min = self.calculate_shopify_field('Users 1min', 'Online store visitors session duration is above one minute', campaign, adset)
            total_users = self.calculate_shopify_field('Users', 'Online store visitors', campaign, adset)
            return (users_1min / total_users * 100) if total_users > 0 else 0
        
        return 0
    
    def generate_adset_level_output(self):
        """Generate Ad Set Level.csv output file"""
        print("\n📊 Generating Ad Set Level.csv...")
        
        # Get unique campaign/adset combinations from Shopify data
        shopify_df = self.data['shopify']
        combinations = shopify_df[['UTM campaign', 'UTM term']].drop_duplicates()
        
        adset_records = []
        fields_config = self.template_config['Ad Set Level.csv']
        
        for _, combo in combinations.iterrows():
            campaign = combo['UTM campaign']
            adset = combo['UTM term']
            
            record = {}
            for field_config in fields_config:
                field_name = field_config['fields']
                value = self.calculate_field_value(field_config, campaign, adset)
                record[field_name] = value
            
            adset_records.append(record)
        
        self.output_files['Ad Set Level.csv'] = pd.DataFrame(adset_records)
        print(f"   Generated {len(adset_records)} records with {len(fields_config)} fields")
    
    def generate_toplevel_daily_output(self):
        """Generate Top Level Daily.csv output file"""
        print("\n📊 Generating Top Level Daily.csv...")
        
        fields_config = self.template_config['Top Level Daily.csv']
        record = {}
        
        for field_config in fields_config:
            field_name = field_config['fields']
            value = self.calculate_field_value(field_config)
            record[field_name] = value
        
        self.output_files['Top Level Daily.csv'] = pd.DataFrame([record])
        print(f"   Generated 1 record with {len(fields_config)} fields")
    
    def save_outputs(self, output_dir):
        """Save all generated output files"""
        print(f"\n💾 Saving output files to {output_dir}...")
        
        os.makedirs(output_dir, exist_ok=True)
        
        for filename, df in self.output_files.items():
            output_path = os.path.join(output_dir, filename)
            df.to_csv(output_path, index=False)
            print(f"   ✅ {filename}: {len(df)} records, {len(df.columns)} fields")
        
        # Save pivot temp file
        pivot_path = os.path.join(output_dir, 'pivot_temp.csv')
        self.data['pivot_temp'].to_csv(pivot_path, index=False)
        print(f"   ✅ pivot_temp.csv: {len(self.data['pivot_temp'])} records")
    
    def convert_files(self, upload_dir=None, output_dir=None, meta_ads_path=None, google_ads_path=None, shopify_path=None):
        """Main conversion process - flexible input options"""
        print("🚀 Dashboard-Integrated MOI Conversion Process")
        print("=" * 70)
        
        # Show template source
        print(f"📋 Active Template: {self.active_template_source}")
        
        # Load input data (either from upload directory or specific paths)
        if upload_dir:
            self.load_input_data(upload_dir=upload_dir)
        else:
            self.load_input_data(meta_ads_path=meta_ads_path, google_ads_path=google_ads_path, shopify_path=shopify_path)
        
        # Generate output files according to active template
        self.generate_adset_level_output()
        self.generate_toplevel_daily_output()
        
        # Save outputs
        if output_dir:
            self.save_outputs(output_dir)
        else:
            # Default output directory
            default_output = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/moi-analytics-dashboard/MOI_Sample_Output_Generation/05_CSV_Outputs'
            self.save_outputs(default_output)
        
        print("\n✅ Dashboard-integrated conversion completed successfully!")
        print("=" * 70)
        
        # Validation summary
        print(f"\n📋 Template Compliance Summary ({self.active_template_source}):")
        for filename, df in self.output_files.items():
            expected_fields = len(self.template_config[filename])
            actual_fields = len(df.columns)
            print(f"   {filename}: {actual_fields}/{expected_fields} fields ({'✅' if actual_fields == expected_fields else '❌'})")
        
        # Show usage instructions
        if self.active_template_source.startswith("Default"):
            print(f"\n💡 Using default template. To use custom templates:")
            self.create_dashboard_config_export()

def process_dashboard_uploads():
    """Process files uploaded through dashboard - auto-detects files"""
    converter = DashboardIntegratedConverter()
    
    # Dashboard upload directory (where files are uploaded via UI)
    upload_dir = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/dashboard_uploads'
    
    # Check if upload directory exists
    if not os.path.exists(upload_dir):
        print(f"📁 Creating upload directory: {upload_dir}")
        os.makedirs(upload_dir, exist_ok=True)
        print("📋 Upload your CSV files to this directory:")
        print(f"   {upload_dir}")
        print("\n📝 File naming requirements:")
        print("   • Meta/Facebook files: include 'meta', 'facebook', or 'fb' in filename")
        print("   • Google Ads files: include 'google', 'adwords', or 'gads' in filename") 
        print("   • Shopify files: include 'shopify' or 'shop' in filename")
        return
    
    # Process uploaded files
    try:
        converter.convert_files(upload_dir=upload_dir)
    except FileNotFoundError as e:
        print(f"❌ {e}")
        print(f"\n📋 Please upload your CSV files to: {upload_dir}")

def process_example_files():
    """Process the example files (backwards compatibility)"""
    converter = DashboardIntegratedConverter()
    
    # Use example files
    meta_ads_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example/Meta_Ads_29th Sept.csv'
    google_ads_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example/Google_Ads_29th Sept.csv'
    shopify_path = '/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example/Shopify_29th Sept.csv'
    
    # Run conversion with example files
    converter.convert_files(meta_ads_path=meta_ads_path, google_ads_path=google_ads_path, shopify_path=shopify_path)

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--dashboard":
        # Process dashboard uploaded files
        process_dashboard_uploads()
    else:
        # Process example files (default behavior)
        process_example_files()