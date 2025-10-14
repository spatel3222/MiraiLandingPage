import type { DashboardData } from '../types';
import type { DateRange as DashboardDateRange } from '../types';
import { normalizeRecordDates } from './dateNormalizer';
import { detectDateRangeFromData } from './dateRangeDetector';
import type { DateRange as DetectorDateRange } from './dateRangeDetector';

/**
 * Helper function to create empty daily metrics for a date range
 */
function createEmptyDailyMetrics(dateRange: DetectorDateRange | { startDate: string; endDate: string; dataPoints: number }): IntegratedDailyMetrics[] {
  const metrics: IntegratedDailyMetrics[] = [];
  const startDate = new Date(dateRange.startDate);
  const endDate = new Date(dateRange.endDate);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    metrics.push({
      date: date.toISOString().split('T')[0],
      metaSpend: 0,
      metaCTR: 0,
      metaCPM: 0,
      googleSpend: 0,
      googleCTR: 0,
      googleCPM: 0,
      totalUsers: 0,
      totalATC: 0,
      totalReachedCheckout: 0,
      totalAbandonedCheckout: 0,
      sessionDuration: 0,
      usersAbove1Min: 0,
      users5PagesAbove1Min: 0,
      atcAbove1Min: 0,
      checkoutAbove1Min: 0,
      generalQueries: 0,
      openQueries: 0,
      onlineOrders: 0
    });
  }
  
  return metrics;
}

export interface IntegratedDailyMetrics {
  date: string;
  metaSpend: number;
  metaCTR: number;
  metaCPM: number;
  googleSpend: number;
  googleCTR: number;
  googleCPM: number;
  totalUsers: number;
  totalATC: number;
  totalReachedCheckout: number;
  totalAbandonedCheckout: number;
  sessionDuration: number;
  usersAbove1Min: number;
  users5PagesAbove1Min: number;
  atcAbove1Min: number;
  checkoutAbove1Min: number;
  generalQueries: number;
  openQueries: number;
  onlineOrders: number;
}

/**
 * Process JSON data directly from Supabase (already transformed)
 */
export const processSupabaseData = async (data: {
  shopify: any[];
  meta: any[];
  google: any[];
}, useConfigurableLogic: boolean = false): Promise<{ 
  dailyMetrics: IntegratedDailyMetrics[], 
  adsetData: any[], 
  dashboardData: DashboardData, 
  dateRange: DetectorDateRange | null 
}> => {
  
  // Process Shopify data (required)
  if (!data.shopify || data.shopify.length === 0) {
    throw new Error('Shopify data is required');
  }
  
  // Detect the date range from the data
  const dateRange = detectDateRangeFromData(data);
  
  if (!dateRange) {
    console.warn('Unable to detect date range from data, using defaults');
    // Create a default date range based on available data
    const dates = data.shopify
      .map(row => row['Day'] || row['Date'])
      .filter(date => date)
      .sort();
    
    if (dates.length > 0) {
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      const range: DetectorDateRange = {
        startDate,
        endDate,
        dataPoints: dates.length
      };
      console.log('Created fallback date range:', range);
      return processWithDateRange(data, range, useConfigurableLogic);
    }
    
    throw new Error('Unable to determine date range from data');
  }
  
  return processWithDateRange(data, dateRange, useConfigurableLogic);
};

async function processWithDateRange(
  data: { shopify: any[]; meta: any[]; google: any[] },
  dateRange: DetectorDateRange | { startDate: string; endDate: string; dataPoints: number },
  useConfigurableLogic: boolean
): Promise<{ 
  dailyMetrics: IntegratedDailyMetrics[], 
  adsetData: any[], 
  dashboardData: DashboardData, 
  dateRange: DetectorDateRange | { startDate: string; endDate: string; dataPoints: number } | null 
}> {
  
  // Normalize dates in the data
  const shopifyData = normalizeRecordDates(
    data.shopify,
    ['Day', 'Date'],
    'shopify'
  );
  
  // Normalize Meta data if available
  const metaData = data.meta && data.meta.length > 0
    ? normalizeRecordDates(data.meta, ['Date'], 'meta')
    : [];
  
  // Normalize Google data if available
  const googleData = data.google && data.google.length > 0
    ? normalizeRecordDates(data.google, ['Date'], 'google')
    : [];
  
  console.log(`📊 Processing data with date range: ${dateRange.startDate} to ${dateRange.endDate}`);
  console.log(`  - Shopify records: ${shopifyData.length}`);
  console.log(`  - Meta records: ${metaData.length}`);
  console.log(`  - Google records: ${googleData.length}`);
  
  // Skip configurable logic for now - missing dependencies
  // if (useConfigurableLogic) {
  //   // Will implement this once dependencies are available
  // }
  
  // Create integrated daily metrics
  const dailyMetrics = createEmptyDailyMetrics(dateRange);
  const dailyMap = new Map(dailyMetrics.map(m => [m.date, m]));
  
  console.log('📊 Daily metrics map keys:', Array.from(dailyMap.keys()));
  
  // Aggregate Shopify data
  shopifyData.forEach(row => {
    const date = row['Day'] || row['Date'];
    if (!date) return;
    
    const metric = dailyMap.get(date);
    if (!metric) {
      console.log(`⚠️ No metric found for Shopify date: "${date}"`);
      return;
    }
    
    // Parse Shopify metrics
    const visitors = parseInt(row['Online store visitors'] || row['Online Store Visitors'] || '0', 10);
    const atc = parseInt(row['Cart Additions'] || row['Cart additions'] || '0', 10);
    const checkouts = parseInt(row['Checkouts'] || row['checkouts'] || '0', 10);
    const orders = parseInt(row['Orders'] || row['orders'] || '0', 10);
    
    metric.totalUsers += visitors;
    metric.totalATC += atc;
    metric.totalReachedCheckout += checkouts;
    metric.onlineOrders += orders;
  });
  
  // Aggregate Meta data
  metaData.forEach(row => {
    const date = row['Date'];
    if (!date) return;
    
    const metric = dailyMap.get(date);
    if (!metric) return;
    
    const spend = parseFloat(row['Amount spent (INR)'] || '0');
    const impressions = parseInt(row['Impressions'] || '0', 10);
    const clicks = parseInt(row['Link Clicks'] || '0', 10);
    
    metric.metaSpend += spend;
    if (impressions > 0) {
      metric.metaCTR = (clicks / impressions) * 100;
      metric.metaCPM = (spend / impressions) * 1000;
    }
  });
  
  // Aggregate Google data
  googleData.forEach(row => {
    const date = row['Date'];
    if (!date) return;
    
    const metric = dailyMap.get(date);
    if (!metric) return;
    
    const cost = parseFloat(row['Cost'] || '0');
    const impressions = parseInt(row['Impressions'] || '0', 10);
    const clicks = parseInt(row['Clicks'] || '0', 10);
    
    metric.googleSpend += cost;
    if (impressions > 0) {
      metric.googleCTR = (clicks / impressions) * 100;
      metric.googleCPM = (cost / impressions) * 1000;
    }
  });
  
  // Aggregate campaign data from all sources
  const campaignMap = new Map<string, any>();
  
  // Process Shopify data by campaign
  shopifyData.forEach(row => {
    const campaign = row['UTM campaign'] || row['Utm campaign'] || 'Direct';
    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, {
        utmCampaign: campaign,
        utmTerm: row['UTM term'] || row['Utm term'] || '',
        totalCustomers: 0,
        totalSessions: 0,
        sessionsPerCustomer: 0,
        avgSessionDuration: 0,
        checkoutSessions: 0,
        checkoutRate: 0,
        cartAdditions: 0,
        cartRate: 0,
        pageviews: 0,
        qualityScore: 0,
        performanceTier: 'average' as const,
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        orders: 0
      });
    }
    
    const campaignData = campaignMap.get(campaign);
    campaignData.totalCustomers += parseInt(row['Online store visitors'] || row['Online Store Visitors'] || '0', 10);
    campaignData.totalSessions += parseInt(row['Sessions'] || '0', 10) || campaignData.totalCustomers;
    campaignData.cartAdditions += parseInt(row['Cart Additions'] || row['Cart additions'] || '0', 10);
    campaignData.checkoutSessions += parseInt(row['Checkouts'] || row['checkouts'] || '0', 10);
    campaignData.orders += parseInt(row['Orders'] || row['orders'] || '0', 10);
    campaignData.pageviews += parseInt(row['Pageviews'] || '0', 10);
  });
  
  // Add Meta ad spend to campaigns
  metaData.forEach(row => {
    const campaign = row['Campaign Name'] || 'Unknown';
    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, {
        utmCampaign: campaign,
        utmTerm: '',
        totalCustomers: 0,
        totalSessions: 0,
        sessionsPerCustomer: 0,
        avgSessionDuration: 0,
        checkoutSessions: 0,
        checkoutRate: 0,
        cartAdditions: 0,
        cartRate: 0,
        pageviews: 0,
        qualityScore: 0,
        performanceTier: 'average' as const,
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        orders: 0
      });
    }
    
    const campaignData = campaignMap.get(campaign);
    campaignData.adSpend += parseFloat(row['Amount spent (INR)'] || '0');
    campaignData.impressions += parseInt(row['Impressions'] || '0', 10);
    campaignData.clicks += parseInt(row['Link Clicks'] || '0', 10);
  });
  
  // Add Google ad spend to campaigns
  googleData.forEach(row => {
    const campaign = row['Campaign'] || 'Unknown';
    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, {
        utmCampaign: campaign,
        utmTerm: '',
        totalCustomers: 0,
        totalSessions: 0,
        sessionsPerCustomer: 0,
        avgSessionDuration: 0,
        checkoutSessions: 0,
        checkoutRate: 0,
        cartAdditions: 0,
        cartRate: 0,
        pageviews: 0,
        qualityScore: 0,
        performanceTier: 'average' as const,
        adSpend: 0,
        impressions: 0,
        clicks: 0,
        orders: 0
      });
    }
    
    const campaignData = campaignMap.get(campaign);
    campaignData.adSpend += parseFloat(row['Cost'] || '0');
    campaignData.impressions += parseInt(row['Impressions'] || '0', 10);
    campaignData.clicks += parseInt(row['Clicks'] || '0', 10);
  });
  
  // Calculate derived metrics for each campaign
  const campaigns = Array.from(campaignMap.values()).map(campaign => {
    // Calculate rates
    if (campaign.totalSessions > 0) {
      campaign.sessionsPerCustomer = campaign.totalSessions / Math.max(campaign.totalCustomers, 1);
      campaign.cartRate = (campaign.cartAdditions / campaign.totalSessions) * 100;
      campaign.checkoutRate = (campaign.checkoutSessions / campaign.totalSessions) * 100;
      campaign.avgPageviewsPerSession = campaign.pageviews / campaign.totalSessions;
    }
    
    // Calculate quality score
    const conversionRate = campaign.totalSessions > 0 ? (campaign.orders / campaign.totalSessions) * 100 : 0;
    campaign.qualityScore = (campaign.checkoutRate * 0.4) + (campaign.cartRate * 0.3) + (conversionRate * 0.3);
    
    // Determine performance tier
    if (campaign.qualityScore >= 75) campaign.performanceTier = 'excellent';
    else if (campaign.qualityScore >= 50) campaign.performanceTier = 'good';
    else if (campaign.qualityScore >= 25) campaign.performanceTier = 'average';
    else campaign.performanceTier = 'poor';
    
    return campaign;
  });
  
  // Calculate total metrics across all campaigns
  const totalUsers = campaigns.reduce((sum, c) => sum + c.totalCustomers, 0);
  const totalSessions = campaigns.reduce((sum, c) => sum + c.totalSessions, 0);
  const totalATC = campaigns.reduce((sum, c) => sum + c.cartAdditions, 0);
  const totalCheckouts = campaigns.reduce((sum, c) => sum + c.checkoutSessions, 0);
  const totalOrders = campaigns.reduce((sum, c) => sum + c.orders, 0);
  const totalAdSpend = campaigns.reduce((sum, c) => sum + c.adSpend, 0);
  
  // Create dashboard data structure that matches types.ts
  const dashboardData: DashboardData = {
    campaigns,
    lastUpdated: new Date().toISOString(),
    dateRange: {
      start: new Date(dateRange.startDate),
      end: new Date(dateRange.endDate), 
      days: Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
    } as DashboardDateRange,
    keyMetrics: {
      uniqueCampaigns: campaigns.length,
      avgAdsetsPerCampaign: campaigns.length > 0 ? totalSessions / campaigns.length : 0,
      avgTrafficPerCampaign: campaigns.length > 0 ? totalUsers / campaigns.length : 0,
      totalUniqueUsers: totalUsers,
      totalSessions: totalSessions,
      avgSessionTime: 0,
      avgPageviewsPerSession: totalSessions > 0 ? campaigns.reduce((sum, c) => sum + c.pageviews, 0) / totalSessions : 0,
      totalATC,
      totalCheckoutSessions: totalCheckouts,
      overallConversionRate: totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0,
      totalRevenue: 0 // Would need sales data to calculate
    }
  };
  
  console.log(`✅ Created ${campaigns.length} campaigns with data`);
  console.log(`📊 Total users: ${totalUsers}, Total sessions: ${totalSessions}`);
  console.log(`📊 Total ATC: ${totalATC}, Total checkouts: ${totalCheckouts}`);
  console.log(`📊 Total ad spend: ${totalAdSpend}`);
  
  // Create adset-level data for export
  const adsetData: any[] = [];
  
  // Process Meta adsets
  metaData.forEach(row => {
    if (row['Ad Set Name']) {
      adsetData.push({
        campaignName: row['Campaign Name'] || '',
        adsetName: row['Ad Set Name'],
        adsetId: '',
        date: row['Date'] || dateRange.startDate,
        impressions: parseInt(row['Impressions'] || '0', 10),
        clicks: parseInt(row['Link Clicks'] || '0', 10),
        conversions: 0,
        amountSpent: parseFloat(row['Amount spent (INR)'] || '0'),
        ctr: 0,
        cpc: 0,
        cpm: 0,
        conversionRate: 0
      });
    }
  });
  
  // Calculate adset metrics
  adsetData.forEach(adset => {
    if (adset.impressions > 0) {
      adset.ctr = (adset.clicks / adset.impressions) * 100;
      adset.cpm = (adset.amountSpent / adset.impressions) * 1000;
    }
    if (adset.clicks > 0) {
      adset.cpc = adset.amountSpent / adset.clicks;
    }
  });
  
  return {
    dailyMetrics: Array.from(dailyMap.values()),
    adsetData,
    dashboardData,
    dateRange
  };
}