#!/usr/bin/env python3
"""
MOI ADSET-LEVEL ACTIONABLE ANALYSIS
Specific campaigns to pause, optimize, or scale
"""

import pandas as pd
import numpy as np

def analyze_adsets():
    """Detailed adset analysis with specific action items"""
    
    print("🎯 ADSET-LEVEL PERFORMANCE ANALYSIS")
    print("="*80)
    
    # Load adset data
    df = pd.read_csv("/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/sheet_2_Adset_Level_Matrices.csv")
    
    # Clean data
    df['Spent'] = pd.to_numeric(df['Spent'], errors='coerce').fillna(0)
    df['Users'] = pd.to_numeric(df['Users'], errors='coerce').fillna(0)
    df['ATC'] = pd.to_numeric(df['ATC'], errors='coerce').fillna(0)
    df['Reached Checkout'] = pd.to_numeric(df['Reached Checkout'], errors='coerce').fillna(0)
    df['Conversions'] = pd.to_numeric(df['Conversions'], errors='coerce').fillna(0)
    
    # Calculate key metrics
    df['CPA'] = np.where(df['Users'] > 0, df['Spent'] / df['Users'], np.inf)
    df['ATC_Rate'] = np.where(df['Users'] > 0, (df['ATC'] / df['Users']) * 100, 0)
    df['Checkout_Rate'] = np.where(df['ATC'] > 0, (df['Reached Checkout'] / df['ATC']) * 100, 0)
    df['Conversion_Rate'] = np.where(df['Users'] > 0, (df['Conversions'] / df['Users']) * 100, 0)
    
    print(f"📊 ADSET OVERVIEW:")
    print(f"   Total Adsets: {len(df)}")
    print(f"   Active Adsets: {len(df[df['Ad Set Delivery'] == 'active'])}")
    print(f"   Total Spend: ₹{df['Spent'].sum():,.0f}")
    print(f"   Total Users: {df['Users'].sum():,}")
    print(f"   Total ATC: {df['ATC'].sum()}")
    print(f"   Total Conversions: {df['Conversions'].sum()}")
    
    print(f"\n🚨 CAMPAIGNS TO PAUSE IMMEDIATELY:")
    print("="*60)
    
    # Identify worst performers to pause
    pause_criteria = (
        (df['Spent'] > 5000) & 
        (df['ATC'] == 0) & 
        (df['Ad Set Delivery'] == 'active')
    ) | (
        (df['CPA'] > 15000) & 
        (df['Ad Set Delivery'] == 'active')
    )
    
    pause_campaigns = df[pause_criteria].sort_values('Spent', ascending=False)
    
    if len(pause_campaigns) > 0:
        total_wasted_spend = pause_campaigns['Spent'].sum()
        print(f"💸 IMMEDIATE PAUSE - Wasting ₹{total_wasted_spend:,.0f}")
        for idx, row in pause_campaigns.head(10).iterrows():
            print(f"   🛑 {row['Campaign name'][:35]}...")
            print(f"      Spend: ₹{row['Spent']:,.0f} | Users: {row['Users']} | ATC: {row['ATC']} | CPA: ₹{row['CPA']:,.0f}")
    
    print(f"\n⚠️ CAMPAIGNS TO REDUCE BUDGET (High spend, low performance):")
    print("="*60)
    
    reduce_criteria = (
        (df['Spent'] > 3000) & 
        (df['ATC_Rate'] < 1) & 
        (df['Ad Set Delivery'] == 'active') & 
        (~pause_criteria)
    )
    
    reduce_campaigns = df[reduce_criteria].sort_values('Spent', ascending=False)
    
    if len(reduce_campaigns) > 0:
        for idx, row in reduce_campaigns.head(8).iterrows():
            print(f"   📉 {row['Campaign name'][:35]}...")
            print(f"      Spend: ₹{row['Spent']:,.0f} | ATC Rate: {row['ATC_Rate']:.2f}% | Reduce budget by 70%")
    
    print(f"\n✅ BEST PERFORMING CAMPAIGNS (Scale these):")
    print("="*60)
    
    # Find best performers
    best_performers = df[
        (df['ATC_Rate'] > 0.5) & 
        (df['Spent'] > 1000) & 
        (df['Ad Set Delivery'] == 'active')
    ].sort_values('ATC_Rate', ascending=False)
    
    if len(best_performers) > 0:
        for idx, row in best_performers.head(5).iterrows():
            print(f"   🚀 {row['Campaign name'][:35]}...")
            print(f"      Spend: ₹{row['Spent']:,.0f} | ATC Rate: {row['ATC_Rate']:.2f}% | CPA: ₹{row['CPA']:,.0f}")
            print(f"      Action: Increase budget by 50%")
    else:
        print("   ❌ No strong performers found - all campaigns need optimization")
    
    print(f"\n🎯 AUDIENCE ANALYSIS:")
    print("="*50)
    
    # Analyze by campaign type
    campaign_types = {}
    for idx, row in df.iterrows():
        campaign_name = row['Campaign name']
        if 'TOF' in campaign_name:
            campaign_type = 'TOF (Top of Funnel)'
        elif 'BOF' in campaign_name:
            campaign_type = 'BOF (Bottom of Funnel)'
        elif 'Bangalore' in campaign_name:
            campaign_type = 'Bangalore Geo'
        elif 'Delhi' in campaign_name:
            campaign_type = 'Delhi Geo'
        elif 'Mumbai' in campaign_name:
            campaign_type = 'Mumbai Geo'
        elif 'India' in campaign_name:
            campaign_type = 'India Broad'
        else:
            campaign_type = 'Other'
        
        if campaign_type not in campaign_types:
            campaign_types[campaign_type] = {'spend': 0, 'users': 0, 'atc': 0, 'conversions': 0}
        
        campaign_types[campaign_type]['spend'] += row['Spent']
        campaign_types[campaign_type]['users'] += row['Users']
        campaign_types[campaign_type]['atc'] += row['ATC']
        campaign_types[campaign_type]['conversions'] += row['Conversions']
    
    print("Campaign Type Performance:")
    for camp_type, metrics in campaign_types.items():
        if metrics['spend'] > 0:
            atc_rate = (metrics['atc'] / metrics['users']) * 100 if metrics['users'] > 0 else 0
            cpa = metrics['spend'] / metrics['users'] if metrics['users'] > 0 else 0
            print(f"   {camp_type}:")
            print(f"      Spend: ₹{metrics['spend']:,.0f} | ATC Rate: {atc_rate:.2f}% | CPA: ₹{cpa:.0f}")
    
    print(f"\n💡 SPECIFIC OPTIMIZATION RECOMMENDATIONS:")
    print("="*60)
    
    # Location-based analysis
    location_performance = {
        'Bangalore': df[df['Campaign name'].str.contains('Bangalore', na=False)],
        'Delhi': df[df['Campaign name'].str.contains('Delhi', na=False)],
        'Mumbai': df[df['Campaign name'].str.contains('Mumbai', na=False)],
        'India': df[df['Campaign name'].str.contains('India', na=False)]
    }
    
    best_location = None
    best_atc_rate = 0
    
    for location, loc_df in location_performance.items():
        if len(loc_df) > 0:
            total_users = loc_df['Users'].sum()
            total_atc = loc_df['ATC'].sum()
            atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
            
            if atc_rate > best_atc_rate:
                best_atc_rate = atc_rate
                best_location = location
    
    if best_location:
        print(f"🏆 BEST PERFORMING LOCATION: {best_location} ({best_atc_rate:.2f}% ATC rate)")
        print(f"   Action: Shift 60% of geo-targeting budget to {best_location}")
    
    # Creative analysis
    creative_analysis = {
        'IGi': df[df['Ad Set Name'].str.contains('IGi', na=False)],
        'TRLi': df[df['Ad Set Name'].str.contains('TRLi', na=False)],
        'LUXEi': df[df['Ad Set Name'].str.contains('LUXEi', na=False)],
        'CARTi': df[df['Ad Set Name'].str.contains('CARTi', na=False)]
    }
    
    print(f"\n🎨 CREATIVE PERFORMANCE:")
    for creative, creative_df in creative_analysis.items():
        if len(creative_df) > 0:
            total_spend = creative_df['Spent'].sum()
            total_users = creative_df['Users'].sum()
            total_atc = creative_df['ATC'].sum()
            atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
            
            if total_spend > 1000:
                print(f"   {creative}: ₹{total_spend:,.0f} spend | {atc_rate:.2f}% ATC rate")
    
    print(f"\n📋 IMMEDIATE ACTION CHECKLIST:")
    print("="*50)
    print(f"□ Pause {len(pause_campaigns)} worst performing adsets")
    print(f"□ Reduce budget on {len(reduce_campaigns)} underperforming adsets")
    print(f"□ Increase budget on {len(best_performers)} best performers")
    print(f"□ Focus geo-targeting on {best_location if best_location else 'top performing location'}")
    print(f"□ Test new creative formats")
    print(f"□ Implement retargeting for {df['ATC'].sum()} cart abandoners")
    print(f"□ Set up WhatsApp business integration")
    print(f"□ Audit website conversion tracking")
    
    # Daily action plan
    print(f"\n📅 72-HOUR ACTION PLAN:")
    print("="*50)
    print(f"Day 1 (Today):")
    print(f"   • Pause all adsets with >₹5k spend and 0 ATC")
    print(f"   • Reduce budgets by 70% on poor performers")
    print(f"   • Emergency technical audit")
    
    print(f"Day 2:")
    print(f"   • Launch retargeting campaigns")
    print(f"   • Test discount offers (15% off)")
    print(f"   • Optimize landing pages")
    
    print(f"Day 3:")
    print(f"   • Analyze new data")
    print(f"   • Scale winning campaigns")
    print(f"   • Launch new creative tests")
    
    print(f"\n🎯 SUCCESS METRICS TO TRACK DAILY:")
    print("="*50)
    print(f"   • Daily spend should be <₹15,000")
    print(f"   • ATC rate should improve to >1%")
    print(f"   • At least 1 conversion per day")
    print(f"   • CPA should decrease daily")
    print(f"   • ROI should improve by 10% weekly")

if __name__ == "__main__":
    analyze_adsets()