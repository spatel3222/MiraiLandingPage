#!/usr/bin/env python3
"""
Generate Top Level Daily Metrics with realistic data
Including all required columns per MOI specifications
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_top_level_metrics(start_date="2025-09-10", days=30):
    """Generate realistic top-level daily metrics data"""
    
    dates = []
    data = []
    
    start = datetime.strptime(start_date, "%Y-%m-%d")
    
    for i in range(days):
        current_date = start + timedelta(days=i)
        date_str = current_date.strftime("%a, %b %d, %y")
        
        # Base metrics with realistic patterns
        is_weekend = current_date.weekday() in [5, 6]
        
        # Meta Ads metrics
        meta_spend = np.random.normal(39000, 3000) if not is_weekend else np.random.normal(37000, 2500)
        meta_ctr = np.random.normal(1.65, 0.2)
        meta_cpm = np.random.normal(62, 5)
        
        # Google Ads metrics  
        google_spend = np.random.normal(16000, 3000) if not is_weekend else np.random.normal(15000, 2000)
        google_ctr = np.random.normal(0.95, 0.15)
        google_cpm = np.random.normal(210, 30)
        
        # Shopify metrics
        total_users = int(np.random.normal(8500, 1000) if not is_weekend else np.random.normal(9000, 800))
        total_atc = int(np.random.normal(40, 10))
        total_reached_checkout = int(np.random.normal(15, 5))
        total_abandoned = max(0, int(np.random.normal(1.5, 0.8)))
        
        # Session metrics
        session_duration_seconds = int(np.random.normal(38, 4))
        session_duration = f"0:{session_duration_seconds:02d}:00"
        
        # Calculated metrics
        users_above_1min = int(total_users * np.random.uniform(0.09, 0.12))
        users_5pages_1min = int(users_above_1min * np.random.uniform(0.55, 0.7))
        atc_above_1min = int(total_atc * np.random.uniform(0.55, 0.75))
        checkout_above_1min = int(total_reached_checkout * np.random.uniform(0.5, 0.7))
        
        # Query metrics
        general_queries = int(np.random.normal(8, 3))
        open_queries = int(np.random.normal(8, 3))
        
        # Online orders
        online_orders = max(0, int(np.random.normal(1, 0.8)))
        
        row = {
            'Date': date_str,
            'Meta_Spend': f"{int(meta_spend):,}",
            'Meta_CTR': f"{meta_ctr:.2f}%",
            'Meta_CPM': f"{meta_cpm:.2f}",
            'Google_Spend': f"{int(google_spend):,}",
            'Google_CTR': f"{google_ctr:.2f}%", 
            'Google_CPM': f"{google_cpm:.2f}",
            'Total_Users': f"{total_users:,}",
            'Total_ATC': total_atc,
            'Total_Reached_Checkout': total_reached_checkout,
            'Total_Abandoned_Checkout': total_abandoned,
            'Session_Duration': session_duration,
            'Users_Session_Above_1min': users_above_1min,
            'Users_5pages_Above_1min': users_5pages_1min,
            'ATC_Session_Above_1min': atc_above_1min,
            'Checkout_Session_Above_1min': checkout_above_1min,
            'General_Queries': general_queries,
            'Open_Queries': open_queries,
            'Online_Orders': online_orders
        }
        
        data.append(row)
    
    return pd.DataFrame(data)

def save_with_headers(df, output_path):
    """Save DataFrame with MOI standard multi-row headers"""
    
    # Create the multi-row header structure
    with open(output_path, 'w') as f:
        # Row 1: Main categories
        f.write('Date,Meta Ads,,,Google Ads,,,Shopify,,,,,,,,,Sales Data,,Shopify\n')
        
        # Row 2: Data source indicators
        f.write('Note,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Derived,Derived,Derived,Derived,Direct,Direct,Direct\n')
        
        # Row 3: Column names (split for multi-line effect in some columns)
        f.write('Note,Spend,CTR,CPM,Spend,CTR,CPM,"Total \nUsers","Total \nATC","Total \nReached Checkout ",Total Abandoned Checkout,Session Duration,Users with Session above 1 min,Users with Above 5 page views and above 1 min,ATC with session duration above 1 min,Reached Checkout with session duration above 1 min,General Queries,Open Queries ,Online Orders\n')
        
        # Write the actual data
        for _, row in df.iterrows():
            values = [
                row['Date'],
                row['Meta_Spend'],
                row['Meta_CTR'],
                row['Meta_CPM'],
                row['Google_Spend'],
                row['Google_CTR'],
                row['Google_CPM'],
                row['Total_Users'],
                row['Total_ATC'],
                row['Total_Reached_Checkout'],
                row['Total_Abandoned_Checkout'],
                row['Session_Duration'],
                row['Users_Session_Above_1min'],
                row['Users_5pages_Above_1min'],
                row['ATC_Session_Above_1min'],
                row['Checkout_Session_Above_1min'],
                row['General_Queries'],
                row['Open_Queries'],
                row['Online_Orders']
            ]
            f.write(','.join(str(v) for v in values) + '\n')

if __name__ == "__main__":
    # Generate sample data
    df = generate_top_level_metrics(days=30)
    
    # Save to CSV with MOI headers
    output_path = "../05_CSV_Outputs/Top_Level_Daily_Metrics_Full.csv"
    save_with_headers(df, output_path)
    
    print(f"✅ Generated Top Level Daily Metrics with {len(df)} days of data")
    print(f"📁 Saved to: {output_path}")
    print("\nColumns included:")
    print("- All Meta Ads metrics (Spend, CTR, CPM)")
    print("- All Google Ads metrics (Spend, CTR, CPM)")
    print("- All Shopify metrics (Users, ATC, Checkout, Session data)")
    print("- All derived metrics (5 page views, session > 1 min combinations)")
    print("- Sales data (Queries and Orders)")