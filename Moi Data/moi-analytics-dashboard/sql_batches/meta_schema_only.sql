-- ================================================================
-- MOI Analytics Dashboard - Meta Advertising Data Production Import
-- ================================================================
-- Generated: November 2, 2024
-- Source Files: 691 Meta batch files
-- Expected Records: ~34,550 Meta advertising campaign records
-- Ref Parameter: nbclorobfotxrpbmyapi
-- Table: meta_raw_data
-- ================================================================

-- Create Meta raw data table with optimized schema
CREATE TABLE IF NOT EXISTS meta_raw_data (
    id SERIAL PRIMARY KEY,
    reporting_starts DATE NOT NULL,
    campaign_name TEXT NOT NULL,
    ad_set_name TEXT NOT NULL,
    ad_name TEXT NOT NULL,
    amount_spent_inr DECIMAL(10,2) DEFAULT 0,
    cpm_cost_per_1000_impressions DECIMAL(10,8) DEFAULT 0,
    ctr_link_click_through_rate DECIMAL(10,8) DEFAULT 0,
    ref_parameter TEXT DEFAULT 'nbclorobfotxrpbmyapi',
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_meta_record UNIQUE(reporting_starts, campaign_name, ad_set_name, ad_name)
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_meta_reporting_starts ON meta_raw_data(reporting_starts);
CREATE INDEX IF NOT EXISTS idx_meta_campaign_name ON meta_raw_data(campaign_name);
CREATE INDEX IF NOT EXISTS idx_meta_ref_parameter ON meta_raw_data(ref_parameter);
CREATE INDEX IF NOT EXISTS idx_meta_processed_at ON meta_raw_data(processed_at);

-- Begin data insertion
