-- Sample Modified Meta Batch SQL with ON CONFLICT Handling
-- This shows how the original files will be transformed

INSERT INTO meta_raw_data (reporting_starts, campaign_name, ad_set_name, ad_name, 
                                              amount_spent_inr, cpm_cost_per_1000_impressions, ctr_link_click_through_rate, ref_parameter) 
                     VALUES 
    ('2024-12-31', 'TOF | All That Grace', 'BRD | IG', 'Jackie Necklace | SV', 
                                 106.93, 54.03233957, 1.51591713, 'nbclorobfotxrpbmyapi'),
    ('2024-12-31', 'TOF | Earrings', 'TRL', 'Earrings | DABA', 
                                 415.03, 38.47858335, 3.50454293, 'nbclorobfotxrpbmyapi'),
    ('2024-12-31', 'TOF | Earrings', 'TRL', 'Ira Earrings | CV', 
                                 25.72, 19.10846954, 5.42347697, 'nbclorobfotxrpbmyapi'),
    ('2024-12-31', 'MOF', 'MOF | MUM', 'RV | CC', 
                                 271.47, 448.7107438, 1.81818182, 'nbclorobfotxrpbmyapi'),
    ('2024-12-31', 'TOF | India Modern', 'INT JWLY - IGi', 'India Modern DABA', 
                                 382.89, 182.67652672, 6.10687023, 'nbclorobfotxrpbmyapi')
ON CONFLICT (reporting_starts, campaign_name, ad_set_name, ad_name) 
DO UPDATE SET 
    amount_spent_inr = EXCLUDED.amount_spent_inr,
    cpm_cost_per_1000_impressions = EXCLUDED.cpm_cost_per_1000_impressions,
    ctr_link_click_through_rate = EXCLUDED.ctr_link_click_through_rate,
    ref_parameter = EXCLUDED.ref_parameter,
    processed_at = CURRENT_TIMESTAMP;