import type { DashboardData } from '../types';
import type { DateRange } from './dateRangeDetector';

interface TopLevelMetricsRow {
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

interface AdsetMetricsRow {
  date: string;
  campaignName: string;
  campaignId: string;
  adsetName: string;
  adsetId: string;
  platform: string;
  spend: number;
  impressions: number;
  ctr: number;
  cpm: number;
  cpc: number;
  users: number;
  atc: number;
  reachedCheckout: number;
  purchases: number;
  revenue: number;
  roas: number;
}

export const processOutputFiles = (
  topLevelData: TopLevelMetricsRow[],
  adsetData: AdsetMetricsRow[],
  dateRange?: DateRange
): DashboardData => {
  // 🔍 DEBUG: Log incoming data
  console.log('📊 processOutputFiles called with:');
  console.log('  - topLevelData length:', topLevelData?.length || 0);
  console.log('  - adsetData length:', adsetData?.length || 0);
  console.log('  - dateRange:', dateRange ? `${dateRange.startDate.toDateString()} to ${dateRange.endDate.toDateString()}` : 'undefined');
  
  if (adsetData && adsetData.length > 0) {
    console.log('🔍 adsetData campaigns:', adsetData.map(row => row.campaignName));
    console.log('🔍 adsetData sample:', adsetData.slice(0, 2));
  } else {
    console.log('⚠️ adsetData is empty or null:', adsetData);
  }
  
  // Ensure we have valid data
  if (!topLevelData || topLevelData.length === 0) {
    console.warn('No top-level data provided, using defaults');
    topLevelData = [{
      date: "Sample",
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
    }];
  }

  // Calculate key metrics from top-level data with safety checks
  const totalUsers = Math.floor(topLevelData.reduce((sum, row) => sum + (isNaN(row.totalUsers) ? 0 : row.totalUsers), 0));
  const totalSessions = Math.floor(totalUsers * 1.2); // Approximate sessions
  const totalATC = Math.floor(topLevelData.reduce((sum, row) => sum + (isNaN(row.totalATC) ? 0 : row.totalATC), 0));
  const totalCheckout = Math.floor(topLevelData.reduce((sum, row) => sum + (isNaN(row.totalReachedCheckout) ? 0 : row.totalReachedCheckout), 0));
  const totalRevenue = Math.floor(topLevelData.reduce((sum, row) => sum + ((isNaN(row.onlineOrders) ? 0 : row.onlineOrders) * 2500), 0)); // Avg order value
  const totalSpend = Math.floor(topLevelData.reduce((sum, row) => sum + (isNaN(row.metaSpend) ? 0 : row.metaSpend) + (isNaN(row.googleSpend) ? 0 : row.googleSpend), 0));
  
  // Calculate average session duration in seconds
  const validDurations = topLevelData.filter(row => !isNaN(row.sessionDuration));
  const avgSessionDuration = validDurations.length > 0 ? 
    Math.floor(validDurations.reduce((sum, row) => sum + row.sessionDuration, 0) / validDurations.length) : 0;
  
  // Calculate conversion rate with safety check
  const conversionRate = totalSessions > 0 ? parseFloat(((totalCheckout / totalSessions) * 100).toFixed(2)) : 0;
  
  // Calculate average pageviews per session (estimated)
  const avgPageviews = 3.2;

  // Process campaign data for UTM analysis with safety checks
  const utmCampaigns = adsetData && adsetData.length > 0 ? 
    Array.from(new Set(adsetData.map(row => row.campaignName))).map(campaignName => {
      const campaignRows = adsetData.filter(row => row.campaignName === campaignName);
      const campaignUsers = Math.floor(campaignRows.reduce((sum, row) => sum + (isNaN(row.users) ? 0 : row.users), 0));
      const campaignCheckout = Math.floor(campaignRows.reduce((sum, row) => sum + (isNaN(row.reachedCheckout) ? 0 : row.reachedCheckout), 0));
      const campaignSessions = Math.floor(campaignUsers * 1.1);
      const campaignConversionRate = campaignSessions > 0 ? parseFloat(((campaignCheckout / campaignSessions) * 100).toFixed(2)) : 0;
    
      // Determine performance tier based on conversion rate
      let performanceTier: 'excellent' | 'good' | 'average' | 'poor';
      if (campaignConversionRate >= 1.0) performanceTier = 'excellent';
      else if (campaignConversionRate >= 0.5) performanceTier = 'good';
      else if (campaignConversionRate >= 0.2) performanceTier = 'average';
      else performanceTier = 'poor';

      // Calculate ad spend for this campaign from adset data
      const campaignAdSpend = campaignRows.reduce((sum, row) => {
        return sum + (isNaN(row.spend) ? 0 : row.spend);
      }, 0);

      return {
        utmCampaign: campaignName,
        visitors: campaignUsers,
        sessions: campaignSessions,
        cartAdditions: Math.floor(campaignRows.reduce((sum, row) => sum + (isNaN(row.atc) ? 0 : row.atc), 0)),
        checkoutSessions: campaignCheckout,
        averageSessionDuration: avgSessionDuration,
        pageviews: Math.floor(campaignSessions * avgPageviews),
        conversionRate: campaignConversionRate,
        performanceTier,
        adSpend: Math.floor(campaignAdSpend)
      };
    }) : [];

  // Count campaigns by performance tier
  const performanceTiers = {
    excellent: utmCampaigns.filter(c => c.performanceTier === 'excellent').length,
    good: utmCampaigns.filter(c => c.performanceTier === 'good').length,
    average: utmCampaigns.filter(c => c.performanceTier === 'average').length,
    poor: utmCampaigns.filter(c => c.performanceTier === 'poor').length
  };

  // Get unique campaigns with safety checks
  console.log('🔍 Computing uniqueCampaigns...');
  console.log('  - adsetData exists:', !!adsetData);
  console.log('  - adsetData length:', adsetData?.length || 0);
  
  let uniqueCampaigns;
  if (adsetData && adsetData.length > 0) {
    const campaignNames = adsetData.map(row => row.campaignName);
    const uniqueNames = new Set(campaignNames);
    uniqueCampaigns = uniqueNames.size;
    console.log('  - Campaign names found:', campaignNames);
    console.log('  - Unique campaign names:', Array.from(uniqueNames));
    console.log('  - Unique campaign count:', uniqueCampaigns);
  } else {
    uniqueCampaigns = 1;
    console.log('  - Using fallback uniqueCampaigns = 1 (no adset data)');
  }
  
  // Calculate average adsets per campaign
  const totalAdsets = adsetData && adsetData.length > 0 ? new Set(adsetData.map(row => row.adsetId)).size : 1;
  const avgAdsetsPerCampaign = uniqueCampaigns > 0 ? Math.round(totalAdsets / uniqueCampaigns) : 1;
  
  // Calculate average traffic per campaign
  const avgTrafficPerCampaign = uniqueCampaigns > 0 ? Math.floor(totalUsers / uniqueCampaigns) : totalUsers;

  return {
    keyMetrics: {
      uniqueCampaigns,
      avgAdsetsPerCampaign,
      avgTrafficPerCampaign,
      totalUniqueUsers: totalUsers,
      totalSessions,
      avgSessionTime: avgSessionDuration,
      avgPageviewsPerSession: avgPageviews,
      totalATC,
      totalCheckoutSessions: totalCheckout,
      overallConversionRate: parseFloat(conversionRate.toFixed(2)),
      totalRevenue
    },
    performanceTiers,
    utmCampaigns: utmCampaigns.sort((a, b) => b.sessions - a.sessions), // Sort by sessions descending
    campaigns: [], // Keep empty for now, maintain compatibility
    topLevelData, // CRITICAL: Store the original daily metrics for export
    lastUpdated: new Date().toISOString(),
    dateRange // Include the date range for export filename generation
  };
};

export const parseTopLevelCSV = (csvContent: string): TopLevelMetricsRow[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  // Skip header rows (first 3 rows are headers)
  const dataLines = lines.slice(3);
  
  return dataLines.map(line => {
    const values = line.split(',').map(v => v.replace(/"/g, '').trim());
    
    return {
      date: values[0] || '',
      metaSpend: parseFloat(values[1]?.replace(/,/g, '') || '0'),
      metaCTR: parseFloat(values[2]?.replace('%', '') || '0'),
      metaCPM: parseFloat(values[3] || '0'),
      googleSpend: parseFloat(values[4]?.replace(/,/g, '') || '0'),
      googleCTR: parseFloat(values[5]?.replace('%', '') || '0'),
      googleCPM: parseFloat(values[6] || '0'),
      totalUsers: parseFloat(values[7]?.replace(/,/g, '') || '0'),
      totalATC: parseFloat(values[8] || '0'),
      totalReachedCheckout: parseFloat(values[9] || '0'),
      totalAbandonedCheckout: parseFloat(values[10] || '0'),
      sessionDuration: parseTimeToSeconds(values[11] || '0:00:00'),
      usersAbove1Min: parseFloat(values[12] || '0'),
      users5PagesAbove1Min: parseFloat(values[13] || '0'),
      atcAbove1Min: parseFloat(values[14] || '0'),
      checkoutAbove1Min: parseFloat(values[15] || '0'),
      generalQueries: parseFloat(values[16] || '0'),
      openQueries: parseFloat(values[17] || '0'),
      onlineOrders: parseFloat(values[18] || '0')
    };
  });
};

// Proper CSV parser that handles quoted values with commas
const parseCSVLine = (line: string): string[] => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current.trim());
  
  return values;
};

export const parseAdsetCSV = (csvContent: string): AdsetMetricsRow[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  // Skip header row
  const dataLines = lines.slice(1);
  
  console.log('🔍 parseAdsetCSV: Processing', dataLines.length, 'data lines');
  
  return dataLines.map((line, index) => {
    const values = parseCSVLine(line);
    
    console.log(`🔍 parseAdsetCSV: Line ${index + 1}:`, {
      raw: line,
      parsed: values,
      campaignName: values[1]
    });
    
    return {
      date: values[0] || '',
      campaignName: values[1] || '',
      campaignId: values[2] || '',
      adsetName: values[3] || '',
      adsetId: values[4] || '',
      platform: values[5] || '',
      spend: parseFloat(values[6]?.replace(/,/g, '') || '0'),
      impressions: parseFloat(values[7]?.replace(/,/g, '') || '0'),
      ctr: parseFloat(values[8]?.replace('%', '') || '0'),
      cpm: parseFloat(values[9] || '0'),
      cpc: parseFloat(values[10] || '0'),
      users: parseFloat(values[11] || '0'),
      atc: parseFloat(values[12] || '0'),
      reachedCheckout: parseFloat(values[13] || '0'),
      purchases: parseFloat(values[14] || '0'),
      revenue: parseFloat(values[15]?.replace(/,/g, '') || '0'),
      roas: parseFloat(values[16] || '0')
    };
  });
};

const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':');
  if (parts.length === 3) {
    const hours = parseInt(parts[0] || '0');
    const minutes = parseInt(parts[1] || '0');
    const seconds = parseInt(parts[2] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }
  return 0;
};

// Generate sample data for demo purposes
export const generateSampleOutputData = (): DashboardData => {
  const sampleTopLevel: TopLevelMetricsRow[] = [
    {
      date: "2025-09-10",
      metaSpend: 39829,
      metaCTR: 1.49,
      metaCPM: 59.16,
      googleSpend: 16080,
      googleCTR: 0.80,
      googleCPM: 244.71,
      totalUsers: 7922,
      totalATC: 35,
      totalReachedCheckout: 13,
      totalAbandonedCheckout: 1,
      sessionDuration: 42,
      usersAbove1Min: 835,
      users5PagesAbove1Min: 525,
      atcAbove1Min: 23,
      checkoutAbove1Min: 8,
      generalQueries: 9,
      openQueries: 2,
      onlineOrders: 2
    },
    // REMOVED: No more fake sample data with Math.random()
    // Sample data should ONLY be used for UI testing, not real exports
    // All real data should come from actual input files
    // Using -9999 to indicate no data available instead of fake random numbers
  ];

  const sampleAdset: AdsetMetricsRow[] = [
    // Excellent performing campaigns (conversion rate >= 1.0%)
    {
      date: "2025-09-10",
      campaignName: "india-pmax-rings",
      campaignId: "234567",
      adsetName: "Performance Max",
      adsetId: "890123",
      platform: "Google",
      spend: 1200,
      impressions: 4900,
      ctr: 2.04,
      cpm: 244.90,
      cpc: 12.00,
      users: 100,
      atc: 5,
      reachedCheckout: 3,
      purchases: 1,
      revenue: 2500,
      roas: 2.08
    },
    {
      date: "2025-09-10",
      campaignName: "Retargeting | Purchase Intent",
      campaignId: "456789",
      adsetName: "Cart Abandoners",
      adsetId: "234567",
      platform: "Meta",
      spend: 890,
      impressions: 15200,
      ctr: 2.8,
      cpm: 58.55,
      cpc: 2.09,
      users: 426,
      atc: 8,
      reachedCheckout: 6,
      purchases: 2,
      revenue: 4800,
      roas: 5.39
    },
    {
      date: "2025-09-11",
      campaignName: "TOF | Lookalike Premium",
      campaignId: "567890",
      adsetName: "1% LAL High Value",
      adsetId: "345678",
      platform: "Meta",
      spend: 1650,
      impressions: 28900,
      ctr: 1.9,
      cpm: 57.09,
      cpc: 3.01,
      users: 548,
      atc: 12,
      reachedCheckout: 7,
      purchases: 1,
      revenue: 3200,
      roas: 1.94
    },
    // Good performing campaigns (0.5% - 0.99%)
    {
      date: "2025-09-10",
      campaignName: "BOF | Interest Stacking",
      campaignId: "678901",
      adsetName: "Jewelry + Luxury",
      adsetId: "456789",
      platform: "Meta",
      spend: 2100,
      impressions: 35600,
      ctr: 1.6,
      cpm: 59.0,
      cpc: 3.69,
      users: 569,
      atc: 6,
      reachedCheckout: 4,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-11",
      campaignName: "MOF | Engagement Custom",
      campaignId: "789012",
      adsetName: "Video Viewers 95%",
      adsetId: "567890",
      platform: "Meta",
      spend: 1340,
      impressions: 22400,
      ctr: 1.4,
      cpm: 59.82,
      cpc: 4.27,
      users: 314,
      atc: 4,
      reachedCheckout: 2,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-12",
      campaignName: "Search | Brand Terms",
      campaignId: "890123",
      adsetName: "Exact Match",
      adsetId: "678901",
      platform: "Google",
      spend: 560,
      impressions: 2800,
      ctr: 3.2,
      cpm: 200.0,
      cpc: 6.25,
      users: 96,
      atc: 2,
      reachedCheckout: 1,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    // Average performing campaigns (0.2% - 0.49%)
    {
      date: "2025-09-11",
      campaignName: "TOF | Interest",
      campaignId: "345678",
      adsetName: "Luxury Shoppers",
      adsetId: "890124",
      platform: "Meta",
      spend: 1800,
      impressions: 28500,
      ctr: 1.23,
      cpm: 63.16,
      cpc: 5.14,
      users: 351,
      atc: 2,
      reachedCheckout: 1,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-12",
      campaignName: "TOF | Broad Interest",
      campaignId: "901234",
      adsetName: "Fashion Enthusiasts",
      adsetId: "789012",
      platform: "Meta",
      spend: 2200,
      impressions: 45600,
      ctr: 1.1,
      cpm: 48.25,
      cpc: 4.39,
      users: 501,
      atc: 3,
      reachedCheckout: 2,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-13",
      campaignName: "Display | Awareness",
      campaignId: "012345",
      adsetName: "Broad Demographic",
      adsetId: "890125",
      platform: "Google",
      spend: 980,
      impressions: 18900,
      ctr: 0.8,
      cpm: 51.85,
      cpc: 6.48,
      users: 151,
      atc: 1,
      reachedCheckout: 1,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    // Poor performing campaigns (< 0.2%)
    {
      date: "2025-09-10",
      campaignName: "BOF | DPA",
      campaignId: "123456",
      adsetName: "DPA - Broad",
      adsetId: "789012",
      platform: "Meta",
      spend: 2500,
      impressions: 42300,
      ctr: 1.45,
      cpm: 59.10,
      cpc: 4.08,
      users: 612,
      atc: 2,
      reachedCheckout: 1,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-11",
      campaignName: "TOF | Cold Traffic",
      campaignId: "123457",
      adsetName: "Broad Targeting",
      adsetId: "789013",
      platform: "Meta",
      spend: 1890,
      impressions: 52100,
      ctr: 0.95,
      cpm: 36.28,
      cpc: 3.82,
      users: 495,
      atc: 1,
      reachedCheckout: 0,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    },
    {
      date: "2025-09-12",
      campaignName: "Display | Generic",
      campaignId: "123458",
      adsetName: "All Demographics",
      adsetId: "789014",
      platform: "Google",
      spend: 750,
      impressions: 28600,
      ctr: 0.6,
      cpm: 26.22,
      cpc: 4.37,
      users: 172,
      atc: 0,
      reachedCheckout: 0,
      purchases: 0,
      revenue: 0,
      roas: 0.00
    }
  ];

  return processOutputFiles(sampleTopLevel, sampleAdset);
};