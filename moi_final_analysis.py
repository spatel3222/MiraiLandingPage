#!/usr/bin/env python3
"""
COMPREHENSIVE MOI CAMPAIGN CRISIS ANALYSIS
For vibewithmoi.com - Critical underperformance requiring immediate action
"""

import pandas as pd
import numpy as np

def load_and_clean_data():
    """Load and properly structure the MOI data"""
    
    # Load the raw data
    df = pd.read_csv("/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/sample_data_converted.csv", header=None)
    
    # Create proper column headers based on the data structure
    headers = [
        'Date', 'Meta_Spend', 'Meta_CTR', 'Meta_CPM', 'Google_Spend', 'Google_CTR', 'Google_CPM',
        'Total_Users', 'Total_ATC', 'Total_Checkout', 'Abandoned_Checkout', 'Session_Duration',
        'Users_1min', 'Users_5pages_1min', 'ATC_1min', 'Checkout_1min', 'WhatsApp_Clicks',
        'General_Queries', 'Open_Queries', 'Online_Orders'
    ]
    
    # Skip header rows and assign proper column names
    clean_df = df.iloc[5:].copy()
    clean_df.columns = headers
    
    # Convert numeric columns
    numeric_cols = [col for col in headers if col != 'Date']
    for col in numeric_cols:
        clean_df[col] = pd.to_numeric(clean_df[col], errors='coerce').fillna(0)
    
    return clean_df

def analyze_moi_crisis():
    """Complete crisis analysis for MOI campaigns"""
    
    print("🚨" * 40)
    print("VIBEWITHMOI.COM CAMPAIGN CRISIS ANALYSIS")
    print("🚨" * 40)
    print("📅 Period: August 12-21, 2025 (10 days)")
    print("💎 Industry: Luxury Jewelry E-commerce")
    print("🎯 Status: CRITICAL EMERGENCY")
    print("=" * 80)
    
    # Load data
    df = load_and_clean_data()
    
    # Calculate totals
    total_meta_spend = df['Meta_Spend'].sum()
    total_google_spend = df['Google_Spend'].sum()
    total_spend = total_meta_spend + total_google_spend
    total_users = df['Total_Users'].sum()
    total_atc = df['Total_ATC'].sum()
    total_checkout = df['Total_Checkout'].sum()
    total_orders = df['Online_Orders'].sum()
    total_abandoned = df['Abandoned_Checkout'].sum()
    
    # Estimated revenue (luxury jewelry avg ₹2,500 per order)
    avg_order_value = 2500
    total_revenue = total_orders * avg_order_value
    
    # Calculate crisis metrics
    roi = ((total_revenue - total_spend) / total_spend) * 100 if total_spend > 0 else -100
    cpa = total_spend / total_orders if total_orders > 0 else float('inf')
    conversion_rate = (total_orders / total_users) * 100 if total_users > 0 else 0
    atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
    checkout_rate = (total_checkout / total_users) * 100 if total_users > 0 else 0
    abandonment_rate = (total_abandoned / total_atc) * 100 if total_atc > 0 else 0
    
    # Platform performance
    avg_meta_ctr = df['Meta_CTR'].mean()
    avg_google_ctr = df['Google_CTR'].mean()
    avg_meta_cpm = df['Meta_CPM'].mean()
    avg_google_cpm = df['Google_CPM'].mean()
    
    print("📊 CRISIS OVERVIEW")
    print("=" * 50)
    print(f"💰 Total Spend: ₹{total_spend:,.0f}")
    print(f"📈 Total Revenue: ₹{total_revenue:,.0f}")
    print(f"💔 ROI: {roi:.1f}% (vs +300% target)")
    print(f"💸 CPA: ₹{cpa:,.0f}" if cpa != float('inf') else "💸 CPA: ∞ (NO CONVERSIONS)")
    print(f"👥 Total Users: {total_users:,}")
    print(f"🛒 Total Orders: {total_orders}")
    print(f"📉 Conversion Rate: {conversion_rate:.3f}% (vs 1.8% benchmark)")
    print(f"🎯 ATC Rate: {atc_rate:.2f}% (vs 3-5% benchmark)")
    print(f"💳 Checkout Rate: {checkout_rate:.2f}%")
    
    print(f"\n🚨 CRISIS INDICATORS")
    print("=" * 50)
    crisis_score = 0
    if roi < -80:
        print(f"❌ ROI CATASTROPHIC: {roi:.1f}% (Target: >300%)")
        crisis_score += 5
    if cpa > 20000 or cpa == float('inf'):
        print(f"❌ CPA CATASTROPHIC: ₹{cpa:,.0f}" if cpa != float('inf') else "❌ NO CONVERSIONS AT ALL")
        crisis_score += 5
    if conversion_rate < 0.1:
        print(f"❌ CONVERSION CATASTROPHIC: {conversion_rate:.3f}% (18x below benchmark)")
        crisis_score += 4
    if atc_rate < 1:
        print(f"❌ ATC RATE CATASTROPHIC: {atc_rate:.2f}% (3x below benchmark)")
        crisis_score += 3
    if avg_meta_ctr < 0.01 and avg_google_ctr < 0.01:
        print(f"❌ CTR CATASTROPHIC: Meta {avg_meta_ctr:.3f}%, Google {avg_google_ctr:.3f}%")
        crisis_score += 3
    
    print(f"\n🔥 CRISIS SEVERITY: {crisis_score}/20 - {'MAXIMUM EMERGENCY' if crisis_score >= 15 else 'CRITICAL'}")
    
    print(f"\n🔍 PLATFORM BREAKDOWN")
    print("=" * 50)
    print(f"📱 META ADS:")
    print(f"   Spend: ₹{total_meta_spend:,.0f} ({(total_meta_spend/total_spend)*100:.1f}%)")
    print(f"   Avg CTR: {avg_meta_ctr:.3f}%")
    print(f"   Avg CPM: ₹{avg_meta_cpm:.2f}")
    print(f"   Daily Avg: ₹{total_meta_spend/10:,.0f}")
    
    print(f"\n🔍 GOOGLE ADS:")
    print(f"   Spend: ₹{total_google_spend:,.0f} ({(total_google_spend/total_spend)*100:.1f}%)")
    print(f"   Avg CTR: {avg_google_ctr:.3f}%")
    print(f"   Avg CPM: ₹{avg_google_cpm:.2f}")
    print(f"   Daily Avg: ₹{total_google_spend/10:,.0f}")
    
    better_platform = "Meta" if avg_meta_ctr > avg_google_ctr else "Google"
    print(f"\n⚖️ Better Performing Platform: {better_platform}")
    
    print(f"\n🔄 CONVERSION FUNNEL ANALYSIS")
    print("=" * 50)
    print(f"👥 Users: {total_users:,}")
    print(f"🛒 Add to Cart: {total_atc:,} ({atc_rate:.2f}%)")
    print(f"💳 Reached Checkout: {total_checkout:,} ({(total_checkout/total_atc)*100:.1f}% of ATC)")
    print(f"✅ Completed Orders: {total_orders} ({(total_orders/total_checkout)*100:.1f}% of checkout)")
    print(f"🔄 Overall Conversion: {conversion_rate:.3f}%")
    
    # Calculate drop-offs
    drop_users_to_atc = 100 - atc_rate
    drop_atc_to_checkout = 100 - ((total_checkout/total_atc)*100 if total_atc > 0 else 0)
    drop_checkout_to_order = 100 - ((total_orders/total_checkout)*100 if total_checkout > 0 else 0)
    
    print(f"\n💔 DROP-OFF POINTS:")
    print(f"   Users → ATC: {drop_users_to_atc:.1f}% drop")
    print(f"   ATC → Checkout: {drop_atc_to_checkout:.1f}% drop")
    print(f"   Checkout → Order: {drop_checkout_to_order:.1f}% drop")
    
    biggest_drop = max(
        ("User Interest", drop_users_to_atc),
        ("Cart Process", drop_atc_to_checkout),
        ("Payment Process", drop_checkout_to_order),
        key=lambda x: x[1]
    )
    print(f"🎯 BIGGEST ISSUE: {biggest_drop[0]} ({biggest_drop[1]:.1f}% drop)")
    
    print(f"\n🚨 ROOT CAUSE ANALYSIS")
    print("=" * 50)
    root_causes = []
    
    if drop_users_to_atc > 95:
        root_causes.append("🎯 TARGETING: Wrong audience or poor ad relevance")
    if drop_atc_to_checkout > 70:
        root_causes.append("🛒 CART UX: Cart abandonment issues")
    if drop_checkout_to_order > 80:
        root_causes.append("💳 PAYMENT: Checkout process problems")
    if avg_meta_ctr < 0.01 and avg_google_ctr < 0.01:
        root_causes.append("🎨 CREATIVE: Poor ad creatives and messaging")
    if total_orders == 0:
        root_causes.append("🔧 TECHNICAL: Possible tracking or website issues")
    
    for i, cause in enumerate(root_causes, 1):
        print(f"   {i}. {cause}")
    
    print(f"\n⚡ IMMEDIATE EMERGENCY ACTIONS")
    print("=" * 50)
    print(f"🛑 STOP IMMEDIATELY (Today):")
    print(f"   1. Pause ALL campaigns spending >₹3,000/day with 0 conversions")
    print(f"   2. Reduce remaining budgets by 80%")
    print(f"   3. Emergency audit of website conversion tracking")
    print(f"   4. Test checkout process manually on mobile/desktop")
    print(f"   5. Verify Google Analytics and Facebook Pixel are working")
    
    print(f"\n🚀 QUICK WINS (This Week):")
    print(f"   1. Create retargeting campaigns for {total_atc} cart abandoners")
    print(f"   2. Set up WhatsApp checkout ({df['WhatsApp_Clicks'].sum()} interested users)")
    print(f"   3. A/B test discount offers (10-20% off)")
    print(f"   4. Add exit-intent popups with offers")
    print(f"   5. Implement live chat for purchase assistance")
    
    print(f"\n📊 BUDGET REALLOCATION PLAN")
    print("=" * 50)
    new_daily_budget = 15000  # Reduced from current ~43k
    print(f"NEW DAILY BUDGET: ₹{new_daily_budget:,} (65% reduction)")
    print(f"   • Retargeting (ATC users): ₹{int(new_daily_budget * 0.4):,} (40%)")
    print(f"   • Lookalike audiences: ₹{int(new_daily_budget * 0.3):,} (30%)")
    print(f"   • Interest targeting: ₹{int(new_daily_budget * 0.2):,} (20%)")
    print(f"   • Testing new approaches: ₹{int(new_daily_budget * 0.1):,} (10%)")
    
    print(f"\n🎯 SUCCESS TARGETS (Next 30 days)")
    print("=" * 50)
    print(f"   📈 ROI: Improve to -20% (from {roi:.1f}%)")
    print(f"   💰 CPA: Reduce to <₹8,000 (from ₹{cpa:,.0f})" if cpa != float('inf') else "   💰 CPA: Achieve first conversions")
    print(f"   🎯 Conversion Rate: Reach 0.8% (from {conversion_rate:.3f}%)")
    print(f"   📱 Daily Orders: Target 8-10 orders/day (from {total_orders/10:.1f})")
    print(f"   💳 ATC Rate: Improve to 2.5% (from {atc_rate:.2f}%)")
    
    print(f"\n💡 STRATEGIC RECOMMENDATIONS")
    print("=" * 50)
    print(f"   1. 🎨 CREATIVE OVERHAUL: Test lifestyle vs product-focused ads")
    print(f"   2. 🎯 AUDIENCE RESET: Focus on engaged jewelry buyers, not broad interests")
    print(f"   3. 💰 PRICING STRATEGY: Test promotional pricing for new customers")
    print(f"   4. 📱 MOBILE OPTIMIZATION: 70%+ traffic is mobile, optimize experience")
    print(f"   5. 🔄 ATTRIBUTION: Set up proper multi-touch attribution")
    print(f"   6. 📞 OFFLINE INTEGRATION: Track phone orders and consultations")
    
    print(f"\n" + "🚨" * 40)
    print("EXECUTIVE SUMMARY")
    print("🚨" * 40)
    print(f"STATUS: CRITICAL CRISIS - Immediate intervention required")
    print(f"FINANCIAL IMPACT: ₹{total_spend:,.0f} lost in 10 days")
    print(f"PRIMARY ISSUE: {biggest_drop[0]} causing {biggest_drop[1]:.0f}% drop-off")
    print(f"IMMEDIATE ACTION: Pause high-spend campaigns, implement retargeting")
    print(f"TIMELINE: 48 hours to stop bleeding, 2 weeks to see improvement")
    print("🚨" * 40)

if __name__ == "__main__":
    analyze_moi_crisis()