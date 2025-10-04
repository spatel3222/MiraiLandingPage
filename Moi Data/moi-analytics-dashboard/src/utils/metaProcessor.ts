import Papa from 'papaparse';
import { type DateRange, formatDateForApp, generateDateArray } from './dateRangeDetector';

export interface MetaAdsRecord {
  'Campaign name': string;
  'Ad set name': string;
  'Amount spent (INR)': number;
  'CPM (cost per 1,000 impressions)': number;
  'CTR (link click-through rate)': number;
  'Ad set delivery': string;
  'Reporting starts': string;
  'Reporting ends': string;
  'Ad Set Level Users'?: number; // Optional in case some CSVs don't have this field
}

export interface MetaDailyData {
  date: string;
  totalSpend: number;
  avgCPM: number;
  avgCTR: number;
  campaignCount: number;
}

export const processMetaAdsCSV = (file: File): Promise<MetaAdsRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Convert string values to numbers for numeric fields
          const data = (results.data as any[]).map(record => ({
            ...record,
            'Amount spent (INR)': parseFloat(record['Amount spent (INR)']) || 0,
            'CPM (cost per 1,000 impressions)': parseFloat(record['CPM (cost per 1,000 impressions)']) || 0,
            'CTR (link click-through rate)': parseFloat(record['CTR (link click-through rate)']) || 0,
            'Ad Set Level Users': parseFloat(record['Ad Set Level Users']) || 0
          })) as MetaAdsRecord[];
          
          // Meta CSV parsing - sample converted record
          
          // Debug BOF campaigns specifically
          const bofCampaigns = data.filter(record => record['Campaign name']?.includes('BOF'));
          if (bofCampaigns.length > 0) {
            console.log('🎯 BOF campaigns found in Meta data:', bofCampaigns.length);
            bofCampaigns.forEach((record, index) => {
              const adSetName = record['Ad set name'];
              const isComplete = adSetName && adSetName.includes('&');
              console.log(`BOF ${index + 1}: ${record['Campaign name']} → "${adSetName}" ${isComplete ? '✅' : '❌ TRUNCATED'}`);
            });
          }
          
          resolve(data);
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

// FORCE REFRESH: 2025-10-03T06:21:00 - Fixed Meta dayCount to 1
export const processMetaDataByDay = (records: MetaAdsRecord[], dateRange?: DateRange): MetaDailyData[] => {
  if (records.length === 0) {
    return [];
  }
  
  // Calculate totals for the entire period
  const totalSpend = records.reduce((sum, record) => sum + (record['Amount spent (INR)'] || 0), 0);
  const avgCPM = records.length > 0 
    ? records.reduce((sum, record) => sum + (record['CPM (cost per 1,000 impressions)'] || 0), 0) / records.length 
    : 0;
  const avgCTR = records.length > 0 
    ? records.reduce((sum, record) => sum + (record['CTR (link click-through rate)'] || 0), 0) / records.length 
    : 0;
  
  // Meta calculations after parsing fix
  
  // Use provided date range or fall back to parsing from records
  let actualDateRange: DateRange;
  
  if (dateRange) {
    actualDateRange = dateRange;
  } else {
    // USER REQUIREMENT: Use only the END date like Google Ads (not start-end range)
    const startDate = records[0]['Reporting starts'];
    const endDate = records[0]['Reporting ends'];
    
    // Meta date parsing (yyyy-mm-dd format)
    const endDateObj = new Date(endDate);
    
    // Create single-day range using only the end date (like Google Ads)
    actualDateRange = { 
      startDate: endDateObj, 
      endDate: endDateObj, 
      dayCount: 1,
      formattedDates: []
    };
  }
  
  // Distribute spend across days (this is an approximation since Meta data is aggregated)
  const dailySpend = totalSpend / actualDateRange.dayCount;
  
  // Meta spend distribution
  
  // Generate daily data using the date range
  const dates = generateDateArray(actualDateRange);
  const dailyData: MetaDailyData[] = dates.map(date => ({
    date: formatDateForApp(date),
    totalSpend: Math.floor(dailySpend),
    avgCPM: parseFloat(avgCPM.toFixed(2)),
    avgCTR: parseFloat(avgCTR.toFixed(2)),
    campaignCount: records.length
  }));
  
  return dailyData;
};