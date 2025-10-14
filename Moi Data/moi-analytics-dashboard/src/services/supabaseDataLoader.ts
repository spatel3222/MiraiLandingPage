import { supabase } from './supabaseClient';
import { processSupabaseData } from '../utils/integratedDataProcessorForSupabase';
import { processOutputFiles } from '../utils/outputDataProcessor';
import type { DashboardData } from '../types';

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Load and process data from Supabase for dashboard display
 */
export async function loadDashboardDataFromSupabase(
  projectId?: string,
  dateRange?: DateRange
): Promise<DashboardData | null> {
  try {
    console.log('📊 Loading data from Supabase (updated)...');
    
    // Build date filter
    const dateFilter = dateRange ? {
      start: new Date(dateRange.startDate).toISOString(),
      end: new Date(dateRange.endDate).toISOString()
    } : null;

    // 1. Fetch Meta/Facebook data
    let metaQuery = supabase
      .from('raw_data_meta')
      .select('*')
      .order('date_reported', { ascending: false })
      .limit(10000);  // Handle large datasets
    
    if (projectId) {
      metaQuery = metaQuery.eq('project_id', projectId);
    }
    
    if (dateFilter) {
      metaQuery = metaQuery
        .gte('date_reported', dateFilter.start)
        .lte('date_reported', dateFilter.end);
    }

    const { data: metaData, error: metaError } = await metaQuery;
    
    if (metaError) {
      console.error('Error fetching Meta data:', metaError);
      throw metaError;
    }

    // 2. Fetch Google Ads data
    let googleQuery = supabase
      .from('raw_data_google')
      .select('*')
      .order('date', { ascending: false })
      .limit(10000);  // Handle large datasets
    
    if (projectId) {
      googleQuery = googleQuery.eq('project_id', projectId);
    }
    
    if (dateFilter) {
      googleQuery = googleQuery
        .gte('date', dateFilter.start)
        .lte('date', dateFilter.end);
    }

    const { data: googleData, error: googleError } = await googleQuery;
    
    if (googleError) {
      console.error('Error fetching Google data:', googleError);
      throw googleError;
    }

    // 3. Fetch Shopify data (with pagination for large datasets)
    console.log('📦 Fetching Shopify data with pagination...');
    let allShopifyData: any[] = [];
    let shopifyOffset = 0;
    const shopifyLimit = 10000; // Fetch 10k rows at a time
    let hasMoreShopify = true;
    
    while (hasMoreShopify) {
      let shopifyQuery = supabase
        .from('raw_data_shopify')
        .select('*')
        .order('day', { ascending: false })
        .range(shopifyOffset, shopifyOffset + shopifyLimit - 1);
      
      if (projectId) {
        shopifyQuery = shopifyQuery.eq('project_id', projectId);
      }
      
      if (dateFilter) {
        shopifyQuery = shopifyQuery
          .gte('day', dateFilter.start)
          .lte('day', dateFilter.end);
      }

      const { data: shopifyBatch, error: shopifyError } = await shopifyQuery;
      
      if (shopifyError) {
        console.error('Error fetching Shopify data batch:', shopifyError);
        throw shopifyError;
      }
      
      if (shopifyBatch && shopifyBatch.length > 0) {
        allShopifyData = allShopifyData.concat(shopifyBatch);
        console.log(`  - Fetched Shopify batch: ${shopifyBatch.length} rows (total: ${allShopifyData.length})`);
        
        // Check if we got less than the limit, meaning we've reached the end
        if (shopifyBatch.length < shopifyLimit) {
          hasMoreShopify = false;
        } else {
          shopifyOffset += shopifyLimit;
        }
      } else {
        hasMoreShopify = false;
      }
    }
    
    const shopifyData = allShopifyData;
    console.log(`✅ Total Shopify rows fetched: ${shopifyData.length}`);

    console.log(`✅ Fetched from Supabase:
      - Meta: ${metaData?.length || 0} rows
      - Google: ${googleData?.length || 0} rows  
      - Shopify: ${shopifyData?.length || 0} rows
    `);

    // 4. Check if we have any data
    if (!metaData?.length && !googleData?.length && !shopifyData?.length) {
      console.log('⚠️ No data found in Supabase');
      return null;
    }

    // 5. Process through existing pipeline
    console.log('🔄 Processing data through pipeline...');
    
    // Check if we have any data to process
    if (!metaData?.length && !googleData?.length && !shopifyData?.length) {
      console.log('📊 No data to process from Supabase');
      return null;
    }

    // Transform Supabase data to match the format expected by processors
    // We need to convert the database rows back to a format similar to CSV data
    const transformedData = {
      meta: metaData?.map((row: any) => ({
        'Campaign Name': row.campaign_name,
        'Ad Set Name': row.ad_set_name,
        'Date': row.date_reported,
        'Amount spent (INR)': row.amount_spent,
        'Impressions': row.impressions,
        'Link Clicks': row.link_clicks
      })) || [],
      google: googleData?.map((row: any) => ({
        'Campaign': row.campaign || row.campaign_name,
        'Date': row.date || row.date_reported,
        'Cost': row.cost,
        'Clicks': row.clicks,
        'Impressions': row.impressions,
        'Conversions': row.conversions
      })) || [],
      shopify: shopifyData?.map((row: any) => ({
        'UTM campaign': row.utm_campaign || row.campaign_name,
        'UTM term': row.utm_term,
        'Day': row.day || row.date_reported,
        'Online store visitors': row.online_store_visitors,
        'Sessions': row.sessions,
        'Orders': row.orders || row.purchases,
        'Total Sales': row.total_sales,
        'Cart Additions': row.cart_additions,
        'Checkouts': row.checkouts
      })) || []
    };

    console.log('📊 Transformed data ready for processing');
    console.log(`  - Meta rows: ${transformedData.meta.length}`);
    console.log(`  - Google rows: ${transformedData.google.length}`);
    console.log(`  - Shopify rows: ${transformedData.shopify.length}`);

    // Now process through the Supabase-specific pipeline
    try {
      const integratedData = await processSupabaseData(transformedData);
      
      if (!integratedData) {
        console.error('Failed to process integrated data');
        // Return basic structure as fallback
        return {
          ...createBasicDashboardStructure(metaData, googleData, shopifyData, dateRange),
          lastUpdated: new Date().toISOString()
        };
      }

      // Use the dashboard data directly from the processor
      const dashboardData = integratedData.dashboardData;

      console.log('✅ Data successfully processed through full pipeline');
      return {
        ...dashboardData,
        lastUpdated: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error processing data through pipeline:', error);
      // Return basic structure as fallback
      return {
        ...createBasicDashboardStructure(metaData, googleData, shopifyData, dateRange),
        lastUpdated: new Date().toISOString()
      };
    }

  } catch (error) {
    console.error('Error loading data from Supabase:', error);
    throw error;
  }
}

// Helper function to create basic dashboard structure as fallback
function createBasicDashboardStructure(metaData: any[], googleData: any[], shopifyData: any[], dateRange?: { startDate: string; endDate: string }) {
    console.log('⚠️ Using basic dashboard structure (fallback)');
    return {
      campaigns: [],
      adsetLevelData: [],
      dateRange: {
        startDate: dateRange?.startDate || new Date().toISOString().split('T')[0],
        endDate: dateRange?.endDate || new Date().toISOString().split('T')[0]
      },
      metrics: {
        totalSpend: 0,
        totalRevenue: 0,
        totalConversions: 0,
        averageROAS: 0,
        averageCPC: 0,
        averageCTR: 0
      },
      keyMetrics: {
        uniqueCampaigns: (metaData?.length || 0) + (googleData?.length || 0),
        avgAdsetsPerCampaign: 0,
        avgTrafficPerCampaign: 0,
        totalUniqueUsers: shopifyData?.reduce((sum, row) => sum + (row.online_store_visitors || 0), 0) || 0,
        totalATC: shopifyData?.reduce((sum, row) => sum + (row.cart_additions || 0), 0) || 0,
        totalCheckouts: shopifyData?.reduce((sum, row) => sum + (row.checkouts || 0), 0) || 0,
        totalOrders: shopifyData?.reduce((sum, row) => sum + (row.orders || row.purchases || 0), 0) || 0,
        conversionRate: 0,
        totalRevenue: shopifyData?.reduce((sum, row) => sum + (row.total_sales || 0), 0) || 0,
        totalAdSpend: (metaData?.reduce((sum, row) => sum + (row.amount_spent || 0), 0) || 0) + 
                      (googleData?.reduce((sum, row) => sum + (row.cost || 0), 0) || 0),
        ROAS: 0,
        CPO: 0,
        avgSessionTime: 0,
        avgPageViews: 0,
        bounceRate: 0,
        avgTimeToConversion: 0
      },
      statistics: {
        uniqueCampaigns: (metaData?.length || 0) + (googleData?.length || 0),
        totalSpend: 0,
        totalRevenue: 0,
        overallROAS: 0,
        averageCPC: 0,
        conversionRate: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        totalAddToCarts: 0,
        totalCheckouts: 0,
        totalPurchases: 0,
        qualityUsers: 0,
        averageCPQU: 0
      }
    };
  }

/**
 * Load campaign summary data for quick stats
 */
export async function loadCampaignSummaryFromSupabase(
  projectId?: string
): Promise<any> {
  try {
    let query = supabase
      .from('campaign_data')
      .select('*')
      .order('date_reported', { ascending: false });
    
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group by campaign for summary
    const campaignMap = new Map();
    
    data?.forEach(row => {
      const key = row.campaign_name;
      if (!campaignMap.has(key)) {
        campaignMap.set(key, {
          campaign_name: key,
          total_spent: 0,
          total_impressions: 0,
          total_clicks: 0,
          total_conversions: 0,
          dates: new Set()
        });
      }
      
      const campaign = campaignMap.get(key);
      campaign.total_spent += row.amount_spent || 0;
      campaign.total_impressions += row.impressions || 0;
      campaign.total_clicks += row.link_clicks || row.clicks || 0;
      campaign.total_conversions += row.conversions || row.purchases || 0;
      campaign.dates.add(row.date_reported);
    });

    return Array.from(campaignMap.values()).map(c => ({
      ...c,
      days_active: c.dates.size,
      dates: undefined
    }));

  } catch (error) {
    console.error('Error loading campaign summary:', error);
    return [];
  }
}

/**
 * Export data from Supabase to CSV
 */
export async function exportDataFromSupabase(
  projectId?: string,
  dateRange?: DateRange
): Promise<{ topLevel: any[], adset: any[] }> {
  try {
    // Load and process data
    const dashboardData = await loadDashboardDataFromSupabase(projectId, dateRange);
    
    if (!dashboardData) {
      throw new Error('No data available to export');
    }

    // Format for CSV export
    const topLevelData = dashboardData.campaigns?.map(campaign => ({
      'Date': campaign.date || '',
      'UTM Campaign': campaign.utmCampaign || '',
      'UTM Term': campaign.utmTerm || '',
      'Total Users': campaign.totalUsers || 0,
      'Quality Users': campaign.qualityUsers || 0,
      'Add to Cart': campaign.addToCart || 0,
      'Checkout Sessions': campaign.checkoutSessions || 0,
      'Purchases': campaign.purchases || 0,
      'Ad Spend': campaign.adSpend || 0,
      'CPC': campaign.cpc || 0,
      'CTR': campaign.ctr || 0,
      'Conversion Rate': campaign.conversionRate || 0
    })) || [];

    const adsetData = dashboardData.adsetLevelData?.map(adset => ({
      'Campaign Name': adset.campaignName || '',
      'Ad Set Name': adset.adsetName || '',
      'Ad Set ID': adset.adsetId || '',
      'Date': adset.date || '',
      'Impressions': adset.impressions || 0,
      'Clicks': adset.clicks || 0,
      'Conversions': adset.conversions || 0,
      'Amount Spent': adset.amountSpent || 0,
      'CTR': adset.ctr || 0,
      'CPC': adset.cpc || 0,
      'CPM': adset.cpm || 0,
      'Conversion Rate': adset.conversionRate || 0
    })) || [];

    return {
      topLevel: topLevelData,
      adset: adsetData
    };

  } catch (error) {
    console.error('Error exporting data from Supabase:', error);
    throw error;
  }
}

/**
 * Check if Supabase has data
 */
export async function checkSupabaseDataAvailability(): Promise<boolean> {
  try {
    const tables = ['raw_data_meta', 'raw_data_google', 'raw_data_shopify'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error && count && count > 0) {
        console.log(`✅ Found ${count} records in ${table}`);
        return true;
      }
    }
    
    console.log('⚠️ No data found in Supabase');
    return false;
    
  } catch (error) {
    console.error('Error checking Supabase data:', error);
    return false;
  }
}