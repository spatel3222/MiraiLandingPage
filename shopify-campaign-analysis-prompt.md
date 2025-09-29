# Shopify Campaign Performance Analysis Prompt

## Objective
Analyze Shopify export data to identify which specific campaigns are driving conversions and revenue for vibewithmoi.com (high-ticket e-commerce). Focus exclusively on hard conversion data to determine campaign-level performance and provide actionable optimization insights.

## Analysis Framework

### 1. Data Quality Assessment
- Verify presence of campaign tracking columns (UTM parameters, referral sources, campaign names)
- Identify date range and data completeness
- Check for order value, quantity, and customer identification data
- Note any missing or incomplete tracking information

### 2. Campaign Performance Identification

#### Core Conversion Metrics (Primary Focus)
- **Orders by Campaign**: Count of completed orders per campaign
- **Revenue by Campaign**: Total revenue generated per campaign  
- **Average Order Value (AOV)**: Revenue divided by order count per campaign
- **Conversion Rate**: Orders divided by unique visitors (if traffic data available)

#### Campaign Attribution Analysis
- Map orders to specific campaigns using available tracking data:
  - UTM campaign parameters
  - Referral sources
  - Landing page data
  - Campaign tags or identifiers
- Handle multi-touch attribution when possible
- Flag orders with unclear campaign attribution

### 3. Performance Benchmarking

Create comparison tables showing:

| Campaign Date | Campaign Name/Source | Orders | Revenue | AOV | Performance Level |
|---------------|---------------------|---------|---------|-----|------------------|
| [Date] | [Campaign] | [Count] | [Amount] | [Value] | Winner/Neutral/Failure |

Performance Classifications:
- **Winners**: Campaigns with 3+ orders OR revenue >$X (define threshold)
- **Neutral**: Campaigns with 1-2 orders OR moderate engagement
- **Failures**: Campaigns with 0 orders despite reasonable time window

### 4. Historical Pattern Analysis

#### Time-Based Performance
- Daily/weekly campaign performance trends
- Seasonal patterns affecting conversion rates
- Time-to-conversion analysis post-campaign launch

#### Campaign Type Effectiveness
- Email campaigns vs. social media vs. paid ads vs. organic
- Content type performance (if identifiable)
- Audience segment performance (if data available)

### 5. Actionable Insights Generation

For each analysis section, provide:

#### Winner Campaign Analysis
- What made successful campaigns convert?
- Common characteristics of high-performing campaigns
- Scalability recommendations for proven winners

#### Failure Campaign Analysis  
- Why did certain campaigns fail to convert?
- Was it timing, audience, messaging, or technical issues?
- Clear recommendations for improvement or discontinuation

#### Optimization Opportunities
- Campaigns showing potential but needing refinement
- Budget reallocation recommendations
- A/B testing suggestions for underperforming campaigns

## Critical Analysis Rules

### Focus on Hard Data Only
- **Use**: Order data, revenue data, transaction timestamps
- **Avoid**: Assumptions about user behavior, engagement metrics without conversions
- **Validate**: All insights with actual conversion data

### Campaign Attribution Standards
- Prioritize last-click attribution when multiple touchpoints exist
- Clearly note when attribution is unclear or estimated
- Separate organic/direct traffic from campaign-driven traffic

### Statistical Significance
- Account for campaign duration and reach when comparing performance
- Note when sample sizes are too small for reliable conclusions
- Distinguish between statistical trends and random fluctuations

## Output Requirements

### Executive Summary Table
| Metric | Value | Insight |
|--------|-------|---------|
| Total Campaigns Analyzed | [Number] | [Period covered] |
| Winning Campaigns | [Number] | [Performance criteria] |
| Failed Campaigns | [Number] | [Failure criteria] |
| Total Revenue Attributed | [Amount] | [Campaign-driven revenue] |
| Top Performing Campaign | [Name/Date] | [Orders and revenue] |

### Detailed Campaign Performance Matrix
[Include full performance breakdown with specific recommendations]

### Strategic Recommendations
1. **Immediate Actions** (next 7 days)
2. **Short-term Optimizations** (next 30 days)  
3. **Long-term Campaign Strategy** (next 90 days)

## Data Requirements Checklist

Ensure the following columns are present and analyzed:
- [ ] Order date/timestamp
- [ ] Order value/revenue
- [ ] Campaign source/medium
- [ ] UTM parameters (if available)
- [ ] Customer ID (for repeat purchase analysis)
- [ ] Product information (for high-ticket analysis)
- [ ] Geographic data (if relevant)

## Success Metrics for Analysis

The analysis should deliver:
- Clear identification of top 3 performing campaigns
- Specific failure reasons for 0-order campaigns
- ROI calculations for campaign performance
- Concrete optimization recommendations with expected impact
- Campaign attribution confidence levels

## File Organization
Follow CRTX.in standards:
- Save analysis in `03_Reports_Final/shopify_campaign_analysis_[date].md`
- Export key data tables to `05_CSV_Outputs/campaign_performance_data.csv`
- Store visualizations in `04_Visualizations/campaign_charts/`

---

*This prompt focuses on conversion-driven analysis for vibewithmoi.com's high-ticket e-commerce campaigns, following CRTX.in's data-first methodology and quality standards.*