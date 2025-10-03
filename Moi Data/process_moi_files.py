#!/usr/bin/env python3
"""
MOI File Conversion using Default Logic Template
Processes input files using the validated conversion logic
"""

import csv
import json
import pandas as pd
from datetime import datetime
import os
from collections import defaultdict

class MOIDataProcessor:
    """Processes MOI data using the default logic template"""
    
    def __init__(self, input_dir, output_dir):
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.shopify_data = []
        self.meta_data = []
        self.google_data = []
        self.pivot_data = []
        self.errors = []
        
        # Ensure output directory exists
        os.makedirs(output_dir, exist_ok=True)
    
    def load_input_files(self):
        """Load all input CSV files"""
        try:
            # Load Shopify data
            shopify_path = os.path.join(self.input_dir, "Shopify_29th Sept.csv")
            self.shopify_data = pd.read_csv(shopify_path)
            print(f"Loaded {len(self.shopify_data)} Shopify records")
            
            # Load Meta data
            meta_path = os.path.join(self.input_dir, "Meta_Ads_29th Sept.csv")
            self.meta_data = pd.read_csv(meta_path)
            print(f"Loaded {len(self.meta_data)} Meta Ads records")
            
            # Load Google data
            google_path = os.path.join(self.input_dir, "Google_Ads_29th Sept.csv")
            # Skip the first 2 header rows for Google Ads format
            self.google_data = pd.read_csv(google_path, skiprows=2)
            print(f"Loaded {len(self.google_data)} Google Ads records")
            
            return True
            
        except Exception as e:
            self.errors.append(f"Error loading input files: {str(e)}")
            return False
    
    def create_pivot_data(self):
        """Create pivot_temp.csv - intermediate lookup table"""
        try:
            # Group Shopify data by Campaign and AdSet (UTM Campaign and UTM Term)
            pivot_groups = defaultdict(lambda: {
                'campaign_name': '',
                'ad_set_name': '',
                'date': '2025-09-29',
                'users': 0,
                'sessions_cart_additions': 0,
                'sessions_reached_checkout': 0,
                'sessions_completed_checkout': 0,
                'average_session_duration': 0,
                'pageviews': 0
            })
            
            for _, row in self.shopify_data.iterrows():
                campaign = str(row.get('UTM campaign', '')).strip()
                term = str(row.get('UTM term', '')).strip()
                
                if campaign and term:  # Only process rows with both campaign and term
                    key = (campaign, term)
                    
                    pivot_groups[key]['campaign_name'] = campaign
                    pivot_groups[key]['ad_set_name'] = term
                    pivot_groups[key]['users'] += int(row.get('Online store visitors', 0))
                    pivot_groups[key]['sessions_cart_additions'] += int(row.get('Sessions with cart additions', 0))
                    pivot_groups[key]['sessions_reached_checkout'] += int(row.get('Sessions that reached checkout', 0))
                    pivot_groups[key]['sessions_completed_checkout'] += int(row.get('Sessions that completed checkout', 0))
                    pivot_groups[key]['average_session_duration'] += float(row.get('Average session duration', 0))
                    pivot_groups[key]['pageviews'] += int(row.get('Pageviews', 0))
            
            # Convert to list format
            self.pivot_data = list(pivot_groups.values())
            
            # Save pivot_temp.csv
            pivot_path = os.path.join(self.output_dir, "pivot_temp.csv")
            pivot_df = pd.DataFrame(self.pivot_data)
            pivot_df.to_csv(pivot_path, index=False)
            
            print(f"Created pivot_temp.csv with {len(self.pivot_data)} records")
            return True
            
        except Exception as e:
            self.errors.append(f"Error creating pivot data: {str(e)}")
            return False
    
    def create_adset_level_output(self):
        """Create Ad Set Level.csv output file"""
        try:
            adset_records = []
            
            for pivot_row in self.pivot_data:
                campaign_name = pivot_row['campaign_name']
                ad_set_name = pivot_row['ad_set_name']
                
                # Find matching Meta data for this campaign+adset
                meta_match = None
                for _, meta_row in self.meta_data.iterrows():
                    if (str(meta_row.get('Campaign name', '')).strip() == campaign_name and 
                        str(meta_row.get('Ad set name', '')).strip() == ad_set_name):
                        meta_match = meta_row
                        break
                
                # Create Ad Set Level record
                record = {
                    'Date': '2025-09-29',
                    'Campaign name': campaign_name,
                    'Ad Set Name': ad_set_name,
                    'Ad Set Delivery': meta_match.get('Ad set delivery', '') if meta_match is not None else '',
                    'Ad Set Level Spent': float(meta_match.get('Amount spent (INR)', 0)) if meta_match is not None else 0,
                    'Ad Set Level Users': pivot_row['users'],
                    'Cost per user': 0,  # Will calculate after
                    'Ad Set Level  ATC': pivot_row['sessions_cart_additions'],
                    'Ad Set Level  Reached Checkout': pivot_row['sessions_reached_checkout'],
                    'Ad Set Level Conversions': pivot_row['sessions_completed_checkout'],
                    'Ad Set Level  Average session duration': pivot_row['average_session_duration'],
                    'Ad Set Level  Users with Session above 1 min': 0,  # Simplified for this example
                    'Ad Set Level Cost per 1 min user': 0,
                    'Ad Set Level 1min user/ total users (%)': 0,
                    'Ad Set Level  ATC with session duration above 1 min': 0,
                    'Ad Set Level Reached Checkout with session duration above 1 min': 0,
                    'Ad Set Level Users with Above 5 page views and above 1 min': 0
                }
                
                # Calculate Cost per user
                if record['Ad Set Level Users'] > 0:
                    record['Cost per user'] = record['Ad Set Level Spent'] / record['Ad Set Level Users']
                
                adset_records.append(record)
            
            # Save Ad Set Level output
            adset_path = os.path.join(self.output_dir, "Adset Level Matrices.csv")
            adset_df = pd.DataFrame(adset_records)
            adset_df.to_csv(adset_path, index=False)
            
            print(f"Created Adset Level Matrices.csv with {len(adset_records)} records")
            return True
            
        except Exception as e:
            self.errors.append(f"Error creating Ad Set Level output: {str(e)}")
            return False
    
    def create_toplevel_daily_output(self):
        """Create Top Level Daily.csv output file"""
        try:
            # Aggregate all data for top-level metrics
            total_meta_spend = self.meta_data['Amount spent (INR)'].sum()
            avg_meta_ctr = self.meta_data['CTR (link click-through rate)'].mean()
            avg_meta_cpm = self.meta_data['CPM (cost per 1,000 impressions)'].mean()
            
            total_google_spend = self.google_data['Cost'].sum()
            avg_google_ctr = self.google_data['CTR'].str.rstrip('%').astype(float).mean()
            avg_google_cpm = self.google_data['Avg. CPC'].mean()  # Using CPC as proxy for CPM
            
            total_users = self.shopify_data['Online store visitors'].sum()
            total_atc = self.shopify_data['Sessions with cart additions'].sum()
            total_reached_checkout = self.shopify_data['Sessions that reached checkout'].sum()
            avg_session_duration = self.shopify_data['Average session duration'].mean()
            
            # Create top-level record
            toplevel_record = {
                'Meta Spend': total_meta_spend,
                'Meta CTR': f"{avg_meta_ctr:.2f}%",
                'Meta CPM': avg_meta_cpm,
                'Google Spend': total_google_spend,
                'Google CTR': f"{avg_google_ctr:.2f}%",
                'Google CPM': avg_google_cpm,
                'Total Users': total_users,
                'Total  ATC': total_atc,
                'Total  Reached Checkout': total_reached_checkout,
                'Total Abandoned Checkout': 0,  # Manual field
                'Session Duration': avg_session_duration,
                'Users with Session above 1 min': 0,  # Simplified
                'Users with Above 5 page views and above 1 min': 0,  # Simplified
                'ATC with session duration above 1 min': 0,  # Simplified
                'Reached Checkout with session duration above 1 min': 0  # Simplified
            }
            
            # Save Top Level Daily output
            toplevel_path = os.path.join(self.output_dir, "Top Level Daily Metrics_Complete.csv")
            toplevel_df = pd.DataFrame([toplevel_record])
            toplevel_df.to_csv(toplevel_path, index=False)
            
            print(f"Created Top Level Daily Metrics_Complete.csv with 1 record")
            return True
            
        except Exception as e:
            self.errors.append(f"Error creating Top Level Daily output: {str(e)}")
            return False
    
    def process_all(self):
        """Execute complete conversion process"""
        print("Starting MOI file conversion process...")
        
        # Step 1: Load input files
        if not self.load_input_files():
            return False
        
        # Step 2: Create pivot data
        if not self.create_pivot_data():
            return False
        
        # Step 3: Create Ad Set Level output
        if not self.create_adset_level_output():
            return False
        
        # Step 4: Create Top Level Daily output
        if not self.create_toplevel_daily_output():
            return False
        
        if self.errors:
            print("Process completed with errors:")
            for error in self.errors:
                print(f"  - {error}")
            return False
        else:
            print("✅ MOI file conversion completed successfully!")
            print("Generated files:")
            print("  - pivot_temp.csv")
            print("  - Adset Level Matrices.csv") 
            print("  - Top Level Daily Metrics_Complete.csv")
            return True

if __name__ == "__main__":
    # Set up paths
    input_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Input Example"
    output_dir = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/MOI Original Data/Output Example"
    
    # Create processor and run
    processor = MOIDataProcessor(input_dir, output_dir)
    success = processor.process_all()
    
    if not success:
        print("❌ Process failed. Check errors above.")
        exit(1)
    else:
        print("🎉 All output files generated successfully!")