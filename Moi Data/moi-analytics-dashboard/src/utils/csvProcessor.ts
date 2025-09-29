import Papa from 'papaparse';
import type { ShopifyRecord, CampaignMetrics, KeyMetrics, DashboardData } from '../types';

export const processShopifyCSV = (file: File): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as ShopifyRecord[];
          const processedData = processShopifyData(data);
          resolve(processedData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const processShopifyData = (records: ShopifyRecord[]): DashboardData => {
  // Group by UTM campaign
  const campaignMap = new Map<string, ShopifyRecord[]>();
  
  records.forEach(record => {
    const campaign = record['Utm campaign'] || 'Direct Traffic / Organic';
    if (!campaignMap.has(campaign)) {
      campaignMap.set(campaign, []);
    }
    campaignMap.get(campaign)!.push(record);
  });

  // Process each campaign
  const campaigns: CampaignMetrics[] = [];
  
  campaignMap.forEach((campaignRecords, campaignName) => {
    const metrics = calculateCampaignMetrics(campaignName, campaignRecords);
    campaigns.push(metrics);
  });

  // Sort campaigns by total sessions (descending)
  campaigns.sort((a, b) => b.totalSessions - a.totalSessions);

  // Calculate key metrics
  const keyMetrics = calculateKeyMetrics(campaigns);

  return {
    keyMetrics,
    campaigns,
    lastUpdated: new Date().toISOString()
  };
};

const calculateCampaignMetrics = (campaignName: string, records: ShopifyRecord[]): CampaignMetrics => {
  const totalCustomers = records.reduce((sum, r) => sum + (r['Online store visitors'] || 0), 0);
  const totalSessions = records.reduce((sum, r) => sum + (r['Sessions'] || 0), 0);
  const cartAdditions = records.reduce((sum, r) => sum + (r['Sessions with cart additions'] || 0), 0);
  const checkoutSessions = records.reduce((sum, r) => sum + (r['Sessions that reached checkout'] || 0), 0);
  const totalDuration = records.reduce((sum, r) => sum + ((r['Average session duration'] || 0) * (r['Sessions'] || 0)), 0);
  const pageviews = records.reduce((sum, r) => sum + (r['Pageviews'] || 0), 0);

  const sessionsPerCustomer = totalCustomers > 0 ? totalSessions / totalCustomers : 0;
  const avgSessionDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;
  const checkoutRate = totalSessions > 0 ? (checkoutSessions / totalSessions) * 100 : 0;
  const cartRate = totalSessions > 0 ? (cartAdditions / totalSessions) * 100 : 0;

  // Calculate quality score (0-100)
  const qualityScore = calculateQualityScore(checkoutRate, cartRate, sessionsPerCustomer, avgSessionDuration);
  
  // Determine performance tier
  const performanceTier = getPerformanceTier(qualityScore);

  return {
    utmCampaign: campaignName,
    totalCustomers,
    totalSessions,
    sessionsPerCustomer: Math.round(sessionsPerCustomer * 100) / 100,
    avgSessionDuration: Math.round(avgSessionDuration * 100) / 100,
    checkoutSessions,
    checkoutRate: Math.round(checkoutRate * 100) / 100,
    cartAdditions,
    cartRate: Math.round(cartRate * 100) / 100,
    pageviews,
    qualityScore,
    performanceTier
  };
};

const calculateQualityScore = (
  checkoutRate: number,
  cartRate: number,
  sessionsPerCustomer: number,
  avgSessionDuration: number
): number => {
  // Scoring formula (weighted)
  const checkoutWeight = 0.4; // 40% weight for checkout conversion
  const cartWeight = 0.3; // 30% weight for cart addition
  const engagementWeight = 0.2; // 20% weight for session engagement
  const loyaltyWeight = 0.1; // 10% weight for customer loyalty
  
  // Normalize scores (industry benchmarks)
  const checkoutScore = Math.min(checkoutRate / 2.0 * 100, 100); // 2% is excellent
  const cartScore = Math.min(cartRate / 15.0 * 100, 100); // 15% is excellent
  const engagementScore = Math.min(avgSessionDuration / 300 * 100, 100); // 5 minutes is excellent
  const loyaltyScore = Math.min((sessionsPerCustomer - 1) / 1.5 * 100, 100); // 2.5 sessions/customer is excellent
  
  const qualityScore = (
    checkoutScore * checkoutWeight +
    cartScore * cartWeight +
    engagementScore * engagementWeight +
    loyaltyScore * loyaltyWeight
  );
  
  return Math.round(qualityScore);
};

const getPerformanceTier = (qualityScore: number): 'excellent' | 'good' | 'average' | 'poor' => {
  if (qualityScore >= 80) return 'excellent';
  if (qualityScore >= 60) return 'good';
  if (qualityScore >= 40) return 'average';
  return 'poor';
};

const calculateKeyMetrics = (campaigns: CampaignMetrics[]): KeyMetrics => {
  const uniqueCampaigns = campaigns.length;
  const totalUniqueUsers = campaigns.reduce((sum, c) => sum + c.totalCustomers, 0);
  const totalSessions = campaigns.reduce((sum, c) => sum + c.totalSessions, 0);
  const totalATC = campaigns.reduce((sum, c) => sum + c.cartAdditions, 0);
  const totalCheckoutSessions = campaigns.reduce((sum, c) => sum + c.checkoutSessions, 0);
  
  // Calculate weighted averages
  const totalDuration = campaigns.reduce((sum, c) => sum + (c.avgSessionDuration * c.totalSessions), 0);
  const avgSessionTime = totalSessions > 0 ? totalDuration / totalSessions : 0;
  
  const totalPageviews = campaigns.reduce((sum, c) => sum + c.pageviews, 0);
  const avgPageviewsPerSession = totalSessions > 0 ? totalPageviews / totalSessions : 0;
  
  const overallConversionRate = totalSessions > 0 ? (totalCheckoutSessions / totalSessions) * 100 : 0;
  
  // Since we don't have revenue data in Shopify export, we'll estimate based on checkouts
  // This is a placeholder - real implementation would need revenue data
  const estimatedAOV = 2500; // Average Order Value in INR (placeholder)
  const totalRevenue = totalCheckoutSessions * estimatedAOV;

  return {
    uniqueCampaigns,
    avgAdsetsPerCampaign: 1, // Placeholder - would need actual adset data
    avgTrafficPerCampaign: Math.round(totalSessions / uniqueCampaigns),
    
    totalUniqueUsers,
    totalSessions,
    avgSessionTime: Math.round(avgSessionTime),
    avgPageviewsPerSession: Math.round(avgPageviewsPerSession * 100) / 100,
    
    totalATC,
    totalCheckoutSessions,
    overallConversionRate: Math.round(overallConversionRate * 100) / 100,
    totalRevenue
  };
};