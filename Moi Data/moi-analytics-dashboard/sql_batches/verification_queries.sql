-- ================================================================
-- MOI Analytics Dashboard - Complete Data Verification Queries
-- ================================================================
-- Generated: November 2, 2024
-- Purpose: Verify successful ingestion of all three data sources
-- Expected Total Records: 37,856 (Google: 2,309 + Meta: 34,547 + Shopify: 1,000)
-- Ref Parameter: nbclorobfotxrpbmyapi
-- ================================================================

-- 1. RECORD COUNT VERIFICATION
-- ================================================================
-- Check total records in each table with ref parameter filtering

SELECT 
    'SUMMARY' as check_type,
    'Record Count Verification' as description,
    CURRENT_TIMESTAMP as verified_at;

SELECT 
    'meta_raw_data' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN ref_parameter = 'nbclorobfotxrpbmyapi' THEN 1 END) as ref_filtered_records,
    MIN(processed_at) as earliest_record,
    MAX(processed_at) as latest_record
FROM meta_raw_data

UNION ALL

SELECT 
    'shopify_raw_data' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN ref_parameter = 'nbclorobfotxrpbmyapi' THEN 1 END) as ref_filtered_records,
    MIN(processed_at) as earliest_record,
    MAX(processed_at) as latest_record
FROM shopify_raw_data

UNION ALL

SELECT 
    'google_raw_data' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN ref_parameter = 'nbclorobfotxrpbmyapi' THEN 1 END) as ref_filtered_records,
    MIN(processed_at) as earliest_record,
    MAX(processed_at) as latest_record
FROM google_raw_data;

-- 2. EXPECTED VS ACTUAL COMPARISON
-- ================================================================
WITH expected_counts AS (
    SELECT 'meta_raw_data' as table_name, 34547 as expected_records
    UNION ALL
    SELECT 'shopify_raw_data' as table_name, 1000 as expected_records
    UNION ALL
    SELECT 'google_raw_data' as table_name, 2309 as expected_records
),
actual_counts AS (
    SELECT 'meta_raw_data' as table_name, COUNT(*) as actual_records
    FROM meta_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
    UNION ALL
    SELECT 'shopify_raw_data' as table_name, COUNT(*) as actual_records
    FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
    UNION ALL
    SELECT 'google_raw_data' as table_name, COUNT(*) as actual_records
    FROM google_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
)
SELECT 
    e.table_name,
    e.expected_records,
    COALESCE(a.actual_records, 0) as actual_records,
    CASE 
        WHEN COALESCE(a.actual_records, 0) = e.expected_records THEN '✅ MATCH'
        WHEN COALESCE(a.actual_records, 0) > e.expected_records THEN '⚠️  EXCESS'
        ELSE '❌ MISSING'
    END as status,
    COALESCE(a.actual_records, 0) - e.expected_records as variance
FROM expected_counts e
LEFT JOIN actual_counts a ON e.table_name = a.table_name
ORDER BY e.table_name;

-- 3. DATA QUALITY CHECKS
-- ================================================================

-- Check for NULL values in critical fields
SELECT 
    'DATA_QUALITY' as check_type,
    'Meta Data NULL Check' as description,
    COUNT(*) as total_records,
    COUNT(CASE WHEN reporting_starts IS NULL THEN 1 END) as null_dates,
    COUNT(CASE WHEN campaign_name IS NULL OR campaign_name = '' THEN 1 END) as null_campaigns,
    COUNT(CASE WHEN amount_spent_inr IS NULL THEN 1 END) as null_spend,
    COUNT(CASE WHEN ref_parameter IS NULL OR ref_parameter != 'nbclorobfotxrpbmyapi' THEN 1 END) as invalid_ref
FROM meta_raw_data;

SELECT 
    'DATA_QUALITY' as check_type,
    'Shopify Data NULL Check' as description,
    COUNT(*) as total_records,
    COUNT(CASE WHEN day IS NULL THEN 1 END) as null_dates,
    COUNT(CASE WHEN utm_campaign IS NULL OR utm_campaign = '' THEN 1 END) as null_campaigns,
    COUNT(CASE WHEN online_store_visitors IS NULL THEN 1 END) as null_visitors,
    COUNT(CASE WHEN ref_parameter IS NULL OR ref_parameter != 'nbclorobfotxrpbmyapi' THEN 1 END) as invalid_ref
FROM shopify_raw_data;

SELECT 
    'DATA_QUALITY' as check_type,
    'Google Data NULL Check' as description,
    COUNT(*) as total_records,
    COUNT(CASE WHEN date IS NULL THEN 1 END) as null_dates,
    COUNT(CASE WHEN campaign_name IS NULL OR campaign_name = '' THEN 1 END) as null_campaigns,
    COUNT(CASE WHEN cost_micros IS NULL THEN 1 END) as null_cost,
    COUNT(CASE WHEN ref_parameter IS NULL OR ref_parameter != 'nbclorobfotxrpbmyapi' THEN 1 END) as invalid_ref
FROM google_raw_data;

-- 4. SAMPLE DATA VERIFICATION
-- ================================================================

-- Show sample records from each table
SELECT 'SAMPLE_DATA' as check_type, 'Meta Sample Records' as description;
SELECT reporting_starts, campaign_name, ad_set_name, amount_spent_inr, ref_parameter, processed_at
FROM meta_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
ORDER BY processed_at DESC 
LIMIT 5;

SELECT 'SAMPLE_DATA' as check_type, 'Shopify Sample Records' as description;
SELECT day, utm_campaign, utm_term, online_store_visitors, pageviews, ref_parameter, processed_at
FROM shopify_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
ORDER BY processed_at DESC 
LIMIT 5;

SELECT 'SAMPLE_DATA' as check_type, 'Google Sample Records' as description;
SELECT date, campaign_name, ad_group_name, cost_micros, ref_parameter, processed_at
FROM google_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi'
ORDER BY processed_at DESC 
LIMIT 5;

-- 5. ANALYTICS READINESS TEST
-- ================================================================

-- Cross-platform performance overview
SELECT 
    'ANALYTICS_TEST' as check_type,
    'Cross-Platform Performance' as description;

SELECT 
    'Meta' as platform,
    COUNT(*) as campaigns,
    SUM(amount_spent_inr) as total_spend_inr,
    AVG(amount_spent_inr) as avg_spend_inr,
    MIN(reporting_starts) as earliest_date,
    MAX(reporting_starts) as latest_date
FROM meta_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi'

UNION ALL

SELECT 
    'Google' as platform,
    COUNT(*) as campaigns,
    SUM(cost_micros::decimal / 1000000) as total_spend_inr,
    AVG(cost_micros::decimal / 1000000) as avg_spend_inr,
    MIN(date) as earliest_date,
    MAX(date) as latest_date
FROM google_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi'

UNION ALL

SELECT 
    'Shopify' as platform,
    COUNT(*) as sessions,
    NULL as total_spend_inr,
    NULL as avg_spend_inr,
    MIN(day) as earliest_date,
    MAX(day) as latest_date
FROM shopify_raw_data 
WHERE ref_parameter = 'nbclorobfotxrpbmyapi';

-- 6. INDEX VERIFICATION
-- ================================================================

-- Check that all expected indexes exist
SELECT 
    'INDEX_CHECK' as check_type,
    'Index Verification' as description,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('meta_raw_data', 'shopify_raw_data', 'google_raw_data')
ORDER BY tablename, indexname;

-- 7. FINAL SUMMARY
-- ================================================================

SELECT 
    'FINAL_SUMMARY' as check_type,
    'Complete Ingestion Summary' as description,
    CURRENT_TIMESTAMP as summary_timestamp;

WITH totals AS (
    SELECT 
        (SELECT COUNT(*) FROM meta_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi') as meta_records,
        (SELECT COUNT(*) FROM shopify_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi') as shopify_records,
        (SELECT COUNT(*) FROM google_raw_data WHERE ref_parameter = 'nbclorobfotxrpbmyapi') as google_records
)
SELECT 
    meta_records,
    shopify_records,
    google_records,
    (meta_records + shopify_records + google_records) as total_records,
    CASE 
        WHEN (meta_records + shopify_records + google_records) = 37856 THEN '🎉 COMPLETE SUCCESS'
        WHEN (meta_records + shopify_records + google_records) > 35000 THEN '✅ SUBSTANTIAL SUCCESS'
        ELSE '⚠️  PARTIAL SUCCESS'
    END as ingestion_status
FROM totals;

-- Expected Results Summary:
-- Meta Records: 34,547
-- Shopify Records: 1,000  
-- Google Records: 2,309
-- Total Expected: 37,856 records