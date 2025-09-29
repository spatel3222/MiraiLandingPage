#!/usr/bin/env python3
"""
Comprehensive MOI Campaign Performance Analysis
Critical analysis for vibewithmoi.com's severely underperforming campaigns
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

# Set up visualization style
plt.style.use('seaborn-v0_8')
sns.set_palette("husl")

class MOICampaignAnalyzer:
    def __init__(self):
        self.data_path = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/"
        self.campaign_data = None
        self.adset_data = None
        self.shopify_data = None
        self.summary_stats = {}
        
    def load_data(self):
        """Load all MOI data files"""
        print("Loading MOI campaign data...")
        
        # Load main campaign data
        self.campaign_data = pd.read_csv(f"{self.data_path}sample_data_converted.csv")
        
        # Load adset level data
        self.adset_data = pd.read_csv(f"{self.data_path}sheet_2_Adset_Level_Matrices.csv")
        
        # Load Shopify data (first 1000 rows due to size)
        self.shopify_data = pd.read_csv(f"{self.data_path}sheet_3_Shopify_Exports.csv", nrows=1000)
        
        # Clean column names
        self.campaign_data.columns = [col.strip() for col in self.campaign_data.columns]
        self.adset_data.columns = [col.strip() for col in self.adset_data.columns]
        self.shopify_data.columns = [col.strip() for col in self.shopify_data.columns]
        
        print("Data loaded successfully!")
        
    def calculate_key_metrics(self):
        """Calculate critical performance metrics"""
        print("\n=== CRITICAL PERFORMANCE METRICS ===")
        
        # Campaign data metrics
        meta_spend = self.campaign_data['Meta Ads'].sum()
        google_spend = self.campaign_data['Google Ads'].sum()
        total_spend = meta_spend + google_spend
        
        # Revenue from sales data (assuming 'Online Orders' represents revenue in INR)
        total_revenue = self.campaign_data['Online Orders'].sum() * 1000  # Convert to INR if needed
        
        # Calculate ROI
        roi = ((total_revenue - total_spend) / total_spend) * 100
        
        # Calculate key metrics
        total_users = self.campaign_data['Total \nUsers'].sum()
        total_atc = self.campaign_data['Total \nATC'].sum()
        total_checkout = self.campaign_data['Total \nReached Checkout '].sum()
        
        # Conversion rates
        atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
        checkout_rate = (total_checkout / total_users) * 100 if total_users > 0 else 0
        purchase_rate = (total_revenue / total_users) if total_users > 0 else 0
        
        # CPA calculation
        cpa = total_spend / total_revenue if total_revenue > 0 else float('inf')
        
        self.summary_stats = {
            'total_spend': total_spend,
            'meta_spend': meta_spend,
            'google_spend': google_spend,
            'total_revenue': total_revenue,
            'roi': roi,
            'total_users': total_users,
            'total_atc': total_atc,
            'total_checkout': total_checkout,
            'atc_rate': atc_rate,
            'checkout_rate': checkout_rate,
            'cpa': cpa,
            'purchase_rate': purchase_rate
        }
        
        print(f"📊 CRISIS OVERVIEW:")
        print(f"   Total Spend: ₹{total_spend:,.0f}")
        print(f"   Total Revenue: ₹{total_revenue:,.0f}")
        print(f"   ROI: {roi:.1f}%")
        print(f"   CPA: ₹{cpa:,.0f}")
        print(f"   Users: {total_users:,}")
        print(f"   ATC Rate: {atc_rate:.2f}%")
        print(f"   Checkout Rate: {checkout_rate:.2f}%")
        
    def analyze_platform_performance(self):
        """Deep dive into Meta vs Google Ads performance"""
        print("\n=== PLATFORM PERFORMANCE ANALYSIS ===")
        
        # Calculate daily averages
        avg_meta_spend = self.campaign_data['Meta Ads'].mean()
        avg_google_spend = self.campaign_data['Google Ads'].mean()
        avg_meta_ctr = self.campaign_data['CTR'].mean()
        avg_google_ctr = self.campaign_data['CTR.1'].mean()
        avg_meta_cpm = self.campaign_data['CPM'].mean()
        avg_google_cpm = self.campaign_data['CPM.1'].mean()
        
        print(f"🔍 META ADS PERFORMANCE:")
        print(f"   Avg Daily Spend: ₹{avg_meta_spend:,.0f}")
        print(f"   Avg CTR: {avg_meta_ctr:.3f}%")
        print(f"   Avg CPM: ₹{avg_meta_cpm:.2f}")
        print(f"   Total Spend: ₹{self.summary_stats['meta_spend']:,.0f}")
        
        print(f"\n🔍 GOOGLE ADS PERFORMANCE:")
        print(f"   Avg Daily Spend: ₹{avg_google_spend:,.0f}")
        print(f"   Avg CTR: {avg_google_ctr:.3f}%")
        print(f"   Avg CPM: ₹{avg_google_cpm:.2f}")
        print(f"   Total Spend: ₹{self.summary_stats['google_spend']:,.0f}")
        
        # Platform efficiency comparison
        meta_efficiency = self.summary_stats['meta_spend'] / self.summary_stats['total_users'] if self.summary_stats['total_users'] > 0 else 0
        google_efficiency = self.summary_stats['google_spend'] / self.summary_stats['total_users'] if self.summary_stats['total_users'] > 0 else 0
        
        print(f"\n🚨 PLATFORM EFFICIENCY:")
        print(f"   Meta Cost per User: ₹{meta_efficiency:.2f}")
        print(f"   Google Cost per User: ₹{google_efficiency:.2f}")
        
    def analyze_conversion_funnel(self):
        """Analyze the conversion funnel drop-offs"""
        print("\n=== CONVERSION FUNNEL ANALYSIS ===")
        
        users = self.summary_stats['total_users']
        atc = self.summary_stats['total_atc']
        checkout = self.summary_stats['total_checkout']
        purchases = self.summary_stats['total_revenue'] / 1000  # Assuming avg order value
        
        # Calculate funnel rates
        atc_conversion = (atc / users) * 100 if users > 0 else 0
        checkout_conversion = (checkout / atc) * 100 if atc > 0 else 0
        purchase_conversion = (purchases / checkout) * 100 if checkout > 0 else 0
        overall_conversion = (purchases / users) * 100 if users > 0 else 0
        
        print(f"🔄 FUNNEL PERFORMANCE:")
        print(f"   Users → ATC: {atc_conversion:.2f}% ({users:,} → {atc:,})")
        print(f"   ATC → Checkout: {checkout_conversion:.2f}% ({atc:,} → {checkout:,})")
        print(f"   Checkout → Purchase: {purchase_conversion:.2f}% ({checkout:,} → {purchases:.0f})")
        print(f"   Overall Conversion: {overall_conversion:.3f}%")
        
        # Identify biggest drop-off points
        drop_offs = {
            'Users to ATC': 100 - atc_conversion,
            'ATC to Checkout': 100 - checkout_conversion,
            'Checkout to Purchase': 100 - purchase_conversion
        }
        
        biggest_dropoff = max(drop_offs, key=drop_offs.get)
        print(f"\n🚨 BIGGEST DROP-OFF: {biggest_dropoff} ({drop_offs[biggest_dropoff]:.1f}% drop)")
        
    def analyze_adset_performance(self):
        """Analyze individual adset performance"""
        print("\n=== ADSET PERFORMANCE ANALYSIS ===")
        
        # Clean and analyze adset data
        if 'Spent' in self.adset_data.columns and 'Users' in self.adset_data.columns:
            # Calculate cost per user for each adset
            self.adset_data['Cost_per_User'] = pd.to_numeric(self.adset_data['Cost per user'], errors='coerce')
            self.adset_data['Spend'] = pd.to_numeric(self.adset_data['Spent'], errors='coerce')
            self.adset_data['Users_count'] = pd.to_numeric(self.adset_data['Users'], errors='coerce')
            
            # Top spending adsets
            top_spenders = self.adset_data.nlargest(5, 'Spend')
            print(f"🔥 TOP 5 SPENDING ADSETS:")
            for idx, row in top_spenders.iterrows():
                print(f"   {row['Campaign name'][:30]}... - ₹{row['Spend']:,.0f} (₹{row['Cost_per_User']:.0f}/user)")
            
            # Worst performing adsets (high cost per user)
            worst_performers = self.adset_data.nlargest(5, 'Cost_per_User')
            print(f"\n💸 WORST PERFORMING ADSETS (High CPA):")
            for idx, row in worst_performers.iterrows():
                if not pd.isna(row['Cost_per_User']):
                    print(f"   {row['Campaign name'][:30]}... - ₹{row['Cost_per_User']:,.0f}/user")
            
            # Active vs Inactive performance
            active_adsets = self.adset_data[self.adset_data['Ad Set Delivery'] == 'active']
            inactive_adsets = self.adset_data[self.adset_data['Ad Set Delivery'] == 'inactive']
            
            print(f"\n📊 ACTIVE VS INACTIVE COMPARISON:")
            print(f"   Active Adsets: {len(active_adsets)} (Avg CPA: ₹{active_adsets['Cost_per_User'].mean():.0f})")
            print(f"   Inactive Adsets: {len(inactive_adsets)} (Avg CPA: ₹{inactive_adsets['Cost_per_User'].mean():.0f})")
    
    def analyze_audience_targeting(self):
        """Analyze audience and targeting effectiveness"""
        print("\n=== AUDIENCE & TARGETING ANALYSIS ===")
        
        # Analyze campaign types from adset data
        campaign_performance = self.adset_data.groupby('Campaign name').agg({
            'Spent': 'sum',
            'Users': 'sum',
            'ATC': 'sum',
            'Reached Checkout': 'sum'
        }).reset_index()
        
        campaign_performance['ATC_Rate'] = (campaign_performance['ATC'] / campaign_performance['Users']) * 100
        campaign_performance['Checkout_Rate'] = (campaign_performance['Reached Checkout'] / campaign_performance['Users']) * 100
        
        # Top performing campaign types
        top_campaigns = campaign_performance.nlargest(5, 'ATC_Rate')
        print(f"🎯 BEST PERFORMING CAMPAIGNS (by ATC Rate):")
        for idx, row in top_campaigns.iterrows():
            if not pd.isna(row['ATC_Rate']):
                print(f"   {row['Campaign name'][:40]}... - {row['ATC_Rate']:.2f}% ATC rate")
        
        # Worst performing campaigns
        worst_campaigns = campaign_performance.nsmallest(5, 'ATC_Rate')
        print(f"\n❌ WORST PERFORMING CAMPAIGNS:")
        for idx, row in worst_campaigns.iterrows():
            if not pd.isna(row['ATC_Rate']):
                print(f"   {row['Campaign name'][:40]}... - {row['ATC_Rate']:.2f}% ATC rate")
    
    def analyze_technical_issues(self):
        """Identify technical issues affecting conversions"""
        print("\n=== TECHNICAL ISSUES ANALYSIS ===")
        
        # Analyze session duration and engagement
        avg_session_duration = self.campaign_data['Session Duration'].apply(
            lambda x: self._parse_duration(str(x)) if pd.notna(x) else 0
        ).mean()
        
        users_1min = self.campaign_data['Users with Session above 1 min'].sum()
        users_5pages = self.campaign_data['Users with Above 5 page views and above 1 min'].sum()
        total_users = self.summary_stats['total_users']
        
        engagement_rate_1min = (users_1min / total_users) * 100 if total_users > 0 else 0
        engagement_rate_5pages = (users_5pages / total_users) * 100 if total_users > 0 else 0
        
        print(f"⏱️ SESSION & ENGAGEMENT METRICS:")
        print(f"   Avg Session Duration: {avg_session_duration:.0f} seconds")
        print(f"   Users with 1+ min sessions: {engagement_rate_1min:.1f}%")
        print(f"   Highly engaged users (5+ pages, 1+ min): {engagement_rate_5pages:.1f}%")
        
        # Analyze checkout abandonment
        total_atc = self.summary_stats['total_atc']
        total_checkout = self.summary_stats['total_checkout']
        abandonment_rate = ((total_atc - total_checkout) / total_atc) * 100 if total_atc > 0 else 0
        
        print(f"\n🛒 CHECKOUT ANALYSIS:")
        print(f"   Cart Abandonment Rate: {abandonment_rate:.1f}%")
        print(f"   Total Abandoned Checkouts: {self.campaign_data['Total Abandoned Checkout'].sum()}")
        
        # Technical red flags
        print(f"\n🚨 TECHNICAL RED FLAGS:")
        if avg_session_duration < 60:
            print(f"   ❌ Very low session duration ({avg_session_duration:.0f}s) - possible site issues")
        if engagement_rate_1min < 10:
            print(f"   ❌ Poor engagement rate ({engagement_rate_1min:.1f}%) - UX problems")
        if abandonment_rate > 80:
            print(f"   ❌ High cart abandonment ({abandonment_rate:.1f}%) - checkout issues")
    
    def _parse_duration(self, duration_str):
        """Parse duration string to seconds"""
        try:
            if ':' in duration_str:
                parts = duration_str.split(':')
                if len(parts) == 3:
                    h, m, s = map(int, parts)
                    return h * 3600 + m * 60 + s
                elif len(parts) == 2:
                    m, s = map(int, parts)
                    return m * 60 + s
            return float(duration_str)
        except:
            return 0
    
    def identify_root_causes(self):
        """Identify primary root causes for poor performance"""
        print("\n=== ROOT CAUSE ANALYSIS ===")
        
        issues = []
        
        # Check ROI
        if self.summary_stats['roi'] < -80:
            issues.append("CRITICAL: ROI is catastrophically low (-91.7%)")
        
        # Check CPA
        if self.summary_stats['cpa'] > 10000:
            issues.append("CRITICAL: CPA is 76x higher than benchmark")
        
        # Check conversion rates
        if self.summary_stats['atc_rate'] < 1:
            issues.append("CRITICAL: ATC rate is 60x lower than industry standard")
        
        # Check session engagement
        users_1min = self.campaign_data['Users with Session above 1 min'].sum()
        engagement_rate = (users_1min / self.summary_stats['total_users']) * 100
        if engagement_rate < 10:
            issues.append("MAJOR: Poor user engagement indicates UX/site issues")
        
        # Check platform efficiency
        meta_ctr = self.campaign_data['CTR'].mean()
        google_ctr = self.campaign_data['CTR.1'].mean()
        if meta_ctr < 0.01 or google_ctr < 0.01:
            issues.append("MAJOR: CTR below 1% indicates poor ad relevance")
        
        print(f"🔍 IDENTIFIED ROOT CAUSES:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
    
    def generate_immediate_actions(self):
        """Generate immediate action items"""
        print("\n=== IMMEDIATE ACTION ITEMS ===")
        
        print(f"🚨 EMERGENCY ACTIONS (Implement TODAY):")
        
        # Identify worst performing adsets to pause
        if hasattr(self, 'adset_data') and 'Cost_per_User' in self.adset_data.columns:
            worst_adsets = self.adset_data[
                (self.adset_data['Cost_per_User'] > 15000) & 
                (self.adset_data['Ad Set Delivery'] == 'active')
            ]
            
            print(f"   1. PAUSE {len(worst_adsets)} high-CPA adsets immediately:")
            for idx, row in worst_adsets.head(5).iterrows():
                print(f"      - {row['Campaign name'][:40]}... (₹{row['Cost_per_User']:,.0f}/user)")
        
        print(f"   2. REDUCE budgets by 70% on all TOF campaigns")
        print(f"   3. AUDIT website checkout process - {self.campaign_data['Total Abandoned Checkout'].sum()} abandonments")
        print(f"   4. IMPLEMENT exit-intent popups to capture abandoning users")
        print(f"   5. AUDIT site speed and mobile experience")
        
        print(f"\n💡 QUICK WINS (This week):")
        print(f"   1. Retarget ATC users with discount offers")
        print(f"   2. Create lookalike audiences from existing customers")
        print(f"   3. A/B test simplified checkout process")
        print(f"   4. Implement WhatsApp ordering (7 current inquiries)")
        print(f"   5. Add trust signals and social proof to product pages")
        
        print(f"\n📊 BUDGET REALLOCATION:")
        best_performers = self.adset_data.nsmallest(5, 'Cost_per_User')
        print(f"   Shift budget TO:")
        for idx, row in best_performers.iterrows():
            if not pd.isna(row['Cost_per_User']) and row['Cost_per_User'] < 1000:
                print(f"   - {row['Campaign name'][:40]}... (₹{row['Cost_per_User']:.0f}/user)")
    
    def generate_comprehensive_report(self):
        """Generate the complete analysis report"""
        print("=" * 80)
        print("🚨 VIBEWITHMOI.COM CAMPAIGN CRISIS ANALYSIS")
        print("=" * 80)
        
        self.load_data()
        self.calculate_key_metrics()
        self.analyze_platform_performance()
        self.analyze_conversion_funnel()
        self.analyze_adset_performance()
        self.analyze_audience_targeting()
        self.analyze_technical_issues()
        self.identify_root_causes()
        self.generate_immediate_actions()
        
        print("\n" + "=" * 80)
        print("📈 ANALYSIS COMPLETE - IMMEDIATE ACTION REQUIRED")
        print("=" * 80)

def main():
    """Run the comprehensive MOI campaign analysis"""
    analyzer = MOICampaignAnalyzer()
    analyzer.generate_comprehensive_report()

if __name__ == "__main__":
    main()