-- MOI Analytics Dashboard - Complete Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create all required tables

-- Create Meta Ads Data Table
CREATE TABLE IF NOT EXISTS meta_ads_data (
    id BIGSERIAL PRIMARY KEY,
    reporting_ends DATE NOT NULL,
    campaign_name TEXT NOT NULL,
    ad_set_name TEXT,
    amount_spent_inr DECIMAL(10,2) DEFAULT 0,
    source TEXT DEFAULT 'meta' CHECK (source IN ('meta', 'google', 'shopify')),
    raw_data JSONB,
    import_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Google Ads Data Table
CREATE TABLE IF NOT EXISTS google_ads_data (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL,
    campaign TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    ctr TEXT,
    source TEXT DEFAULT 'google' CHECK (source IN ('meta', 'google', 'shopify')),
    raw_data JSONB,
    import_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Shopify Data Table
CREATE TABLE IF NOT EXISTS shopify_data (
    id BIGSERIAL PRIMARY KEY,
    day DATE NOT NULL,
    utm_campaign TEXT,
    online_store_visitors INTEGER DEFAULT 0,
    source TEXT DEFAULT 'shopify' CHECK (source IN ('meta', 'google', 'shopify')),
    raw_data JSONB,
    import_batch_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Import Batches Table for tracking imports
CREATE TABLE IF NOT EXISTS import_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('meta', 'google', 'shopify')),
    file_name TEXT,
    records_imported INTEGER DEFAULT 0,
    duplicates_found INTEGER DEFAULT 0,
    errors_encountered INTEGER DEFAULT 0,
    import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    date_range_start DATE,
    date_range_end DATE,
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meta_ads_reporting_ends ON meta_ads_data(reporting_ends);
CREATE INDEX IF NOT EXISTS idx_meta_ads_campaign ON meta_ads_data(campaign_name);
CREATE INDEX IF NOT EXISTS idx_meta_ads_batch ON meta_ads_data(import_batch_id);

CREATE INDEX IF NOT EXISTS idx_google_ads_date ON google_ads_data(date);
CREATE INDEX IF NOT EXISTS idx_google_ads_campaign ON google_ads_data(campaign);
CREATE INDEX IF NOT EXISTS idx_google_ads_batch ON google_ads_data(import_batch_id);

CREATE INDEX IF NOT EXISTS idx_shopify_day ON shopify_data(day);
CREATE INDEX IF NOT EXISTS idx_shopify_campaign ON shopify_data(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_shopify_batch ON shopify_data(import_batch_id);

CREATE INDEX IF NOT EXISTS idx_import_batches_date ON import_batches(import_date);
CREATE INDEX IF NOT EXISTS idx_import_batches_source ON import_batches(source_type);

-- Enable Row Level Security (RLS)
ALTER TABLE meta_ads_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_ads_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all operations for now - adjust based on your auth needs)
CREATE POLICY "Allow all operations on meta_ads_data" ON meta_ads_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on google_ads_data" ON google_ads_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shopify_data" ON shopify_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on import_batches" ON import_batches FOR ALL USING (true) WITH CHECK (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_meta_ads_data_updated_at BEFORE UPDATE ON meta_ads_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_ads_data_updated_at BEFORE UPDATE ON google_ads_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopify_data_updated_at BEFORE UPDATE ON shopify_data 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for unified data aggregation across all sources
CREATE OR REPLACE VIEW unified_campaign_data AS
WITH meta_campaigns AS (
    SELECT 
        reporting_ends as date,
        campaign_name as campaign,
        'Meta' as source,
        amount_spent_inr as spend,
        0 as visitors,
        0 as clicks,
        0 as impressions,
        0 as conversions,
        import_batch_id
    FROM meta_ads_data
),
google_campaigns AS (
    SELECT 
        date,
        campaign,
        'Google' as source,
        cost as spend,
        0 as visitors,
        clicks,
        impressions,
        conversions,
        import_batch_id
    FROM google_ads_data
),
shopify_campaigns AS (
    SELECT 
        day as date,
        COALESCE(utm_campaign, 'Direct') as campaign,
        'Shopify' as source,
        0 as spend,
        online_store_visitors as visitors,
        0 as clicks,
        0 as impressions,
        0 as conversions,
        import_batch_id
    FROM shopify_data
)
SELECT * FROM meta_campaigns
UNION ALL
SELECT * FROM google_campaigns
UNION ALL
SELECT * FROM shopify_campaigns
ORDER BY date DESC, campaign;

-- Insert some sample data for testing (optional - remove if not needed)
-- INSERT INTO meta_ads_data (reporting_ends, campaign_name, ad_set_name, amount_spent_inr) 
-- VALUES ('2024-09-29', 'Sample Campaign', 'Sample Ad Set', 100.50);

-- INSERT INTO google_ads_data (date, campaign, cost, clicks, impressions, conversions, ctr) 
-- VALUES ('2024-09-29', 'Sample Google Campaign', 75.25, 25, 1000, 2, '2.5%');

-- INSERT INTO shopify_data (day, utm_campaign, online_store_visitors) 
-- VALUES ('2024-09-29', 'Sample Campaign', 150);

-- Check table creation
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('meta_ads_data', 'google_ads_data', 'shopify_data', 'import_batches')
ORDER BY table_name, ordinal_position;