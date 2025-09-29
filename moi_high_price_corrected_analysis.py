#!/usr/bin/env python3
"""
CORRECTED MOI CAMPAIGN ANALYSIS FOR HIGH-PRICE ITEMS
For vibewithmoi.com - High-price luxury goods require different benchmarks
Critical Context: This is NOT standard e-commerce - these are high-consideration purchases
"""

import pandas as pd
import numpy as np

def load_and_clean_data():
    """Load and properly structure the MOI data"""
    
    # Load the raw data
    df = pd.read_csv("/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/detailed_marketing_analysis.csv")
    
    # Convert numeric columns
    numeric_cols = [col for col in df.columns if col != 'Date']
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
    
    return df

def analyze_high_price_performance():
    """High-price item analysis with appropriate benchmarks"""
    
    print("💎" * 50)
    print("VIBEWITHMOI.COM HIGH-PRICE ITEM ANALYSIS")
    print("CORRECTED FOR LUXURY/HIGH-CONSIDERATION PURCHASES")
    print("💎" * 50)
    print("📅 Period: August 12-21, 2025 (10 days)")
    print("💍 Industry: High-Price Luxury Jewelry")
    print("🎯 Context: Long consideration cycle, multiple touchpoints")
    print("=" * 80)
    
    # Load data
    df = load_and_clean_data()
    
    # Calculate totals
    total_spend = df['Total_Spend'].sum()
    total_users = df['Total_Users'].sum()
    total_atc = df['Total_ATC'].sum()
    total_checkout = df['Total_Reached_Checkout'].sum()
    total_orders = df['Online_Orders'].sum()
    total_revenue = df['Estimated_Revenue'].sum()
    whatsapp_interest = df['WhatsApp_Purchase_Clicks'].sum()
    session_duration_avg = df['Session_Duration'].apply(lambda x: 
        int(str(x).split(':')[0])*60 + int(str(x).split(':')[1]) if ':' in str(x) else 0).mean()
    
    # HIGH-PRICE BENCHMARKS (Luxury/B2B/High-consideration)
    luxury_benchmarks = {
        'conversion_rate': 0.1,  # 0.1-0.5% for luxury items
        'atc_rate': 0.8,         # 0.5-1.5% for high-price items
        'ctr': 0.4,              # 0.3-0.8% for luxury
        'consideration_engagement': 2.0,  # Multiple sessions before purchase
        'session_duration': 120,  # 2+ minutes for research-heavy purchases
        'roi_target': 200,        # Lower immediate ROI due to longer attribution
        'attribution_window': 30, # 30-90 days for high-price items
    }
    
    # Calculate performance metrics
    conversion_rate = (total_orders / total_users) * 100 if total_users > 0 else 0
    atc_rate = (total_atc / total_users) * 100 if total_users > 0 else 0
    checkout_rate = (total_checkout / total_users) * 100 if total_users > 0 else 0
    avg_ctr = ((df['Meta_CTR'].mean() + df['Google_CTR'].mean()) / 2)
    roi = ((total_revenue - total_spend) / total_spend) * 100 if total_spend > 0 else -100
    cpa = total_spend / total_orders if total_orders > 0 else float('inf')
    
    print("📊 HIGH-PRICE ITEM PERFORMANCE ANALYSIS")
    print("=" * 60)
    print(f"💰 Total Investment: ₹{total_spend:,.0f}")
    print(f"📈 Immediate Revenue: ₹{total_revenue:,.0f}")
    print(f"👥 Unique Users Reached: {total_users:,}")
    print(f"🛒 Cart Adds: {total_atc}")
    print(f"💳 Checkout Initiations: {total_checkout}")
    print(f"✅ Immediate Orders: {total_orders}")
    print(f"📱 WhatsApp Interest: {whatsapp_interest} (high-intent leads)")
    print(f"⏰ Avg Session Duration: {session_duration_avg:.0f} seconds")
    
    print(f"\n🎯 HIGH-PRICE BENCHMARKS COMPARISON")
    print("=" * 60)
    
    # Conversion Rate Analysis
    conv_status = "✅ EXCELLENT" if conversion_rate >= luxury_benchmarks['conversion_rate'] else \
                  "⚠️ ACCEPTABLE" if conversion_rate >= luxury_benchmarks['conversion_rate']*0.5 else \
                  "❌ NEEDS IMPROVEMENT"
    print(f"🎯 Conversion Rate: {conversion_rate:.3f}% | Luxury Benchmark: {luxury_benchmarks['conversion_rate']}% | {conv_status}")
    
    # ATC Rate Analysis
    atc_status = "✅ EXCELLENT" if atc_rate >= luxury_benchmarks['atc_rate'] else \
                 "⚠️ ACCEPTABLE" if atc_rate >= luxury_benchmarks['atc_rate']*0.6 else \
                 "❌ NEEDS IMPROVEMENT"
    print(f"🛒 ATC Rate: {atc_rate:.2f}% | Luxury Benchmark: {luxury_benchmarks['atc_rate']}% | {atc_status}")
    
    # CTR Analysis
    ctr_status = "✅ EXCELLENT" if avg_ctr >= luxury_benchmarks['ctr'] else \
                 "⚠️ ACCEPTABLE" if avg_ctr >= luxury_benchmarks['ctr']*0.5 else \
                 "❌ NEEDS IMPROVEMENT"
    print(f"👆 Average CTR: {avg_ctr:.3f}% | Luxury Benchmark: {luxury_benchmarks['ctr']}% | {ctr_status}")
    
    # Session Duration Analysis
    duration_status = "✅ EXCELLENT" if session_duration_avg >= luxury_benchmarks['session_duration'] else \
                      "⚠️ ACCEPTABLE" if session_duration_avg >= luxury_benchmarks['session_duration']*0.7 else \
                      "❌ NEEDS IMPROVEMENT"
    print(f"⏰ Session Duration: {session_duration_avg:.0f}s | Luxury Benchmark: {luxury_benchmarks['session_duration']}s | {duration_status}")
    
    print(f"\n💡 HIGH-CONSIDERATION FUNNEL ANALYSIS")
    print("=" * 60)
    
    # Calculate consideration metrics
    research_users = df['Users_5pageviews_1min'].sum()  # Users viewing 5+ pages
    engaged_sessions = df['Users_Session_1min'].sum()   # Sessions > 1 minute
    
    research_rate = (research_users / total_users) * 100 if total_users > 0 else 0
    engagement_rate = (engaged_sessions / total_users) * 100 if total_users > 0 else 0
    
    print(f"🔍 Research Behavior (5+ pages): {research_users:,} users ({research_rate:.1f}%)")
    print(f"⏱️ Deep Engagement (1+ min): {engaged_sessions:,} sessions ({engagement_rate:.1f}%)")
    print(f"💬 High-Intent Leads (WhatsApp): {whatsapp_interest} users")
    print(f"📊 Consideration Pool Size: {total_atc + whatsapp_interest} prospects")
    
    # Calculate consideration funnel
    awareness_pool = total_users
    interest_pool = engaged_sessions
    consideration_pool = total_atc + whatsapp_interest
    purchase_pool = total_orders
    
    print(f"\n🏺 LUXURY PURCHASE FUNNEL")
    print("=" * 60)
    print(f"👀 Awareness: {awareness_pool:,} users")
    print(f"🤔 Interest: {interest_pool:,} engaged sessions ({(interest_pool/awareness_pool)*100:.1f}%)")
    print(f"💭 Consideration: {consideration_pool} prospects ({(consideration_pool/awareness_pool)*100:.2f}%)")
    print(f"💳 Purchase: {purchase_pool} orders ({(purchase_pool/consideration_pool)*100:.1f}% of consideration pool)")
    
    print(f"\n📈 ATTRIBUTION & LIFETIME VALUE ANALYSIS")
    print("=" * 60)
    
    # For high-price items, we need to consider:
    # 1. Extended attribution windows
    # 2. Offline conversions
    # 3. Future purchase probability
    
    # Estimate extended attribution value
    consideration_value = consideration_pool * 15000  # Estimated 30-day potential revenue per consideration
    future_value_multiplier = 2.5  # High-price customers often purchase again
    
    print(f"💰 Immediate ROAS: {(total_revenue/total_spend):.2f}x" if total_spend > 0 else "💰 Immediate ROAS: 0x")
    print(f"🔮 30-Day Potential Revenue: ₹{consideration_value:,.0f}")
    print(f"🎯 Quality Score: {(consideration_pool/awareness_pool)*1000:.1f} (considerations per 1K users)")
    print(f"📞 Offline Conversion Potential: {whatsapp_interest} high-intent leads")
    
    print(f"\n⚡ STRATEGIC RECOMMENDATIONS FOR HIGH-PRICE ITEMS")
    print("=" * 60)
    
    recommendations = []
    
    # Performance-based recommendations
    if conversion_rate < luxury_benchmarks['conversion_rate']:
        if session_duration_avg < luxury_benchmarks['session_duration']:
            recommendations.append("🎨 CONTENT STRATEGY: Create educational content about jewelry value, craftsmanship")
        if atc_rate < luxury_benchmarks['atc_rate']:
            recommendations.append("💎 TRUST BUILDING: Add certifications, guarantees, customer testimonials")
        recommendations.append("📞 SALES SUPPORT: Implement personal consultation booking for high-ticket items")
    
    if avg_ctr < luxury_benchmarks['ctr']:
        recommendations.append("🎯 CREATIVE FOCUS: Test lifestyle aspirational ads vs product-only ads")
        recommendations.append("👑 EXCLUSIVITY MESSAGING: Emphasize limited collections, bespoke options")
    
    if whatsapp_interest > 0:
        recommendations.append(f"📱 WHATSAPP OPTIMIZATION: {whatsapp_interest} users showed purchase intent via WhatsApp")
        recommendations.append("🤝 PERSONAL SELLING: Train WhatsApp team for luxury sales consultations")
    
    # Always relevant for high-price items
    recommendations.extend([
        "⏰ ATTRIBUTION WINDOWS: Extend to 30-90 days for accurate ROI measurement",
        "🎪 RETARGETING STRATEGY: Create 30-day nurture sequences for consideration pool",
        "📊 LEAD SCORING: Focus on engagement depth over immediate conversions",
        "🏆 SOCIAL PROOF: Showcase customer stories, celebrity endorsements",
        "📍 OMNICHANNEL: Consider showroom appointments for high-value prospects"
    ])
    
    for i, rec in enumerate(recommendations, 1):
        print(f"   {i}. {rec}")
    
    print(f"\n🎯 HIGH-PRICE ITEM SUCCESS METRICS (30-90 Days)")
    print("=" * 60)
    print(f"📊 Primary KPIs:")
    print(f"   • Consideration Pool Growth: Target 500+ monthly prospects")
    print(f"   • Session Duration: Target 2+ minutes average")
    print(f"   • WhatsApp Conversions: Track consultation → purchase rate")
    print(f"   • Brand Awareness: Track social mentions, brand searches")
    print(f"   • Customer Lifetime Value: Track repeat purchase patterns")
    
    print(f"\n📈 Secondary KPIs:")
    print(f"   • Email Signup Rate: Build nurture audience")
    print(f"   • Social Engagement: Likes, shares, saves on jewelry content")
    print(f"   • Catalog Downloads: Track brochure/catalog requests")
    print(f"   • Store Visit Requests: Physical showroom appointments")
    
    print(f"\n💡 CAMPAIGN OPTIMIZATION FOR HIGH-PRICE ITEMS")
    print("=" * 60)
    
    # Calculate efficiency metrics
    cost_per_consideration = total_spend / consideration_pool if consideration_pool > 0 else float('inf')
    cost_per_engaged_user = total_spend / interest_pool if interest_pool > 0 else float('inf')
    
    print(f"💰 Cost per Consideration: ₹{cost_per_consideration:,.0f}" if cost_per_consideration != float('inf') else "💰 Cost per Consideration: N/A")
    print(f"💰 Cost per Engaged User: ₹{cost_per_engaged_user:,.0f}" if cost_per_engaged_user != float('inf') else "💰 Cost per Engaged User: N/A")
    
    # Performance assessment
    if cost_per_consideration < 1000:
        performance_level = "🚀 EXCELLENT"
    elif cost_per_consideration < 2000:
        performance_level = "✅ GOOD"
    elif cost_per_consideration < 5000:
        performance_level = "⚠️ ACCEPTABLE"
    else:
        performance_level = "❌ NEEDS OPTIMIZATION"
    
    print(f"📊 Overall Performance: {performance_level}")
    
    print(f"\n🎪 BUDGET ALLOCATION FOR HIGH-PRICE ITEMS")
    print("=" * 60)
    print(f"Recommended Budget Split:")
    print(f"   • Brand Awareness (40%): Build trust and recognition")
    print(f"   • Consideration Nurturing (30%): Educational content, retargeting")
    print(f"   • High-Intent Targeting (20%): Competitor audiences, lookalikes")
    print(f"   • Conversion Optimization (10%): Direct response, promotions")
    
    print(f"\n" + "💎" * 50)
    print("EXECUTIVE SUMMARY - HIGH-PRICE ITEM CONTEXT")
    print("💎" * 50)
    
    if conversion_rate >= luxury_benchmarks['conversion_rate'] * 0.5:
        summary_status = "✅ PERFORMING WITHIN LUXURY BENCHMARKS"
        action_required = "OPTIMIZE AND SCALE"
    elif consideration_pool > 50:
        summary_status = "⚠️ BUILDING CONSIDERATION POOL SUCCESSFULLY"
        action_required = "FOCUS ON CONVERSION OPTIMIZATION"
    else:
        summary_status = "❌ BELOW LUXURY PERFORMANCE STANDARDS"
        action_required = "STRATEGIC OVERHAUL REQUIRED"
    
    print(f"STATUS: {summary_status}")
    print(f"CONSIDERATION POOL: {consideration_pool} prospects in funnel")
    print(f"IMMEDIATE ACTION: {action_required}")
    print(f"TIMELINE: 30-90 days to see true ROI impact")
    print(f"FOCUS: Build trust, educate market, nurture high-intent leads")
    print("💎" * 50)

if __name__ == "__main__":
    analyze_high_price_performance()