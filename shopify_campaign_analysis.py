#!/usr/bin/env python3
"""
Shopify Campaign Performance Analysis for vibewithmoi.com
Executive Dashboard Analysis
"""

import pandas as pd
import numpy as np
from collections import defaultdict
import re

def load_and_clean_data(file_path):
    """Load and clean the Shopify export data"""
    try:
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Filter out rows with empty campaign names or template placeholders
        df = df[df['Utm campaign'].notna()]
        df = df[~df['Utm campaign'].str.contains('{{campaign.name}}', na=False)]
        df = df[df['Utm campaign'] != '']
        
        # Convert numeric columns
        numeric_cols = ['Online store visitors', 'Sessions', 'Sessions with cart additions', 
                       'Sessions that reached checkout', 'Average session duration', 'Pageviews']
        
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
        
        return df
    
    except Exception as e:
        print(f"Error loading data: {e}")
        return None

def aggregate_campaign_data(df):
    """Aggregate data by campaign"""
    
    # Group by campaign name and aggregate metrics
    campaign_summary = df.groupby('Utm campaign').agg({
        'Online store visitors': 'sum',
        'Sessions': 'sum',
        'Sessions with cart additions': 'sum',
        'Sessions that reached checkout': 'sum',
        'Average session duration': 'mean',
        'Pageviews': 'sum'
    }).reset_index()
    
    # Calculate derived metrics
    campaign_summary['Cart Addition Rate'] = (
        campaign_summary['Sessions with cart additions'] / 
        campaign_summary['Sessions'].replace(0, np.nan)
    ) * 100
    
    campaign_summary['Checkout Rate'] = (
        campaign_summary['Sessions that reached checkout'] / 
        campaign_summary['Sessions'].replace(0, np.nan)
    ) * 100
    
    campaign_summary['Pages per Session'] = (
        campaign_summary['Pageviews'] / 
        campaign_summary['Sessions'].replace(0, np.nan)
    )
    
    # Fill NaN values with 0
    campaign_summary = campaign_summary.fillna(0)
    
    # Sort by total sessions (proxy for orders/performance)
    campaign_summary = campaign_summary.sort_values('Sessions', ascending=False)
    
    return campaign_summary

def identify_campaign_types(campaign_name):
    """Categorize campaigns by type"""
    campaign_name = campaign_name.lower()
    
    if 'pmax' in campaign_name:
        return 'Google Performance Max'
    elif 'brand' in campaign_name:
        return 'Brand Search'
    elif 'tof' in campaign_name:
        return 'Top of Funnel'
    elif 'bof' in campaign_name or 'dpa' in campaign_name:
        return 'Bottom of Funnel / Retargeting'
    elif 'mof' in campaign_name:
        return 'Middle of Funnel'
    else:
        return 'Other'

def create_executive_dashboard(campaign_data):
    """Create executive dashboard analysis"""
    
    # Add campaign types
    campaign_data['Campaign Type'] = campaign_data['Utm campaign'].apply(identify_campaign_types)
    
    # Calculate total metrics
    total_campaigns = len(campaign_data)
    total_sessions = campaign_data['Sessions'].sum()
    total_visitors = campaign_data['Online store visitors'].sum()
    total_checkouts = campaign_data['Sessions that reached checkout'].sum()
    
    # Top 5 and Bottom 5 performers
    top_5 = campaign_data.head(5).copy()
    bottom_5 = campaign_data.tail(5).copy()
    
    # Performance metrics for analysis
    avg_cart_rate = campaign_data['Cart Addition Rate'].mean()
    avg_checkout_rate = campaign_data['Checkout Rate'].mean()
    
    return {
        'summary': {
            'total_campaigns': total_campaigns,
            'total_sessions': total_sessions,
            'total_visitors': total_visitors,
            'total_checkouts': total_checkouts,
            'avg_cart_rate': avg_cart_rate,
            'avg_checkout_rate': avg_checkout_rate
        },
        'top_performers': top_5,
        'bottom_performers': bottom_5,
        'campaign_data': campaign_data
    }

def format_executive_report(dashboard_data):
    """Format the executive report"""
    
    summary = dashboard_data['summary']
    top_5 = dashboard_data['top_performers']
    bottom_5 = dashboard_data['bottom_performers']
    
    print("=" * 80)
    print("SHOPIFY CAMPAIGN PERFORMANCE ANALYSIS - EXECUTIVE DASHBOARD")
    print("vibewithmoi.com High-Ticket E-commerce Analysis")
    print("=" * 80)
    
    print("\n📊 CAMPAIGN COUNT ANALYSIS")
    print("-" * 40)
    print(f"Total Unique Campaigns: {summary['total_campaigns']}")
    print(f"Total Sessions: {summary['total_sessions']:,}")
    print(f"Total Visitors: {summary['total_visitors']:,}")
    print(f"Total Checkouts: {summary['total_checkouts']:,}")
    print(f"Average Cart Addition Rate: {summary['avg_cart_rate']:.2f}%")
    print(f"Average Checkout Rate: {summary['avg_checkout_rate']:.2f}%")
    
    print(f"\nCampaign Identification Method: UTM Parameters")
    print(f"Performance Ranking: Based on Total Sessions (proxy for orders)")
    
    print("\n🏆 TOP 5 PERFORMING CAMPAIGNS")
    print("-" * 60)
    print(f"{'Rank':<4} {'Campaign':<35} {'Sessions':<10} {'Checkouts':<10} {'Cart Rate %':<12}")
    print("-" * 60)
    
    for idx, row in top_5.iterrows():
        rank = top_5.index.get_loc(idx) + 1
        campaign = row['Utm campaign'][:34]
        sessions = int(row['Sessions'])
        checkouts = int(row['Sessions that reached checkout'])
        cart_rate = row['Cart Addition Rate']
        print(f"{rank:<4} {campaign:<35} {sessions:<10} {checkouts:<10} {cart_rate:<12.1f}")
    
    print("\n🔻 BOTTOM 5 PERFORMING CAMPAIGNS")
    print("-" * 60)
    print(f"{'Rank':<4} {'Campaign':<35} {'Sessions':<10} {'Checkouts':<10} {'Issues':<15}")
    print("-" * 60)
    
    bottom_5_reversed = bottom_5.iloc[::-1]  # Reverse to show worst first
    for idx, row in bottom_5_reversed.iterrows():
        rank = len(dashboard_data['campaign_data']) - bottom_5_reversed.index.get_loc(idx)
        campaign = row['Utm campaign'][:34]
        sessions = int(row['Sessions'])
        checkouts = int(row['Sessions that reached checkout'])
        
        # Identify issues
        issues = []
        if row['Sessions'] <= 1:
            issues.append("Low Traffic")
        if row['Cart Addition Rate'] == 0:
            issues.append("No Conversions")
        if row['Average session duration'] < 30:
            issues.append("Poor Engagement")
        
        issues_str = ", ".join(issues) if issues else "Low Performance"
        
        print(f"{rank:<4} {campaign:<35} {sessions:<10} {checkouts:<10} {issues_str:<15}")
    
    # Campaign type breakdown
    campaign_types = dashboard_data['campaign_data']['Campaign Type'].value_counts()
    print(f"\n📈 CAMPAIGN TYPE BREAKDOWN")
    print("-" * 40)
    for campaign_type, count in campaign_types.items():
        print(f"{campaign_type}: {count} campaigns")
    
    print("\n💡 EXECUTIVE RECOMMENDATIONS")
    print("-" * 40)
    
    # Analyze top performers for insights
    top_campaign_types = top_5['Campaign Type'].value_counts()
    winning_type = top_campaign_types.index[0] if len(top_campaign_types) > 0 else "Unknown"
    
    print(f"1. IMMEDIATE ACTION (Next 7 Days):")
    print(f"   • Scale budget for '{winning_type}' campaigns - showing strongest performance")
    print(f"   • Pause bottom 5 campaigns with <2 sessions to reallocate budget")
    
    print(f"\n2. OPTIMIZATION PRIORITIES (Next 30 Days):")
    print(f"   • Focus on campaigns with >0% cart addition rates but low checkouts")
    print(f"   • Test new ad creative for campaigns with high sessions but low engagement")
    
    print(f"\n3. STRATEGIC INSIGHTS:")
    avg_top_cart_rate = top_5['Cart Addition Rate'].mean()
    avg_bottom_cart_rate = bottom_5['Cart Addition Rate'].mean()
    print(f"   • Top performers achieve {avg_top_cart_rate:.1f}% cart rate vs {avg_bottom_cart_rate:.1f}% for bottom")
    print(f"   • High-ticket jewelry requires sustained engagement (session duration critical)")
    
    print("\n" + "=" * 80)

def main():
    """Main execution function"""
    
    # File path
    file_path = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/01_Original_Data/sheet_3_Shopify_Exports.csv"
    
    # Load and process data
    print("Loading Shopify export data...")
    df = load_and_clean_data(file_path)
    
    if df is None:
        print("Failed to load data. Please check the file path.")
        return
    
    print(f"Loaded {len(df)} records from Shopify exports")
    
    # Aggregate campaign data
    print("Aggregating campaign performance data...")
    campaign_data = aggregate_campaign_data(df)
    
    # Create executive dashboard
    dashboard = create_executive_dashboard(campaign_data)
    
    # Format and display report
    format_executive_report(dashboard)
    
    # Save detailed analysis to CSV
    output_file = "/Users/shivangpatel/Documents/GitHub/crtx.in/shopify_campaign_analysis_results.csv"
    dashboard['campaign_data'].to_csv(output_file, index=False)
    print(f"\nDetailed analysis saved to: {output_file}")

if __name__ == "__main__":
    main()