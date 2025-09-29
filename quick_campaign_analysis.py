import pandas as pd
import numpy as np

# Load data
file_path = "/Users/shivangpatel/Documents/GitHub/crtx.in/Moi Data/01_Original_Data/sheet_3_Shopify_Exports.csv"
df = pd.read_csv(file_path)

# Clean column names
df.columns = df.columns.str.strip()

# Filter out template rows and empty campaigns
df_clean = df[df['Utm campaign'].notna()]
df_clean = df_clean[~df_clean['Utm campaign'].str.contains('{{campaign.name}}', na=False)]
df_clean = df_clean[df_clean['Utm campaign'] != '']

# Convert numeric columns
numeric_cols = ['Online store visitors', 'Sessions', 'Sessions with cart additions', 
               'Sessions that reached checkout', 'Average session duration', 'Pageviews']

for col in numeric_cols:
    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce').fillna(0)

# Aggregate by campaign
campaign_summary = df_clean.groupby('Utm campaign').agg({
    'Online store visitors': 'sum',
    'Sessions': 'sum',
    'Sessions with cart additions': 'sum',
    'Sessions that reached checkout': 'sum',
    'Average session duration': 'mean',
    'Pageviews': 'sum'
}).reset_index()

# Calculate rates
campaign_summary['Cart Addition Rate'] = (
    campaign_summary['Sessions with cart additions'] / 
    campaign_summary['Sessions'].replace(0, np.nan)
) * 100

campaign_summary['Checkout Rate'] = (
    campaign_summary['Sessions that reached checkout'] / 
    campaign_summary['Sessions'].replace(0, np.nan)
) * 100

campaign_summary = campaign_summary.fillna(0)
campaign_summary = campaign_summary.sort_values('Sessions', ascending=False)

# Get top and bottom performers
top_5 = campaign_summary.head(5)
bottom_5 = campaign_summary.tail(5)

# Print analysis
print("SHOPIFY CAMPAIGN PERFORMANCE ANALYSIS - EXECUTIVE DASHBOARD")
print("vibewithmoi.com High-Ticket E-commerce Analysis")
print("=" * 80)

print(f"\nCampaign Count Analysis:")
print(f"- Total Unique Campaigns: {len(campaign_summary)}")
print(f"- Total Sessions: {campaign_summary['Sessions'].sum():,}")
print(f"- Total Visitors: {campaign_summary['Online store visitors'].sum():,}")
print(f"- Total Checkouts: {campaign_summary['Sessions that reached checkout'].sum():,}")
print(f"- Average Cart Addition Rate: {campaign_summary['Cart Addition Rate'].mean():.2f}%")
print(f"- Average Checkout Rate: {campaign_summary['Checkout Rate'].mean():.2f}%")

print(f"\nTOP 5 PERFORMING CAMPAIGNS (by Sessions):")
print("-" * 80)
for i, (_, row) in enumerate(top_5.iterrows(), 1):
    print(f"{i}. {row['Utm campaign']}")
    print(f"   Sessions: {int(row['Sessions']):,} | Checkouts: {int(row['Sessions that reached checkout'])} | Cart Rate: {row['Cart Addition Rate']:.1f}%")
    print()

print(f"BOTTOM 5 PERFORMING CAMPAIGNS:")
print("-" * 80)
bottom_5_rev = bottom_5.iloc[::-1]
for i, (_, row) in enumerate(bottom_5_rev.iterrows(), 1):
    issues = []
    if row['Sessions'] <= 1:
        issues.append("Minimal Traffic")
    if row['Cart Addition Rate'] == 0:
        issues.append("Zero Conversions")
    if row['Average session duration'] < 30:
        issues.append("Poor Engagement")
    
    issue_text = ", ".join(issues) if issues else "Underperforming"
    
    print(f"{len(campaign_summary) - i + 1}. {row['Utm campaign']}")
    print(f"   Sessions: {int(row['Sessions'])} | Issues: {issue_text}")
    print()

# Campaign type analysis
def categorize_campaign(name):
    name_lower = name.lower()
    if 'pmax' in name_lower:
        return 'Google Performance Max'
    elif 'brand' in name_lower:
        return 'Brand Search'
    elif 'tof' in name_lower:
        return 'Top of Funnel'
    elif 'bof' in name_lower or 'dpa' in name_lower:
        return 'Bottom of Funnel/Retargeting'
    elif 'mof' in name_lower:
        return 'Middle of Funnel'
    else:
        return 'Other'

campaign_summary['Type'] = campaign_summary['Utm campaign'].apply(categorize_campaign)
type_breakdown = campaign_summary['Type'].value_counts()

print("CAMPAIGN TYPE BREAKDOWN:")
print("-" * 40)
for camp_type, count in type_breakdown.items():
    total_sessions = campaign_summary[campaign_summary['Type'] == camp_type]['Sessions'].sum()
    print(f"{camp_type}: {count} campaigns ({total_sessions:,} total sessions)")

print("\nEXECUTIVE RECOMMENDATIONS:")
print("-" * 40)
print("1. IMMEDIATE ACTIONS (Next 7 days):")
print("   • Scale budget for top 3 performing campaigns")
print("   • Pause campaigns with <2 sessions to reallocate budget")
print("   • Review and optimize checkout flow (low checkout rates)")

print("\n2. MEDIUM-TERM OPTIMIZATIONS (Next 30 days):")
print("   • Focus retargeting efforts on high-traffic, low-conversion campaigns")
print("   • Test new creative for underperforming campaign types")
print("   • Implement session duration optimization for engagement")

print("\n3. STRATEGIC INSIGHTS:")
avg_top_sessions = top_5['Sessions'].mean()
avg_bottom_sessions = bottom_5['Sessions'].mean()
print(f"   • Performance gap: Top campaigns average {avg_top_sessions:.0f} sessions vs {avg_bottom_sessions:.0f} for bottom")
print(f"   • High-ticket jewelry requires sustained engagement and retargeting")
print(f"   • Focus on quality traffic over quantity for luxury positioning")

# Save detailed results
campaign_summary.to_csv('/Users/shivangpatel/Documents/GitHub/crtx.in/campaign_analysis_results.csv', index=False)
print(f"\nDetailed campaign analysis saved to: campaign_analysis_results.csv")

exec(open('/Users/shivangpatel/Documents/GitHub/crtx.in/quick_campaign_analysis.py').read())