# MOI Analytics - AdSet Matrices (Last 7 Days)

## Executive Summary
This notebook provides campaign and ad set level performance analysis for MOI's marketing campaigns across Meta and attributed Shopify data for the last 7 days, enabling tactical optimization decisions.

## Data Sources
- **Meta Advertising Data**: Campaign, Ad Set, and Ad performance
- **Shopify Analytics**: Individual session data attributed to Meta campaigns via UTM parameters
- **Attribution Logic**: UTM_campaign → Campaign name, UTM_term → Ad Set name

## Key Metrics Calculated

### ✅ Available Metrics Per AdSet
| Metric | Source | Calculation |
|--------|--------|-------------|
| Date | Meta/Shopify | Daily grouping |
| Campaign Name | Meta Raw Data | campaign_name |
| Ad Set Name | Meta Raw Data | ad_set_name |
| Ad Set Delivery | Meta Raw Data | Assumed 'active' (field not in current schema) |
| Spent | Meta Raw Data | SUM(amount_spent_inr) |
| CTR | Meta Raw Data | AVG(ctr_link_click_through_rate) |
| Cost per User | Calculated | Spent / Users (where Users > 0) |
| Users | Shopify Attribution | COUNT(online_store_visitors = 1) WHERE utm_campaign = campaign_name AND utm_term = ad_set_name |
| ATC | Shopify Attribution | COUNT(sessions_with_cart_additions = 1) WHERE utm matches |
| Reached Checkout | Shopify Attribution | COUNT(sessions_reached_checkout = 1) WHERE utm matches |
| Conversions | Shopify Attribution | COUNT(sessions_completed_checkout = 1) WHERE utm matches |
| Average Session Duration | Shopify Attribution | AVG(average_session_duration) WHERE utm matches |
| Cost per 1 min User | Calculated | Spent / Users with Session > 1min |
| 1min User/Total Users (%) | Calculated | (Users with Session > 1min / Total Users) * 100 |
| Users with Session above 1 min | Shopify Attribution | COUNT(*) WHERE average_session_duration >= 60 AND utm matches |
| ATC with session duration above 1 min | Shopify Attribution | COUNT(*) WHERE sessions_with_cart_additions = 1 AND average_session_duration >= 60 AND utm matches |
| Reached Checkout with session duration above 1 min | Shopify Attribution | COUNT(*) WHERE sessions_reached_checkout = 1 AND average_session_duration >= 60 AND utm matches |
| Users with Above 5 page views and above 1 min | Shopify Attribution | COUNT(*) WHERE pageviews >= 5 AND average_session_duration >= 60 AND utm matches |

### ⚠️ Data Limitations
| Metric | Status | Notes |
|--------|--------|-------|
| Ad Set Delivery | Assumed Active | Field not in current Meta schema |
| Cost per User | Dependent on Attribution | Requires successful UTM mapping |

## SQL Query for Data Extraction

```sql
-- AdSet Matrices for Last 7 Days with Attribution
WITH date_filter AS (
  SELECT CURRENT_DATE - INTERVAL '7 days' AS start_date,
         CURRENT_DATE AS end_date
),
meta_adset_performance AS (
  SELECT 
    reporting_starts::date as date,
    campaign_name,
    ad_set_name,
    SUM(amount_spent_inr) as spent,
    AVG(ctr_link_click_through_rate) as ctr,
    'active' as ad_set_delivery  -- Assumed active
  FROM meta_raw_data
  WHERE reporting_starts::date >= (SELECT start_date FROM date_filter)
    AND reporting_starts::date <= (SELECT end_date FROM date_filter)
  GROUP BY reporting_starts::date, campaign_name, ad_set_name
),
shopify_attributed AS (
  SELECT 
    day as date,
    utm_campaign as campaign_name,
    utm_term as ad_set_name,
    COUNT(CASE WHEN online_store_visitors = 1 THEN 1 END) as users,
    COUNT(CASE WHEN sessions_with_cart_additions = 1 THEN 1 END) as atc,
    COUNT(CASE WHEN sessions_reached_checkout = 1 THEN 1 END) as reached_checkout,
    COUNT(CASE WHEN sessions_completed_checkout = 1 THEN 1 END) as conversions,
    AVG(average_session_duration) as avg_session_duration,
    COUNT(CASE WHEN average_session_duration >= 60 THEN 1 END) as users_session_above_1min,
    COUNT(CASE WHEN sessions_with_cart_additions = 1 AND average_session_duration >= 60 THEN 1 END) as atc_session_above_1min,
    COUNT(CASE WHEN sessions_reached_checkout = 1 AND average_session_duration >= 60 THEN 1 END) as reached_checkout_session_above_1min,
    COUNT(CASE WHEN pageviews >= 5 AND average_session_duration >= 60 THEN 1 END) as users_5plus_pageviews_1min
  FROM shopify_raw_data
  WHERE day >= (SELECT start_date FROM date_filter)
    AND day <= (SELECT end_date FROM date_filter)
    AND utm_campaign IS NOT NULL 
    AND utm_term IS NOT NULL
  GROUP BY day, utm_campaign, utm_term
)
SELECT 
  mp.date,
  mp.campaign_name,
  mp.ad_set_name,
  mp.ad_set_delivery,
  mp.spent,
  mp.ctr,
  -- Cost per user calculation
  CASE 
    WHEN COALESCE(sa.users, 0) > 0 THEN ROUND(mp.spent / sa.users, 2)
    ELSE NULL 
  END as cost_per_user,
  COALESCE(sa.users, 0) as users,
  COALESCE(sa.atc, 0) as atc,
  COALESCE(sa.reached_checkout, 0) as reached_checkout,
  COALESCE(sa.conversions, 0) as conversions,
  COALESCE(sa.avg_session_duration, 0) as average_session_duration,
  -- Cost per 1 min user calculation
  CASE 
    WHEN COALESCE(sa.users_session_above_1min, 0) > 0 THEN ROUND(mp.spent / sa.users_session_above_1min, 2)
    ELSE NULL 
  END as cost_per_1min_user,
  -- 1min user percentage calculation
  CASE 
    WHEN COALESCE(sa.users, 0) > 0 THEN ROUND((sa.users_session_above_1min::float / sa.users::float) * 100, 2)
    ELSE 0 
  END as one_min_user_percentage,
  COALESCE(sa.users_session_above_1min, 0) as users_with_session_above_1min,
  COALESCE(sa.atc_session_above_1min, 0) as atc_with_session_duration_above_1min,
  COALESCE(sa.reached_checkout_session_above_1min, 0) as reached_checkout_with_session_duration_above_1min,
  COALESCE(sa.users_5plus_pageviews_1min, 0) as users_with_above_5_pageviews_and_above_1min
FROM meta_adset_performance mp
LEFT JOIN shopify_attributed sa ON mp.date = sa.date 
  AND mp.campaign_name = sa.campaign_name 
  AND mp.ad_set_name = sa.ad_set_name
ORDER BY mp.date DESC, mp.spent DESC;
```

## Attribution Quality Analysis

### UTM Mapping Success Rate
```sql
-- Check attribution mapping success
WITH utm_analysis AS (
  SELECT 
    COUNT(*) as total_shopify_sessions,
    COUNT(CASE WHEN utm_campaign IS NOT NULL THEN 1 END) as sessions_with_utm_campaign,
    COUNT(CASE WHEN utm_term IS NOT NULL THEN 1 END) as sessions_with_utm_term,
    COUNT(CASE WHEN utm_campaign IS NOT NULL AND utm_term IS NOT NULL THEN 1 END) as sessions_fully_attributed
  FROM shopify_raw_data
  WHERE day >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
  total_shopify_sessions,
  sessions_with_utm_campaign,
  sessions_with_utm_term,
  sessions_fully_attributed,
  ROUND((sessions_fully_attributed::float / total_shopify_sessions::float) * 100, 2) as attribution_success_rate_percent
FROM utm_analysis;
```

## Performance Insights

### Key Metrics to Monitor
1. **Cost Efficiency**: Cost per User vs Cost per 1min User
2. **Engagement Quality**: 1min User Percentage  
3. **Conversion Funnel**: Users → ATC → Reached Checkout → Conversions
4. **Attribution Coverage**: UTM mapping success rate

### Optimization Opportunities
- **High Cost per User**: Review targeting and creative performance
- **Low 1min User %**: Improve ad creative and landing page relevance
- **High ATC, Low Checkout**: Optimize checkout flow
- **Low Attribution Rate**: Standardize UTM parameter usage

## Data Quality Notes

### ✅ High Confidence Metrics
- **Meta Spend & CTR**: Direct from advertising platform
- **Session Behavior**: Individual session tracking provides accurate calculations
- **Attribution Logic**: UTM-based attribution following standard practices

### ⚠️ Monitoring Required
- **UTM Consistency**: Requires ongoing validation between Meta and Shopify
- **Attribution Gaps**: Some sessions may not have UTM parameters
- **Time Zone Alignment**: Ensure consistent date handling across platforms

### 🔍 Recommendations
1. **UTM Standardization**: Implement consistent naming conventions
2. **Attribution Validation**: Regular spot-checks of campaign attribution
3. **Performance Thresholds**: Set benchmarks for cost per user and engagement metrics
4. **Daily Monitoring**: Track attribution success rate daily

## Usage Instructions

1. **Run Attribution Query**: Execute UTM mapping analysis first
2. **Review Data Quality**: Check attribution success rate
3. **Execute Main Query**: Get adset performance with attribution
4. **Export Results**: Save as CSV for campaign optimization
5. **Set Alerts**: Monitor for attribution rate drops

## Related Notebooks
- [Top Matrices](./01_Top_Matrices_Last_7_Days.md): Daily high-level performance overview
- [Ad-level Matrices](./03_Ad_Level_Matrices_Last_7_Days.md): Individual ad performance analysis

---
*Generated: November 1, 2025*  
*Data Source: MOI Analytics Database with UTM Attribution*  
*Query Scope: Last 7 days*