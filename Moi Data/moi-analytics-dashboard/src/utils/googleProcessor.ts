import Papa from 'papaparse';
import { type DateRange, formatDateForApp, generateDateArray } from './dateRangeDetector';

export interface GoogleAdsRecord {
  'Campaign': string;
  'Currency code': string;
  'Cost': number;
  'CTR': string; // e.g., "1.98%"
  'Avg. CPM': number;
}

export interface GoogleDailyData {
  date: string;
  totalSpend: number;
  avgCPM: number;
  avgCTR: number;
  campaignCount: number;
}

export const processGoogleAdsCSV = (file: File): Promise<GoogleAdsRecord[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Skip header rows (Google exports have multiple header rows)
          const allRows = results.data as any[];
          
          // Find the row that starts with actual campaign data
          const dataStartIndex = allRows.findIndex(row => 
            row && typeof row === 'object' && row['Campaign'] && 
            row['Campaign'] !== 'Campaign' && 
            row['Campaign'].trim() !== '' &&
            !row['Campaign'].includes('September')
          );
          
          const data = dataStartIndex >= 0 ? allRows.slice(dataStartIndex) : [];
          resolve(data as GoogleAdsRecord[]);
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

export const processGoogleDataByDay = (records: GoogleAdsRecord[], dateRange: DateRange): GoogleDailyData[] => {
  if (records.length === 0) {
    return [];
  }
  
  // Clean and process the data
  const validRecords = records.filter(record => 
    record.Campaign && 
    record.Campaign.trim() !== '' &&
    !isNaN(parseFloat(record.Cost?.toString() || '0'))
  );
  
  const totalSpend = validRecords.reduce((sum, record) => {
    const cost = parseFloat(record.Cost?.toString().replace(/,/g, '') || '0');
    return sum + cost;
  }, 0);
  
  const avgCPM = validRecords.length > 0 
    ? validRecords.reduce((sum, record) => {
        const cpm = parseFloat(record['Avg. CPM']?.toString() || '0');
        return sum + cpm;
      }, 0) / validRecords.length 
    : 0;
  
  const avgCTR = validRecords.length > 0 
    ? validRecords.reduce((sum, record) => {
        const ctrStr = record.CTR?.toString() || '0%';
        const ctr = parseFloat(ctrStr.replace('%', ''));
        return sum + ctr;
      }, 0) / validRecords.length 
    : 0;
  
  // Distribute spend across days (this is an approximation since Google data is aggregated)
  const dailySpend = totalSpend / dateRange.dayCount;
  
  // Generate daily data using the date range
  const dates = generateDateArray(dateRange);
  const dailyData: GoogleDailyData[] = dates.map(date => ({
    date: formatDateForApp(date),
    totalSpend: Math.floor(dailySpend),
    avgCPM: parseFloat(avgCPM.toFixed(2)),
    avgCTR: parseFloat(avgCTR.toFixed(2)),
    campaignCount: validRecords.length
  }));
  
  return dailyData;
};