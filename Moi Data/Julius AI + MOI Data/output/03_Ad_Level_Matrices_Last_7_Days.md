# MOI Analytics - Ad-level Matrices (Last 7 Days)

## Executive Summary
This notebook provides individual ad performance analysis for MOI's marketing campaigns across Meta with attributed Shopify data for the last 7 days, enabling granular ad optimization and creative performance assessment.

## Data Sources
- **Meta Advertising Data**: Individual ad performance with campaign and ad set context
- **Shopify Analytics**: Individual session data attributed to specific ads via UTM parameters
- **Attribution Logic**: UTM_campaign → Campaign name, UTM_term → Ad Set name, UTM_content → Ad name

## Key Metrics Calculated

### ✅ Available Metrics Per Ad
| Metric | Source | Calculation |
|--------|--------|-------------|
| Date | Meta/Shopify | Daily grouping |
| Campaign Name | Meta Raw Data | campaign_name |
| Ad Set Name | Meta Raw Data | ad_set_name |
| Ad Name | Meta Raw Data | ad_name |
| Ad Set Delivery | Meta Raw Data | Assumed 'active' (field not in current schema) |
| Spent | Meta Raw Data | SUM(amount_spent_inr) |
| CTR | Meta Raw Data | AVG(ctr_link_click_through_rate) |
| Cost per User | Calculated | Spent / Users (where Users > 0) |
| Users | Shopify Attribution | COUNT(online_store_visitors = 1) WHERE utm_campaign = campaign_name AND utm_term = ad_set_name AND utm_content = ad_name |
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

## SQL Query for Data Extraction

```sql
-- Ad-level Matrices for Last 7 Days with Full Attribution
WITH date_filter AS (
  SELECT CURRENT_DATE - INTERVAL '7 days' AS start_date,
         CURRENT_DATE AS end_date
),
meta_ad_performance AS (
  SELECT 
    reporting_starts::date as date,
    campaign_name,
    ad_set_name,
    ad_name,
    SUM(amount_spent_inr) as spent,
    AVG(ctr_link_click_through_rate) as ctr,
    AVG(cpm_cost_per_1000_impressions) as cpm,
    'active' as ad_set_delivery  -- Assumed active
  FROM meta_raw_data
  WHERE reporting_starts::date >= (SELECT start_date FROM date_filter)
    AND reporting_starts::date <= (SELECT end_date FROM date_filter)
  GROUP BY reporting_starts::date, campaign_name, ad_set_name, ad_name
),
shopify_ad_attributed AS (
  SELECT 
    day as date,
    utm_campaign as campaign_name,
    utm_term as ad_set_name,
    utm_content as ad_name,
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
    AND utm_content IS NOT NULL
  GROUP BY day, utm_campaign, utm_term, utm_content
)
SELECT 
  mp.date,
  mp.campaign_name,
  mp.ad_set_name,
  mp.ad_name,
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
FROM meta_ad_performance mp
LEFT JOIN shopify_ad_attributed sa ON mp.date = sa.date 
  AND mp.campaign_name = sa.campaign_name 
  AND mp.ad_set_name = sa.ad_set_name
  AND mp.ad_name = sa.ad_name
ORDER BY mp.date DESC, mp.spent DESC;
```

## Advanced Attribution Analysis

### Full UTM Attribution Coverage
```sql
-- Check ad-level attribution mapping success
WITH utm_ad_analysis AS (
  SELECT 
    COUNT(*) as total_shopify_sessions,
    COUNT(CASE WHEN utm_campaign IS NOT NULL THEN 1 END) as sessions_with_campaign,
    COUNT(CASE WHEN utm_term IS NOT NULL THEN 1 END) as sessions_with_adset,
    COUNT(CASE WHEN utm_content IS NOT NULL THEN 1 END) as sessions_with_ad,
    COUNT(CASE WHEN utm_campaign IS NOT NULL AND utm_term IS NOT NULL AND utm_content IS NOT NULL THEN 1 END) as sessions_fully_attributed_to_ads
  FROM shopify_raw_data
  WHERE day >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
  total_shopify_sessions,
  sessions_with_campaign,
  sessions_with_adset, 
  sessions_with_ad,
  sessions_fully_attributed_to_ads,
  ROUND((sessions_fully_attributed_to_ads::float / total_shopify_sessions::float) * 100, 2) as ad_level_attribution_rate_percent
FROM utm_ad_analysis;
```

### Creative Performance Ranking
```sql
-- Top performing ads by engagement quality
WITH ad_performance_ranked AS (
  SELECT 
    mp.campaign_name,
    mp.ad_set_name,
    mp.ad_name,
    mp.spent,
    mp.ctr,
    COALESCE(sa.users, 0) as users,
    CASE 
      WHEN COALESCE(sa.users, 0) > 0 THEN ROUND((sa.users_session_above_1min::float / sa.users::float) * 100, 2)
      ELSE 0 
    END as engagement_quality_percentage,
    CASE 
      WHEN COALESCE(sa.users, 0) > 0 THEN ROUND(mp.spent / sa.users, 2)
      ELSE NULL 
    END as cost_per_user,
    COALESCE(sa.conversions, 0) as conversions
  FROM meta_ad_performance mp
  LEFT JOIN shopify_ad_attributed sa ON mp.campaign_name = sa.campaign_name 
    AND mp.ad_set_name = sa.ad_set_name
    AND mp.ad_name = sa.ad_name
  WHERE mp.date >= CURRENT_DATE - INTERVAL '7 days'
)
SELECT 
  campaign_name,
  ad_set_name,
  ad_name,
  spent,
  ctr,
  users,
  engagement_quality_percentage,
  cost_per_user,
  conversions,
  -- Performance score calculation
  CASE 
    WHEN users >= 10 THEN 
      ROUND(
        (engagement_quality_percentage * 0.4) + 
        (CASE WHEN cost_per_user IS NOT NULL THEN GREATEST(0, 100 - cost_per_user) ELSE 0 END * 0.3) +
        (ctr * 10 * 0.3), 2
      )
    ELSE 0
  END as performance_score
FROM ad_performance_ranked
WHERE users > 0
ORDER BY performance_score DESC, spent DESC;
```

## Creative Insights Analysis

### Ad Creative Categories
- **Analyze ad names** for pattern recognition
- **Creative themes**: Product focus, emotional hooks, promotional offers
- **Performance correlation**: Creative type vs engagement metrics

### Performance Segmentation
```sql
-- Segment ads by performance tiers
WITH ad_segments AS (
  SELECT 
    *,
    CASE 
      WHEN one_min_user_percentage >= 70 AND cost_per_user <= 50 THEN 'High Performer'
      WHEN one_min_user_percentage >= 50 AND cost_per_user <= 100 THEN 'Good Performer' 
      WHEN one_min_user_percentage >= 30 OR cost_per_user <= 150 THEN 'Average Performer'
      ELSE 'Needs Optimization'
    END as performance_tier
  FROM (/* Main ad performance query */)
)
SELECT 
  performance_tier,
  COUNT(*) as ad_count,
  AVG(spent) as avg_spend,
  AVG(one_min_user_percentage) as avg_engagement,
  AVG(cost_per_user) as avg_cost_per_user
FROM ad_segments
GROUP BY performance_tier
ORDER BY avg_engagement DESC;
```

## Optimization Recommendations

### Performance Tier Actions
1. **High Performers (70%+ engagement, ≤₹50 cost/user)**
   - Scale budget allocation
   - Use as creative templates
   - A/B test variations

2. **Good Performers (50%+ engagement, ≤₹100 cost/user)**
   - Moderate budget increase
   - Test audience expansion
   - Optimize landing pages

3. **Average Performers (30%+ engagement OR ≤₹150 cost/user)**
   - Creative refresh needed
   - Audience refinement
   - Landing page optimization

4. **Needs Optimization (<30% engagement, >₹150 cost/user)**
   - Pause or significantly reduce budget
   - Complete creative overhaul
   - Reassess targeting strategy

### Creative Optimization Framework
- **High CTR, Low Engagement**: Landing page mismatch
- **Low CTR, High Engagement**: Creative needs refresh
- **High Cost, High Conversion**: Premium audience, maintain
- **High Cost, Low Conversion**: Target optimization needed

## Data Quality Notes

### ✅ High Confidence Metrics
- **Meta Ad Data**: Complete individual ad performance
- **Session Attribution**: UTM_content enables precise ad-level attribution
- **Behavior Tracking**: Individual session data provides accurate engagement metrics

### ⚠️ Monitoring Required
- **UTM_content Consistency**: Ad name mapping between Meta and Shopify
- **Attribution Completeness**: Track ad-level attribution success rate
- **Creative Classification**: Manual categorization may be needed for insights

### 🔍 Quality Checks
1. **Daily Attribution Rate**: Monitor ad-level UTM mapping success
2. **Spend Reconciliation**: Verify total spend matches Meta platform
3. **Creative Performance**: Flag anomalous performance for review
4. **UTM Standardization**: Ensure consistent ad name formatting

## Usage Instructions

1. **Check Attribution**: Run attribution coverage analysis first
2. **Execute Main Query**: Get complete ad performance data
3. **Run Performance Ranking**: Identify top and bottom performers
4. **Segment Analysis**: Categorize ads by performance tiers
5. **Export for Action**: Create optimization task lists by performance tier

## Related Notebooks
- [Top Matrices](./01_Top_Matrices_Last_7_Days.md): Daily high-level performance overview
- [AdSet Matrices](./02_AdSet_Matrices_Last_7_Days.md): Campaign and ad set level analysis

---
*Generated: November 1, 2025*  
*Data Source: MOI Analytics Database with Full UTM Attribution*  
*Query Scope: Last 7 days*  
*Attribution Level: Individual Ad Performance*