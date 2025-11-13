# MOI Analytics - Top Matrices (Last 7 Days)

## Executive Summary
This notebook provides daily top-level performance matrices for MOI's marketing campaigns across Meta, Google, and Shopify for the last 7 days, focusing on key metrics for strategic decision-making.

## Data Sources
- **Meta Advertising Data**: Campaign spend, CTR, CPM
- **Google Advertising Data**: Campaign spend  
- **Shopify Analytics**: Individual session data enabling precise user behavior calculations

## Key Metrics Calculated

### ✅ Available Metrics
| Metric | Source | Calculation |
|--------|--------|-------------|
| Date | All Sources | Daily aggregation |
| Meta Spend | Meta Raw Data | SUM(amount_spent_inr) |
| Meta CTR | Meta Raw Data | AVG(ctr_link_click_through_rate) |
| Meta CPM | Meta Raw Data | AVG(cpm_cost_per_1000_impressions) |
| Google Spend | Google Raw Data | SUM(cost) |
| Shopify Total Users | Shopify Raw Data | COUNT(DISTINCT session) WHERE online_store_visitors = 1 |
| Shopify Total ATC | Shopify Raw Data | COUNT(*) WHERE sessions_with_cart_additions = 1 |
| Shopify Total Reached Checkout | Shopify Raw Data | COUNT(*) WHERE sessions_reached_checkout = 1 |
| Shopify Total Abandoned Checkout | Calculated | Reached Checkout - Completed Checkout |
| Shopify Session Duration | Shopify Raw Data | AVG(average_session_duration) |
| Users with Session above 1 min | Shopify Raw Data | COUNT(*) WHERE average_session_duration >= 60 |
| Users with Above 5 page views and above 1 min | Shopify Raw Data | COUNT(*) WHERE pageviews >= 5 AND average_session_duration >= 60 |
| ATC with session duration above 1 min | Shopify Raw Data | COUNT(*) WHERE sessions_with_cart_additions = 1 AND average_session_duration >= 60 |
| Reached Checkout with session duration above 1 min | Shopify Raw Data | COUNT(*) WHERE sessions_reached_checkout = 1 AND average_session_duration >= 60 |

### ⚠️ Limited Availability  
| Metric | Status | Notes |
|--------|--------|-------|
| Google CTR | Not Available | Google raw data only contains Day, Campaign, Cost |
| Google CPM | Not Available | Google raw data only contains Day, Campaign, Cost |

## SQL Query for Data Extraction

```sql
-- Top Matrices for Last 7 Days
WITH date_filter AS (
  SELECT CURRENT_DATE - INTERVAL '7 days' AS start_date,
         CURRENT_DATE AS end_date
),
daily_meta AS (
  SELECT 
    reporting_starts::date as date,
    SUM(amount_spent_inr) as meta_spend,
    AVG(ctr_link_click_through_rate) as meta_ctr,
    AVG(cpm_cost_per_1000_impressions) as meta_cpm
  FROM meta_raw_data
  WHERE reporting_starts::date >= (SELECT start_date FROM date_filter)
    AND reporting_starts::date <= (SELECT end_date FROM date_filter)
  GROUP BY reporting_starts::date
),
daily_google AS (
  SELECT 
    day as date,
    SUM(cost) as google_spend
  FROM google_raw_data
  WHERE day >= (SELECT start_date FROM date_filter)
    AND day <= (SELECT end_date FROM date_filter)
  GROUP BY day
),
daily_shopify AS (
  SELECT 
    day as date,
    COUNT(CASE WHEN online_store_visitors = 1 THEN 1 END) as shopify_total_users,
    COUNT(CASE WHEN sessions_with_cart_additions = 1 THEN 1 END) as shopify_total_atc,
    COUNT(CASE WHEN sessions_reached_checkout = 1 THEN 1 END) as shopify_total_reached_checkout,
    COUNT(CASE WHEN sessions_completed_checkout = 1 THEN 1 END) as shopify_total_completed_checkout,
    AVG(average_session_duration) as shopify_session_duration,
    COUNT(CASE WHEN average_session_duration >= 60 THEN 1 END) as users_session_above_1min,
    COUNT(CASE WHEN pageviews >= 5 AND average_session_duration >= 60 THEN 1 END) as users_5plus_pageviews_1min,
    COUNT(CASE WHEN sessions_with_cart_additions = 1 AND average_session_duration >= 60 THEN 1 END) as atc_session_above_1min,
    COUNT(CASE WHEN sessions_reached_checkout = 1 AND average_session_duration >= 60 THEN 1 END) as reached_checkout_session_above_1min
  FROM shopify_raw_data
  WHERE day >= (SELECT start_date FROM date_filter)
    AND day <= (SELECT end_date FROM date_filter)
  GROUP BY day
)
SELECT 
  COALESCE(dm.date, dg.date, ds.date) as date,
  COALESCE(dm.meta_spend, 0) as meta_spend,
  COALESCE(dm.meta_ctr, 0) as meta_ctr,
  COALESCE(dm.meta_cpm, 0) as meta_cpm,
  COALESCE(dg.google_spend, 0) as google_spend,
  'N/A' as google_ctr,  -- Not available in data
  'N/A' as google_cpm,  -- Not available in data
  COALESCE(ds.shopify_total_users, 0) as shopify_total_users,
  COALESCE(ds.shopify_total_atc, 0) as shopify_total_atc,
  COALESCE(ds.shopify_total_reached_checkout, 0) as shopify_total_reached_checkout,
  COALESCE(ds.shopify_total_reached_checkout - ds.shopify_total_completed_checkout, 0) as shopify_total_abandoned_checkout,
  COALESCE(ds.shopify_session_duration, 0) as shopify_session_duration,
  COALESCE(ds.users_session_above_1min, 0) as users_with_session_above_1min,
  COALESCE(ds.users_5plus_pageviews_1min, 0) as users_with_above_5_pageviews_and_above_1min,
  COALESCE(ds.atc_session_above_1min, 0) as atc_with_session_duration_above_1min,
  COALESCE(ds.reached_checkout_session_above_1min, 0) as reached_checkout_with_session_duration_above_1min
FROM daily_meta dm
FULL OUTER JOIN daily_google dg ON dm.date = dg.date
FULL OUTER JOIN daily_shopify ds ON COALESCE(dm.date, dg.date) = ds.date
ORDER BY date DESC;
```

## Data Quality Notes

### ✅ High Confidence Metrics
- **Meta Metrics**: Complete data with spend, CTR, and CPM
- **Google Spend**: Accurate campaign spend data
- **Shopify Session Metrics**: Individual session tracking enables precise calculations

### ⚠️ Data Limitations
- **Google CTR/CPM**: Not available in current data schema
- **Attribution Mapping**: UTM campaign mapping between platforms may have gaps

### 🔍 Recommendations
1. **Enhance Google Data**: Add CTR and CPM metrics to Google data collection
2. **UTM Standardization**: Ensure consistent UTM campaign naming across Meta and Shopify
3. **Real-time Updates**: Consider automated daily data refresh for timely insights

## Usage Instructions

1. **Run SQL Query**: Execute the provided SQL against the MOI database
2. **Export Results**: Save as CSV for further analysis
3. **Daily Review**: Use for daily performance monitoring
4. **Trend Analysis**: Compare week-over-week performance

## Related Notebooks
- [AdSet Matrices](./02_AdSet_Matrices_Last_7_Days.md): Campaign and ad set level analysis
- [Ad-level Matrices](./03_Ad_Level_Matrices_Last_7_Days.md): Individual ad performance analysis

---
*Generated: November 1, 2025*  
*Data Source: MOI Analytics Database*  
*Query Scope: Last 7 days*