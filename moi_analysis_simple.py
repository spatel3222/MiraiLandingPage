#!/usr/bin/env python3
"""
Comprehensive MOI Campaign Performance Analysis - Simplified Version
Critical analysis for vibewithmoi.com's severely underperforming campaigns
"""

import pandas as pd
import numpy as np
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

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
        
        try:
            # Load main campaign data
            self.campaign_data = pd.read_csv(f"{self.data_path}sample_data_converted.csv")
            print(f"✓ Campaign data loaded: {len(self.campaign_data)} rows")
            
            # Load adset level data
            self.adset_data = pd.read_csv(f"{self.data_path}sheet_2_Adset_Level_Matrices.csv")
            print(f"✓ Adset data loaded: {len(self.adset_data)} rows")
            
            # Load Shopify data (first 1000 rows due to size)
            self.shopify_data = pd.read_csv(f"{self.data_path}sheet_3_Shopify_Exports.csv", nrows=500)
            print(f"✓ Shopify data loaded: {len(self.shopify_data)} rows")
            
            # Print column names for debugging
            print(f"\nCampaign columns: {list(self.campaign_data.columns)}")
            print(f"Adset columns: {list(self.adset_data.columns)}")
            
        except Exception as e:
            print(f"Error loading data: {e}")
            return False
        
        return True
        
    def calculate_key_metrics(self):
        """Calculate critical performance metrics"""
        print("\n" + "="*80)
        print("🚨 CRITICAL PERFORMANCE METRICS")
        print("="*80)
        
        try:
            # Get column names and clean them
            cols = list(self.campaign_data.columns)
            print(f"Available columns: {cols}")
            
            # Find the correct column names
            meta_col = 'Meta Ads' if 'Meta Ads' in cols else [col for col in cols if 'Meta' in str(col)][0] if any('Meta' in str(col) for col in cols) else cols[1]
            google_col = 'Google Ads' if 'Google Ads' in cols else [col for col in cols if 'Google' in str(col)][0] if any('Google' in str(col) for col in cols) else cols[4]
            
            print(f"Using Meta column: {meta_col}")
            print(f"Using Google column: {google_col}")
            
            # Calculate spend (convert to numeric, handle errors)
            meta_spend = pd.to_numeric(self.campaign_data[meta_col], errors='coerce').fillna(0).sum()
            google_spend = pd.to_numeric(self.campaign_data[google_col], errors='coerce').fillna(0).sum()
            total_spend = meta_spend + google_spend
            
            # Find revenue/orders column
            orders_col = [col for col in cols if 'Order' in str(col) or 'Revenue' in str(col)]
            if orders_col:
                orders_col = orders_col[0]
                total_orders = pd.to_numeric(self.campaign_data[orders_col], errors='coerce').fillna(0).sum()
            else:
                total_orders = 0
            
            # Estimate revenue (assuming ₹2,000 average order value for jewelry)
            estimated_revenue = total_orders * 2000
            
            # Calculate ROI
            roi = ((estimated_revenue - total_spend) / total_spend) * 100 if total_spend > 0 else -100
            
            # Find users column
            users_cols = [col for col in cols if 'User' in str(col)]
            if users_cols:
                users_col = users_cols[0]
                total_users = pd.to_numeric(self.campaign_data[users_col], errors='coerce').fillna(0).sum()
            else:
                total_users = 0
            
            # Calculate CPA
            cpa = total_spend / total_orders if total_orders > 0 else float('inf')
            
            # Store summary stats
            self.summary_stats = {
                'total_spend': total_spend,
                'meta_spend': meta_spend,
                'google_spend': google_spend,
                'total_orders': total_orders,
                'estimated_revenue': estimated_revenue,
                'roi': roi,
                'total_users': total_users,
                'cpa': cpa
            }
            
            print(f"\n📊 CRISIS OVERVIEW:")
            print(f"   Total Spend: ₹{total_spend:,.0f}")
            print(f"   Total Orders: {total_orders}")
            print(f"   Estimated Revenue: ₹{estimated_revenue:,.0f}")
            print(f"   ROI: {roi:.1f}%")
            print(f"   CPA: ₹{cpa:,.0f}" if cpa != float('inf') else "   CPA: ∞ (No conversions)")
            print(f"   Total Users: {total_users:,}")
            print(f"   Conversion Rate: {(total_orders/total_users)*100:.3f}%" if total_users > 0 else "   Conversion Rate: 0%")
            
            # Crisis indicators
            print(f"\n🚨 CRISIS INDICATORS:")
            if roi < -50:
                print(f"   ❌ ROI is catastrophically low ({roi:.1f}%)")
            if cpa > 20000:
                print(f"   ❌ CPA is extremely high (₹{cpa:,.0f})")
            if total_orders < 10:
                print(f"   ❌ Very few conversions ({total_orders} orders)")
            if (total_orders/total_users)*100 < 0.1 if total_users > 0 else True:
                print(f"   ❌ Conversion rate is extremely low")
                
        except Exception as e:
            print(f"Error calculating metrics: {e}")
        
    def analyze_platform_performance(self):
        """Analyze Meta vs Google Ads performance"""
        print("\n" + "="*60)
        print("🔍 PLATFORM PERFORMANCE ANALYSIS")
        print("="*60)
        
        try:
            cols = list(self.campaign_data.columns)
            
            # Find CTR columns
            ctr_cols = [col for col in cols if 'CTR' in str(col)]
            cpm_cols = [col for col in cols if 'CPM' in str(col)]
            
            if len(ctr_cols) >= 2:
                meta_ctr = pd.to_numeric(self.campaign_data[ctr_cols[0]], errors='coerce').mean()
                google_ctr = pd.to_numeric(self.campaign_data[ctr_cols[1]], errors='coerce').mean()
                
                print(f"📱 META ADS PERFORMANCE:")
                print(f"   Total Spend: ₹{self.summary_stats['meta_spend']:,.0f}")
                print(f"   Average CTR: {meta_ctr:.3f}%")
                print(f"   Spend Share: {(self.summary_stats['meta_spend']/self.summary_stats['total_spend'])*100:.1f}%")
                
                print(f"\n🔍 GOOGLE ADS PERFORMANCE:")
                print(f"   Total Spend: ₹{self.summary_stats['google_spend']:,.0f}")
                print(f"   Average CTR: {google_ctr:.3f}%")
                print(f"   Spend Share: {(self.summary_stats['google_spend']/self.summary_stats['total_spend'])*100:.1f}%")
                
                # Performance comparison
                print(f"\n⚖️ PLATFORM COMPARISON:")
                better_platform = "Meta" if meta_ctr > google_ctr else "Google"
                print(f"   Better CTR: {better_platform}")
                
                if meta_ctr < 0.01:
                    print(f"   🚨 Meta CTR is critically low ({meta_ctr:.3f}%)")
                if google_ctr < 0.01:
                    print(f"   🚨 Google CTR is critically low ({google_ctr:.3f}%)")
                    
        except Exception as e:
            print(f"Error analyzing platform performance: {e}")
    
    def analyze_adset_performance(self):
        """Analyze individual adset performance"""
        print("\n" + "="*60)
        print("💸 ADSET PERFORMANCE ANALYSIS")
        print("="*60)
        
        try:
            # Clean adset data
            adset_cols = list(self.adset_data.columns)
            print(f"Adset columns: {adset_cols[:10]}...")  # Show first 10 columns
            
            # Find key columns
            spend_col = [col for col in adset_cols if 'Spent' in str(col) or 'Spend' in str(col)]
            users_col = [col for col in adset_cols if 'Users' in str(col)]
            campaign_col = [col for col in adset_cols if 'Campaign' in str(col)]
            status_col = [col for col in adset_cols if 'Delivery' in str(col) or 'Status' in str(col)]
            
            if spend_col and users_col and campaign_col:
                spend_col = spend_col[0]
                users_col = users_col[0]
                campaign_col = campaign_col[0]
                
                # Convert to numeric
                self.adset_data['spend_numeric'] = pd.to_numeric(self.adset_data[spend_col], errors='coerce').fillna(0)
                self.adset_data['users_numeric'] = pd.to_numeric(self.adset_data[users_col], errors='coerce').fillna(0)
                
                # Calculate cost per user
                self.adset_data['cpa_calculated'] = np.where(
                    self.adset_data['users_numeric'] > 0,
                    self.adset_data['spend_numeric'] / self.adset_data['users_numeric'],
                    np.inf
                )
                
                # Top spending adsets
                top_spenders = self.adset_data.nlargest(5, 'spend_numeric')
                print(f"🔥 TOP 5 SPENDING ADSETS:")
                for idx, row in top_spenders.iterrows():
                    campaign_name = str(row[campaign_col])[:40]
                    spend = row['spend_numeric']
                    cpa = row['cpa_calculated']
                    print(f"   {campaign_name}... - ₹{spend:,.0f} (₹{cpa:,.0f}/user)")
                
                # Worst performers (highest CPA)
                worst_performers = self.adset_data[self.adset_data['cpa_calculated'] != np.inf].nlargest(5, 'cpa_calculated')
                print(f"\n💸 WORST PERFORMING ADSETS (Highest CPA):")
                for idx, row in worst_performers.iterrows():
                    campaign_name = str(row[campaign_col])[:40]
                    cpa = row['cpa_calculated']
                    if cpa < 100000:  # Filter out extreme outliers
                        print(f"   {campaign_name}... - ₹{cpa:,.0f}/user")
                
                # Performance summary
                valid_adsets = self.adset_data[self.adset_data['cpa_calculated'] != np.inf]
                avg_cpa = valid_adsets['cpa_calculated'].mean()
                median_cpa = valid_adsets['cpa_calculated'].median()
                
                print(f"\n📊 ADSET PERFORMANCE SUMMARY:")
                print(f"   Total Adsets: {len(self.adset_data)}")
                print(f"   Average CPA: ₹{avg_cpa:,.0f}")
                print(f"   Median CPA: ₹{median_cpa:,.0f}")
                print(f"   Adsets with CPA > ₹10k: {len(valid_adsets[valid_adsets['cpa_calculated'] > 10000])}")
                
        except Exception as e:
            print(f"Error analyzing adset performance: {e}")
    
    def analyze_conversion_funnel(self):
        """Analyze conversion funnel and drop-offs"""
        print("\n" + "="*60)
        print("🔄 CONVERSION FUNNEL ANALYSIS")
        print("="*60)
        
        try:
            cols = list(self.campaign_data.columns)
            
            # Find funnel columns
            users_col = [col for col in cols if 'User' in str(col) and 'Total' in str(col)][0] if any('User' in str(col) and 'Total' in str(col) for col in cols) else None
            atc_col = [col for col in cols if 'ATC' in str(col)][0] if any('ATC' in str(col) for col in cols) else None
            checkout_col = [col for col in cols if 'Checkout' in str(col) and 'Reached' in str(col)][0] if any('Checkout' in str(col) for col in cols) else None
            
            if users_col and atc_col and checkout_col:
                total_users = pd.to_numeric(self.campaign_data[users_col], errors='coerce').fillna(0).sum()
                total_atc = pd.to_numeric(self.campaign_data[atc_col], errors='coerce').fillna(0).sum()
                total_checkout = pd.to_numeric(self.campaign_data[checkout_col], errors='coerce').fillna(0).sum()
                total_orders = self.summary_stats['total_orders']
                
                # Calculate conversion rates
                atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
                checkout_rate = (total_checkout / total_atc) * 100 if total_atc > 0 else 0
                purchase_rate = (total_orders / total_checkout) * 100 if total_checkout > 0 else 0
                overall_conversion = (total_orders / total_users) * 100 if total_users > 0 else 0
                
                print(f"🔄 FUNNEL PERFORMANCE:")
                print(f"   Users: {total_users:,}")
                print(f"   Add to Cart: {total_atc:,} ({atc_rate:.2f}%)")
                print(f"   Reached Checkout: {total_checkout:,} ({checkout_rate:.2f}% of ATC)")
                print(f"   Purchases: {total_orders:,} ({purchase_rate:.2f}% of checkout)")
                print(f"   Overall Conversion: {overall_conversion:.3f}%")
                
                # Industry benchmarks
                print(f"\n📊 VS INDUSTRY BENCHMARKS:")
                print(f"   ATC Rate: {atc_rate:.2f}% vs 3-5% benchmark (🚨 {((3-atc_rate)/3)*100:.0f}% below)")
                print(f"   Checkout Rate: {checkout_rate:.2f}% vs 65% benchmark")
                print(f"   Purchase Rate: {purchase_rate:.2f}% vs 70% benchmark")
                print(f"   Overall Conversion: {overall_conversion:.3f}% vs 1.8% benchmark (🚨 {((1.8-overall_conversion)/1.8)*100:.0f}% below)")
                
                # Identify biggest drop-off
                drop_off_users_to_atc = 100 - atc_rate
                drop_off_atc_to_checkout = 100 - checkout_rate
                drop_off_checkout_to_purchase = 100 - purchase_rate
                
                print(f"\n🚨 DROP-OFF ANALYSIS:")
                print(f"   Users → ATC: {drop_off_users_to_atc:.1f}% drop-off")
                print(f"   ATC → Checkout: {drop_off_atc_to_checkout:.1f}% drop-off")
                print(f"   Checkout → Purchase: {drop_off_checkout_to_purchase:.1f}% drop-off")
                
                biggest_dropoff = max(
                    ("Users to ATC", drop_off_users_to_atc),
                    ("ATC to Checkout", drop_off_atc_to_checkout),
                    ("Checkout to Purchase", drop_off_checkout_to_purchase),
                    key=lambda x: x[1]
                )
                print(f"   🎯 BIGGEST ISSUE: {biggest_dropoff[0]} ({biggest_dropoff[1]:.1f}% drop)")
                
        except Exception as e:
            print(f"Error analyzing conversion funnel: {e}")
    
    def identify_root_causes(self):
        """Identify primary root causes for poor performance"""
        print("\n" + "="*60)
        print("🔍 ROOT CAUSE ANALYSIS")
        print("="*60)
        
        issues = []
        
        # Check critical metrics
        if self.summary_stats['roi'] < -80:
            issues.append("🚨 CRITICAL: ROI is catastrophically low")
        
        if self.summary_stats['cpa'] > 15000:
            issues.append("🚨 CRITICAL: CPA is extremely high (>₹15k)")
        
        if self.summary_stats['total_orders'] < 20:
            issues.append("🚨 CRITICAL: Very few conversions in 10-day period")
        
        conversion_rate = (self.summary_stats['total_orders'] / self.summary_stats['total_users']) * 100 if self.summary_stats['total_users'] > 0 else 0
        if conversion_rate < 0.1:
            issues.append("🚨 CRITICAL: Conversion rate is 18x below industry standard")
        
        spend_efficiency = self.summary_stats['total_spend'] / self.summary_stats['estimated_revenue'] if self.summary_stats['estimated_revenue'] > 0 else float('inf')
        if spend_efficiency > 10:
            issues.append("🚨 CRITICAL: Spending 10x more than revenue generated")
        
        print(f"🔍 IDENTIFIED ROOT CAUSES:")
        for i, issue in enumerate(issues, 1):
            print(f"   {i}. {issue}")
        
        print(f"\n💡 LIKELY SYSTEMIC ISSUES:")
        print(f"   • Poor product-market fit for digital advertising")
        print(f"   • Ineffective creative messaging")
        print(f"   • Wrong target audience")
        print(f"   • Technical issues with tracking/conversion")
        print(f"   • Pricing too high for target market")
        print(f"   • Poor website user experience")
    
    def generate_immediate_actions(self):
        """Generate immediate action items"""
        print("\n" + "="*60)
        print("🚨 IMMEDIATE ACTION PLAN")
        print("="*60)
        
        print(f"⚡ EMERGENCY ACTIONS (TODAY):")
        print(f"   1. 🛑 PAUSE all campaigns with CPA > ₹20,000 immediately")
        print(f"   2. 📉 REDUCE remaining campaign budgets by 80%")
        print(f"   3. 🔍 AUDIT website conversion tracking setup")
        print(f"   4. 🛒 TEST checkout process for technical issues")
        print(f"   5. 📱 AUDIT mobile website experience")
        
        print(f"\n🚀 QUICK WINS (This Week):")
        print(f"   1. 🎯 Create retargeting campaigns for website visitors")
        print(f"   2. 💬 Implement WhatsApp checkout option")
        print(f"   3. 🎨 A/B test new ad creatives with social proof")
        print(f"   4. 💰 Test discount/offer campaigns")
        print(f"   5. 📞 Set up conversion tracking via phone calls")
        
        print(f"\n📊 BUDGET REALLOCATION:")
        print(f"   • Allocate 60% budget to retargeting")
        print(f"   • Allocate 30% to lookalike audiences")
        print(f"   • Allocate 10% to testing new approaches")
        print(f"   • Total daily budget should not exceed ₹15,000")
        
        print(f"\n🎯 TARGETING CHANGES:")
        print(f"   • Focus on proven high-intent jewelry buyers")
        print(f"   • Target engaged users from organic social")
        print(f"   • Create audiences based on competitor engagement")
        print(f"   • Test different age groups and income levels")
        
        print(f"\n📈 SUCCESS METRICS TO TRACK:")
        print(f"   • CPA should be < ₹5,000 within 2 weeks")
        print(f"   • Conversion rate should reach > 0.5%")
        print(f"   • ROI should improve to > -50% within 1 month")
        print(f"   • Daily orders should increase to > 5")
    
    def generate_comprehensive_report(self):
        """Generate the complete analysis report"""
        print("🚨 VIBEWITHMOI.COM CAMPAIGN CRISIS ANALYSIS")
        print("="*80)
        print("📅 Analysis Period: August 12-21, 2025 (10 days)")
        print("💎 Industry: Luxury Jewelry E-commerce")
        print("🎯 Current Status: CRITICAL - Immediate Intervention Required")
        print("="*80)
        
        if not self.load_data():
            print("❌ Failed to load data. Analysis cannot proceed.")
            return
        
        self.calculate_key_metrics()
        self.analyze_platform_performance()
        self.analyze_conversion_funnel()
        self.analyze_adset_performance()
        self.identify_root_causes()
        self.generate_immediate_actions()
        
        print("\n" + "="*80)
        print("📋 EXECUTIVE SUMMARY")
        print("="*80)
        print("🚨 STATUS: CRISIS - Campaigns are severely underperforming")
        print(f"💰 FINANCIAL IMPACT: ₹{self.summary_stats['total_spend']:,.0f} spent, ₹{self.summary_stats['estimated_revenue']:,.0f} revenue")
        print(f"📉 ROI: {self.summary_stats['roi']:.1f}% (Benchmark: +300%)")
        print(f"🎯 CONVERSION: {(self.summary_stats['total_orders']/self.summary_stats['total_users'])*100:.3f}% (Benchmark: 1.8%)")
        print(f"⚡ ACTION REQUIRED: Immediate campaign optimization and budget reallocation")
        print("="*80)

def main():
    """Run the comprehensive MOI campaign analysis"""
    analyzer = MOICampaignAnalyzer()
    analyzer.generate_comprehensive_report()

if __name__ == "__main__":
    main()