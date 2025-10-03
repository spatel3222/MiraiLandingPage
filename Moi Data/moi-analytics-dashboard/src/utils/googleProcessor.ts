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
      header: false, // Don't treat first row as headers
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const allRows = results.data as any[];
          
          // Google Ads CSV structure:
          // Row 0: "Campaign performance" (title)
          // Row 1: Date range (e.g., "September 29, 2025 - September 29, 2025")
          // Row 2: Actual column headers
          // Row 3+: Data rows
          
          if (allRows.length < 4) {
            console.warn('Google Ads CSV has less than 4 rows, might be empty');
            resolve([]);
            return;
          }
          
          // Get headers from row 2 (index 2)
          const headers = allRows[2];
          
          // Process data rows starting from row 3 (index 3)
          const data = allRows.slice(3).map(row => {
            const obj: any = {};
            headers.forEach((header: string, index: number) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index];
              }
            });
            return obj;
          }).filter(row => 
            // Filter out empty rows or rows without a campaign name
            row && 
            row['Campaign'] && 
            row['Campaign'].trim() !== '' &&
            row['Campaign'] !== 'Campaign' // Skip any duplicate header rows
          ).map(record => ({
            // Convert string values to numbers for numeric fields
            ...record,
            'Cost': parseFloat(record['Cost']?.toString().replace(/,/g, '') || '0'),
            'Avg. CPM': parseFloat(record['Avg. CPM']?.toString().replace(/,/g, '') || '0')
          }));
          
          console.log(`Parsed ${data.length} Google Ads campaigns`);
          console.log('🔍 Google CSV parsing - sample converted record:', {
            campaign: data[0]?.['Campaign'],
            cost: data[0]?.['Cost'],
            costType: typeof data[0]?.['Cost'],
            cpm: data[0]?.['Avg. CPM'],
            cpmType: typeof data[0]?.['Avg. CPM']
          });
          resolve(data as GoogleAdsRecord[]);
        } catch (error) {
          console.error('Error parsing Google Ads CSV:', error);
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