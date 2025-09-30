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
          const data = results.data as MetaAdsRecord[];
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
  
  // Use provided date range or fall back to parsing from records
  let actualDateRange: DateRange;
  
  if (dateRange) {
    actualDateRange = dateRange;
  } else {
    // Fallback: Parse date range from first record
    const startDate = records[0]['Reporting starts'];
    const endDate = records[0]['Reporting ends'];
    
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const dayCount = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    actualDateRange = { 
      startDate: startDateObj, 
      endDate: endDateObj, 
      dayCount,
      formattedDates: []
    };
  }
  
  // Distribute spend across days (this is an approximation since Meta data is aggregated)
  const dailySpend = totalSpend / actualDateRange.dayCount;
  
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