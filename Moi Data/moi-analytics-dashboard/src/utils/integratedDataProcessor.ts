import Papa from 'papaparse';
import { processMetaAdsCSV, processMetaDataByDay, type MetaAdsRecord } from './metaProcessor';
import { processGoogleAdsCSV, processGoogleDataByDay, type GoogleAdsRecord } from './googleProcessor';
import { detectDateRangeFromFiles, type DateRange, formatDateForApp, generateDateArray } from './dateRangeDetector';
import { normalizeRecordDates, normalizeDateToISO } from './dateNormalizer';
import { processOutputFiles } from './outputDataProcessor';
import { ConfigurableDataProcessor } from '../services/configurableDataProcessor';
import { LogicTemplateManager } from '../services/logicTemplateManager';
import type { DashboardData, ShopifyRecord } from '../types';
import type * as LogicTypes from '../types/logicConfiguration';
type LogicConfiguration = LogicTypes.LogicConfiguration;

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

export const processAllInputFiles = async (files: {
  shopify: File | null;
  meta: File | null;
  google: File | null;
}, useConfigurableLogic: boolean = false): Promise<{ dailyMetrics: IntegratedDailyMetrics[], adsetData: any[], dashboardData: DashboardData, dateRange: DateRange | null }> => {
  
  // Process Shopify data (required)
  if (!files.shopify) {
    throw new Error('Shopify file is required');
  }
  
  // First, detect the date range from all available files
  const dateRange = await detectDateRangeFromFiles(files);
  
  if (!dateRange) {
    throw new Error('Unable to detect date range from uploaded files');
  }
  
  const rawShopifyData = await processShopifyCSV(files.shopify);
  
  // CRITICAL: Normalize all date fields in Shopify data
  const shopifyData = normalizeRecordDates(
    rawShopifyData,
    ['Day', 'Date'], // Date fields to normalize
    'shopify'
  );
  
  // Shopify data normalized
  
  // CRITICAL: Save original Shopify file data to localStorage for export system (compressed)
  try {
    // Compress by keeping only essential fields
    const compressedData = shopifyData.map(row => ({
      'Day': row['Day'] || row['Date'],
      'UTM campaign': row['UTM campaign'] || row['Utm campaign'],
      'UTM term': row['UTM term'] || row['Utm term'],
      'Online store visitors': row['Online store visitors'],
      'Sessions with cart additions': row['Sessions with cart additions'],
      'Sessions that reached checkout': row['Sessions that reached checkout'],
      'Sessions that completed checkout': row['Sessions that completed checkout'],
      'Average session duration': row['Average session duration'],
      'Pageviews': row['Pageviews']
    }));
    
    localStorage.setItem('moi-shopify-data', JSON.stringify(compressedData));
    // Saved compressed Shopify data to localStorage
  } catch (error) {
    console.error('❌ Error saving Shopify data to localStorage:', error);
    // Fallback: Save sample data
    try {
      const sampleData = shopifyData.slice(0, 1000);
      localStorage.setItem('moi-shopify-data', JSON.stringify(sampleData));
      // Saved sample Shopify data due to size limits
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
  
  // Process Meta data (optional)
  let metaData: MetaAdsRecord[] = [];
  let metaDailyData: any[] = [];
  if (files.meta) {
    metaData = await processMetaAdsCSV(files.meta);
    // Meta data processed
    
    metaDailyData = processMetaDataByDay(metaData, dateRange);
    
    // CRITICAL: Save original Meta file data to localStorage for export system
    localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
    // Saved original Meta Ads data to localStorage
  }
  
  // Process Google data (optional)  
  let googleData: GoogleAdsRecord[] = [];
  let googleDailyData: any[] = [];
  if (files.google) {
    googleData = await processGoogleAdsCSV(files.google);
    googleDailyData = processGoogleDataByDay(googleData, dateRange);
    
    // CRITICAL: Save original Google file data to localStorage for export system
    localStorage.setItem('moi-google-data', JSON.stringify(googleData));
    // Saved original Google Ads data to localStorage
  }
  
  // Process Shopify data by day using detected date range
  const shopifyDailyData = processShopifyDataByDay(shopifyData, dateRange);
  
  // Check if configurable logic should be used
  if (useConfigurableLogic) {
    try {
      const inputData = {
        shopify: shopifyData,
        meta: metaData,
        google: googleData
      };
      
      const processingResult = await ConfigurableDataProcessor.processWithConfiguration(
        inputData,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          dayCount: dateRange.dayCount
        }
      );
      
      if (processingResult.success) {
        // Convert configurable processor output to dashboard format
        const configurableDashboard = convertConfigurableOutputToDashboard(
          processingResult.outputFiles,
          dateRange
        );
        
        return configurableDashboard;
      } else {
        // Fall back to standard processing if configurable processing fails
        console.warn('Configurable processing failed, falling back to standard processing:', processingResult.errors);
      }
    } catch (error) {
      console.warn('Error in configurable processing, falling back to standard processing:', error);
    }
  }

  // Standard processing path
  // Combine all data sources by day
  const combinedDailyMetrics = combineAllDailyData(metaDailyData, googleDailyData, shopifyDailyData, dateRange);
  
  // Generate adset-level data
  const adsetData = generateAdsetData(metaData, googleData, dateRange);
  
  // Create dashboard data structure using processOutputFiles
  // Convert combinedDailyMetrics to the format expected by processOutputFiles
  const topLevelMetrics = combinedDailyMetrics.map(metric => ({
    date: metric.date,
    metaSpend: metric.metaSpend,
    metaCTR: metric.metaCTR,
    metaCPM: metric.metaCPM,
    googleSpend: metric.googleSpend,
    googleCTR: metric.googleCTR,
    googleCPM: metric.googleCPM,
    totalUsers: metric.totalUsers,
    totalATC: metric.totalATC,
    totalReachedCheckout: metric.totalReachedCheckout,
    totalAbandonedCheckout: metric.totalAbandonedCheckout,
    sessionDuration: metric.sessionDuration,
    usersAbove1Min: metric.usersAbove1Min,
    users5PagesAbove1Min: metric.users5PagesAbove1Min,
    atcAbove1Min: metric.atcAbove1Min,
    checkoutAbove1Min: metric.checkoutAbove1Min,
    generalQueries: metric.generalQueries,
    openQueries: metric.openQueries,
    onlineOrders: metric.onlineOrders
  }));
  
  const dashboardData = processOutputFiles(topLevelMetrics, adsetData, dateRange);
  
  // Generate pivot data for standard processing
  const pivotData = createShopifyPivotFromData(shopifyData, metaData);
  
  // Store pivot data in localStorage
  try {
    localStorage.setItem('moi-pivot-data', JSON.stringify(pivotData));
    console.log(`Stored ${pivotData.length} pivot records in localStorage (standard processing)`);
  } catch (error) {
    console.warn('Failed to store pivot data in localStorage:', error);
  }
  
  return {
    dailyMetrics: combinedDailyMetrics,
    adsetData,
    dashboardData,
    dateRange
  };
};

const processShopifyCSV = (file: File): Promise<ShopifyRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const data = results.data as any[];
          // Convert to our ShopifyRecord format
          const shopifyRecords: ShopifyRecord[] = data.map(row => ({
            'Day': row['Day'] || row['Date'] || '',
            'Utm campaign': row['UTM campaign'] || '',
            'Utm term': row['UTM term'] || '',
            'Landing page url': row['Landing page URL'] || '',
            'Online store visitors': parseFloat(row['Online store visitors'] || '0'),
            'Sessions': parseFloat(row['Online store visitors'] || '0'), // Use visitors as sessions approximation
            'Sessions with cart additions': parseFloat(row['Sessions with cart additions'] || '0'),
            'Sessions that reached checkout': parseFloat(row['Sessions that reached checkout'] || '0'),
            'Average session duration': parseFloat(row['Average session duration'] || '0'),
            'Pageviews': parseFloat(row['Pageviews'] || '0')
          }));
          resolve(shopifyRecords);
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

const processShopifyDataByDay = (records: ShopifyRecord[], dateRange: DateRange) => {
  const dates = generateDateArray(dateRange);
  
  // Debug: Log the structure of the first few records (minimal)
  
  const dailyData = dates.map((date, index) => {
    const dateStr = formatDateForApp(date);
    const isoDateStr = date.toISOString().split('T')[0];
    
    // Debug: Check date formats (minimal)
    
    // Filter sessions for this specific date
    const dailySessions = records.filter(record => {
      const recordDate = record['Day'] || record['Date'] || '';
      const targetISODate = date.toISOString().split('T')[0]; // 2025-09-29 format
      
      // USER REQUIREMENT: Shopify uses yyyy-mm-dd format (2025-09-29), prioritize ISO matching
      const isoMatch = recordDate === targetISODate;
      const legacyMatches = recordDate === dateStr || recordDate === isoDateStr;
      const matches = isoMatch || legacyMatches;
      
      // Enhanced debug logging (minimal)
      
      return matches;
    });
    
    // Debug: Session count (minimal)
    
    // If no sessions found for this date, use all sessions distributed (fallback for old data format)
    const sessionsToProcess = dailySessions.length > 0 ? dailySessions : records;
    const isUsingFallback = dailySessions.length === 0;
    
    // Debug: Fallback usage (minimal)
    
    // Calculate metrics from actual sessions for this date
    const totalUsers = sessionsToProcess.reduce((sum, r) => sum + (r['Online store visitors'] || 0), 0);
    const totalATC = sessionsToProcess.reduce((sum, r) => sum + (r['Sessions with cart additions'] || 0), 0);
    const totalReachedCheckout = sessionsToProcess.reduce((sum, r) => sum + (r['Sessions that reached checkout'] || 0), 0);
    
    // Calculate session duration average
    const validDurations = sessionsToProcess.filter(r => (r['Average session duration'] || 0) > 0);
    const avgDuration = validDurations.length > 0 
      ? validDurations.reduce((sum, r) => sum + (r['Average session duration'] || 0), 0) / validDurations.length 
      : 0;
    
    // Count sessions with duration > 60 seconds (1 minute)
    const sessionsAbove1Min = sessionsToProcess.filter(r => (r['Average session duration'] || 0) > 60);
    const usersAbove1Min = sessionsAbove1Min.length;
    
    // Count sessions with > 5 pages AND > 1 minute duration
    const sessions5PagesAbove1Min = sessionsToProcess.filter(r => 
      (r['Pageviews'] || 0) > 5 && (r['Average session duration'] || 0) > 60
    );
    const users5PagesAbove1Min = sessions5PagesAbove1Min.length;
    
    // Count ATC sessions with > 1 minute duration
    const atcAbove1Min = sessionsToProcess.filter(r => 
      (r['Sessions with cart additions'] || 0) > 0 && (r['Average session duration'] || 0) > 60
    ).reduce((sum, r) => sum + (r['Sessions with cart additions'] || 0), 0);
    
    // Count checkout sessions with > 1 minute duration
    const checkoutAbove1Min = sessionsToProcess.filter(r => 
      (r['Sessions that reached checkout'] || 0) > 0 && (r['Average session duration'] || 0) > 60
    ).reduce((sum, r) => sum + (r['Sessions that reached checkout'] || 0), 0);
    
    return {
      date: dateStr,
      totalUsers: isUsingFallback ? -999 : totalUsers, // -999 indicates fallback/error
      totalATC: isUsingFallback ? -999 : Math.floor(totalATC),
      totalReachedCheckout: isUsingFallback ? -999 : Math.floor(totalReachedCheckout),
      totalAbandonedCheckout: -999, // No data available
      sessionDuration: isUsingFallback ? -999 : Math.floor(avgDuration),
      usersAbove1Min: isUsingFallback ? -999 : usersAbove1Min,
      users5PagesAbove1Min: isUsingFallback ? -999 : users5PagesAbove1Min,
      atcAbove1Min: isUsingFallback ? -999 : atcAbove1Min,
      checkoutAbove1Min: isUsingFallback ? -999 : checkoutAbove1Min,
      generalQueries: -999, // No data available
      openQueries: -999, // No data available
      onlineOrders: -999 // No data available
    };
  });
  
  return dailyData;
};

const combineAllDailyData = (metaData: any[], googleData: any[], shopifyData: any[], dateRange: DateRange): IntegratedDailyMetrics[] => {
  const combined: IntegratedDailyMetrics[] = [];
  const dates = generateDateArray(dateRange);
  
  // combineAllDailyData - inputs
  
  for (let i = 0; i < dates.length; i++) {
    const dateStr = formatDateForApp(dates[i]);
    
    const metaDay = metaData[i] || { totalSpend: 0, avgCPM: 0, avgCTR: 0 };
    const googleDay = googleData[i] || { totalSpend: 0, avgCPM: 0, avgCTR: 0 };
    const shopifyDay = shopifyData[i] || {
      totalUsers: 0, totalATC: 0, totalReachedCheckout: 0, totalAbandonedCheckout: 0,
      sessionDuration: 0, usersAbove1Min: 0, users5PagesAbove1Min: 0,
      atcAbove1Min: 0, checkoutAbove1Min: 0, generalQueries: 0, openQueries: 0, onlineOrders: 0
    };
    
    // First day data combination (minimal)
    
    combined.push({
      date: dateStr,
      metaSpend: metaDay.totalSpend || 0,  // Add fallback to 0
      metaCTR: metaDay.avgCTR || 0,
      metaCPM: metaDay.avgCPM || 0,
      googleSpend: googleDay.totalSpend || 0,
      googleCTR: googleDay.avgCTR || 0,
      googleCPM: googleDay.avgCPM || 0,
      ...shopifyDay
    });
  }
  
  return combined;
};

const generateAdsetData = (metaData: MetaAdsRecord[], googleData: GoogleAdsRecord[], dateRange: DateRange): any[] => {
  const adsetData: any[] = [];
  const firstDate = formatDateForApp(dateRange.startDate);
  
  // Add Meta campaigns
  metaData.forEach((record, index) => {
    // Use actual Ad Set Level Users from Meta data instead of placeholder
    const adSetUsers = record['Ad Set Level Users'] || 0;
    
    // Calculate quality users (assuming 70% of users have session >1 min as approximation)
    // This can be refined when actual session duration data becomes available
    const qualityUsers = Math.floor(adSetUsers * 0.7);
    
    adsetData.push({
      date: firstDate,
      campaignName: record['Campaign name'],
      campaignId: `meta_${index + 100000}`,
      adsetName: record['Ad set name'],
      adsetId: `meta_adset_${index + 200000}`,
      platform: "Meta",
      spend: Math.floor(record['Amount spent (INR)'] || 0),
      impressions: Math.floor((record['Amount spent (INR)'] || 0) / (record['CPM (cost per 1,000 impressions)'] || 1) * 1000),
      ctr: record['CTR (link click-through rate)'] || 0,
      cpm: record['CPM (cost per 1,000 impressions)'] || 0,
      cpc: 0, // Would need clicks data
      users: adSetUsers, // Now using real Ad Set Level Users from Meta CSV
      sessions: adSetUsers, // Use users as sessions for Meta campaigns  
      totalSessions: adSetUsers, // Alias for compatibility
      qualityCustomers: qualityUsers, // Quality users with session >1 min
      atc: -9999, // No real data available - use -9999 instead of random
      reachedCheckout: -9999, // No real data available - use -9999 instead of random
      purchases: -9999, // No real data available - use -9999 instead of random
      revenue: 0, // Would need purchase data
      roas: 0 // Would calculate from revenue/spend
    });
  });
  
  // Add Google campaigns
  googleData.forEach((record, index) => {
    const cost = parseFloat(record.Cost?.toString().replace(/,/g, '') || '0');
    const cpm = parseFloat(record['Avg. CPM']?.toString() || '0');
    
    adsetData.push({
      date: firstDate,
      campaignName: record.Campaign,
      campaignId: `google_${index + 300000}`,
      adsetName: record.Campaign, // Google doesn't have adsets in this export
      adsetId: `google_adset_${index + 400000}`,
      platform: "Google",
      spend: Math.floor(cost),
      impressions: Math.floor(cost / cpm * 1000),
      ctr: parseFloat(record.CTR?.toString().replace('%', '') || '0'),
      cpm: cpm,
      cpc: 0, // Would need clicks data
      users: -9999, // No real data available - use -9999 instead of random
      atc: -9999, // No real data available - use -9999 instead of random
      reachedCheckout: -9999, // No real data available - use -9999 instead of random
      purchases: -9999, // No real data available - use -9999 instead of random
      revenue: 0, // Would need purchase data
      roas: 0 // Would calculate from revenue/spend
    });
  });
  
  return adsetData;
};


/**
 * Convert configurable processor output to dashboard format
 */
const convertConfigurableOutputToDashboard = (
  outputFiles: { [fileName: string]: any[] },
  dateRange: DateRange
): { dailyMetrics: IntegratedDailyMetrics[], adsetData: any[], dashboardData: DashboardData, dateRange: DateRange | null } => {
  
  const topLevelData = outputFiles['Top Level Daily.csv'] || [];
  const adSetLevelData = outputFiles['Ad Set Level.csv'] || [];
  
  // Convert top level data to the format expected by processOutputFiles
  const topLevelMetrics = topLevelData.map(record => ({
    date: record['Date'] || record['date'] || '',
    metaSpend: parseFloat(record['Meta Spend'] || record['metaSpend'] || '0'),
    metaCTR: parseFloat(record['Meta CTR'] || record['metaCTR'] || '0'),
    metaCPM: parseFloat(record['Meta CPM'] || record['metaCPM'] || '0'),
    googleSpend: parseFloat(record['Google Spend'] || record['googleSpend'] || '0'),
    googleCTR: parseFloat(record['Google CTR'] || record['googleCTR'] || '0'),
    googleCPM: parseFloat(record['Google CPM'] || record['googleCPM'] || '0'),
    totalUsers: parseFloat(record['Total Users'] || record['totalUsers'] || '0'),
    totalATC: parseFloat(record['Total ATC'] || record['totalATC'] || '0'),
    totalReachedCheckout: parseFloat(record['Total Reached Checkout'] || record['totalReachedCheckout'] || '0'),
    totalAbandonedCheckout: parseFloat(record['Total Abandoned Checkout'] || record['totalAbandonedCheckout'] || '0'),
    sessionDuration: parseFloat(record['Session Duration'] || record['sessionDuration'] || '0'),
    usersAbove1Min: parseFloat(record['Users with Session above 1 min'] || record['usersAbove1Min'] || '0'),
    users5PagesAbove1Min: parseFloat(record['Users with Above 5 page views and above 1 min'] || record['users5PagesAbove1Min'] || '0'),
    atcAbove1Min: parseFloat(record['ATC with session duration above 1 min'] || record['atcAbove1Min'] || '0'),
    checkoutAbove1Min: parseFloat(record['Reached Checkout with session duration above 1 min'] || record['checkoutAbove1Min'] || '0'),
    generalQueries: parseFloat(record['General Queries'] || record['generalQueries'] || '0'),
    openQueries: parseFloat(record['Open Queries'] || record['openQueries'] || '0'),
    onlineOrders: parseFloat(record['Online Orders'] || record['onlineOrders'] || '0')
  }));

  // Convert ad set level data to the format expected by processOutputFiles
  const adsetMetrics = adSetLevelData.map(record => ({
    date: record['Date'] || record['date'] || '',
    campaignName: record['Campaign name'] || record['Campaign Name'] || record['campaignName'] || record['UTM Campaign'] || '',
    campaignId: `config_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Use timestamp + small random for uniqueness
    adsetName: record['Ad Set Name'] || record['adsetName'] || record['Ad set name'] || record['UTM Term'] || '',
    adsetId: `config_adset_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // Use timestamp + small random for uniqueness
    platform: record['Platform'] || record['platform'] || 'Configurable',
    spend: parseFloat(record['Ad Set Level Spent'] || record['spend'] || '0'),
    impressions: parseFloat(record['Ad Set Level Impressions'] || record['impressions'] || '0'),
    ctr: parseFloat(record['Ad Set Level CTR'] || record['ctr'] || '0'),
    cpm: parseFloat(record['Ad Set Level CPM'] || record['cpm'] || '0'),
    cpc: parseFloat(record['Cost per user'] || record['costPerUser'] || record['cpc'] || '0'),
    users: parseFloat(record['Ad Set Level Users'] || record['users'] || '0'),
    atc: parseFloat(record['Ad Set Level ATC'] || record['atc'] || '0'),
    reachedCheckout: parseFloat(record['Ad Set Level Reached Checkout'] || record['reachedCheckout'] || '0'),
    purchases: parseFloat(record['Ad Set Level Conversions'] || record['conversions'] || record['purchases'] || '0'),
    revenue: parseFloat(record['Ad Set Level Revenue'] || record['revenue'] || '0'),
    roas: parseFloat(record['Ad Set Level ROAS'] || record['roas'] || '0')
  }));

  // Convert data to daily metrics format for internal use
  const dailyMetrics: IntegratedDailyMetrics[] = topLevelMetrics;
  
  // Use the existing processOutputFiles function for correct dashboard data processing
  const dashboardData = processOutputFiles(topLevelMetrics, adsetMetrics, dateRange);
  
  // Processed configurable data with ${topLevelMetrics.length} daily records and ${adsetMetrics.length} adset records
  
  return {
    dailyMetrics,
    adsetData: adsetMetrics,
    dashboardData,
    dateRange
  };
};

/**
 * Create a set of valid campaign+adset combinations from Meta Ads data
 */
const createMetaCombinationSet = (metaData: MetaAdsRecord[]): Set<string> => {
  const combinationSet = new Set<string>();
  
  metaData.forEach(record => {
    const campaign = record['Campaign name'] || '';
    const adSet = record['Ad set name'] || '';
    const key = `${campaign}|||${adSet}`;
    combinationSet.add(key);
  });
  
  console.log(`📊 Created Meta combination set with ${combinationSet.size} valid campaign+adset combinations`);
  return combinationSet;
};

/**
 * Filter Shopify data to only include combinations that exist in Meta Ads data
 */
const filterShopifyByMetaCoverage = (shopifyData: any[], metaData: MetaAdsRecord[]): { filtered: any[], removed: any[] } => {
  if (metaData.length === 0) {
    console.log('⚠️ No Meta Ads data available - keeping all Shopify data');
    return { filtered: shopifyData, removed: [] };
  }
  
  const validCombinations = createMetaCombinationSet(metaData);
  const filtered: any[] = [];
  const removed: any[] = [];
  
  shopifyData.forEach(record => {
    const campaign = record['Utm campaign'] || record['UTM Campaign'] || '';
    const adSet = record['Utm term'] || record['UTM Term'] || '';
    const key = `${campaign}|||${adSet}`;
    
    if (validCombinations.has(key)) {
      filtered.push(record);
    } else {
      removed.push(record);
      // Log removed combinations for transparency
      if (campaign.includes('BOF') || adSet.includes('VC')) {
        console.log(`🚫 FILTERED OUT: "${campaign}" → "${adSet}" (not found in Meta Ads data)`);
      }
    }
  });
  
  console.log(`✅ Data Quality Filter: Kept ${filtered.length} records, removed ${removed.length} records without Meta Ads coverage`);
  
  if (removed.length > 0) {
    const removedCampaigns = [...new Set(removed.map(r => r['Utm campaign'] || r['UTM Campaign']))];
    console.log(`🚫 Removed campaigns: ${removedCampaigns.join(', ')}`);
  }
  
  return { filtered, removed };
};

/**
 * Create Shopify pivot table (Campaign + AdSet level) - extracted from ConfigurableDataProcessor
 */
const createShopifyPivotFromData = (shopifyData: any[], metaData: MetaAdsRecord[] = []): any[] => {
  // Creating granular Campaign+AdSet level pivot
  
  // FILTER: Apply Meta Ads data coverage filter to remove noise
  const { filtered: validShopifyData, removed: removedRecords } = filterShopifyByMetaCoverage(shopifyData, metaData);
  
  // 🎯 BOF TRACKING: Look for BOF campaigns in filtered Shopify data
  const bofRecords = validShopifyData.filter(record => {
    const campaign = record['Utm campaign'] || record['UTM Campaign'] || '';
    return campaign.includes('BOF');
  });
  
  if (bofRecords.length > 0) {
    console.log('🎯 BOF campaigns found in filtered Shopify data:', bofRecords.length);
    // Detailed BOF logging available in development mode
  }
  
  const pivotMap = new Map<string, any>();

  validShopifyData.forEach(record => {
    const utmCampaign = record['Utm campaign'] || record['UTM Campaign'] || 'Unknown Campaign';
    const utmTerm = record['Utm term'] || record['UTM Term'] || 'Unknown AdSet';
    const key = `${utmCampaign}|||${utmTerm}`;
    
    // 🎯 BOF TRACKING: Process BOF records (detailed logging in dev mode)

    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        'UTM Campaign': utmCampaign,
        'UTM Term': utmTerm,
        'Online store visitors': 0,
        'Sessions': 0,
        'Sessions with cart additions': 0,
        'Sessions that reached checkout': 0,
        'Average session duration': 0,
        'Pageviews': 0,
        'Date': record['Date'] || new Date().toISOString().split('T')[0],
        '_sessionDurationTotal': 0,
        '_visitorCount': 0
      });
    }

    const pivot = pivotMap.get(key)!;
    
    // Helper function to parse numbers
    const parseNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace(/[,$%]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };
    
    // Aggregate numeric fields
    pivot['Online store visitors'] += parseNumber(record['Online store visitors']);
    pivot['Sessions'] += parseNumber(record['Sessions']);
    pivot['Sessions with cart additions'] += parseNumber(record['Sessions with cart additions']);
    pivot['Sessions that reached checkout'] += parseNumber(record['Sessions that reached checkout']);
    pivot['Pageviews'] += parseNumber(record['Pageviews']);
    
    // For average session duration, accumulate total and count
    const sessionDuration = parseNumber(record['Average session duration']);
    const visitors = parseNumber(record['Online store visitors']);
    if (visitors > 0 && sessionDuration > 0) {
      pivot._sessionDurationTotal += sessionDuration * visitors;
      pivot._visitorCount += visitors;
    }
  });

  // Calculate weighted averages and clean up
  const pivotArray = Array.from(pivotMap.values()).map(pivot => {
    if (pivot._visitorCount > 0) {
      pivot['Average session duration'] = pivot._sessionDurationTotal / pivot._visitorCount;
    }
    delete pivot._sessionDurationTotal;
    delete pivot._visitorCount;
    return pivot;
  });

  // 🎯 BOF TRACKING: Final validation complete
  
  console.log(`Created ${pivotArray.length} pivot records from ${validShopifyData.length} filtered Shopify records (${shopifyData.length} original, ${removedRecords.length} filtered out)`);
  return pivotArray;
};