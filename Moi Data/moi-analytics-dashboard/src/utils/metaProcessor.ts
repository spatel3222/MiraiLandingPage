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
          // Convert string values to numbers for numeric fields
          const data = (results.data as any[]).map(record => ({
            ...record,
            'Amount spent (INR)': parseFloat(record['Amount spent (INR)']) || 0,
            'CPM (cost per 1,000 impressions)': parseFloat(record['CPM (cost per 1,000 impressions)']) || 0,
            'CTR (link click-through rate)': parseFloat(record['CTR (link click-through rate)']) || 0
          })) as MetaAdsRecord[];
          
          console.log('🔍 Meta CSV parsing - sample converted record:', {
            campaign: data[0]['Campaign name'],
            spend: data[0]['Amount spent (INR)'],
            spendType: typeof data[0]['Amount spent (INR)'],
            cpm: data[0]['CPM (cost per 1,000 impressions)'],
            ctr: data[0]['CTR (link click-through rate)']
          });
          
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
  
  console.log('🔍 Meta calculations after parsing fix:', {
    totalSpend,
    totalSpendType: typeof totalSpend,
    avgCPM,
    avgCTR,
    recordCount: records.length,
    firstRecordSpend: records[0] ? records[0]['Amount spent (INR)'] : 'none'
  });
  
  // Use provided date range or fall back to parsing from records
  let actualDateRange: DateRange;
  
  if (dateRange) {
    actualDateRange = dateRange;
  } else {
    // USER REQUIREMENT: Use only the END date like Google Ads (not start-end range)
    const startDate = records[0]['Reporting starts'];
    const endDate = records[0]['Reporting ends'];
    
    console.log('🔍 Meta date parsing (yyyy-mm-dd format):', {
      reportingStarts: startDate,
      reportingEnds: endDate,
      startDateType: typeof startDate,
      endDateType: typeof endDate
    });
    
    const endDateObj = new Date(endDate);
    
    console.log('🔍 Meta parsed dates - USING END DATE ONLY:', {
      ignoredStartDate: startDate,
      usingEndDate: endDate,
      endDateObj: endDateObj.toISOString().split('T')[0],
      isValidEnd: !isNaN(endDateObj.getTime())
    });
    
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
  
  console.log('🔥 CRITICAL DEBUG - Meta spend distribution:', {
    totalSpend,
    dayCount: actualDateRange.dayCount,
    dailySpend,
    shouldBe57721: totalSpend === 57721,
    shouldBe1Day: actualDateRange.dayCount === 1,
    startDate: actualDateRange.startDate.toISOString().split('T')[0],
    endDate: actualDateRange.endDate.toISOString().split('T')[0],
    datesMatch: actualDateRange.startDate.toISOString().split('T')[0] === actualDateRange.endDate.toISOString().split('T')[0]
  });
  
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