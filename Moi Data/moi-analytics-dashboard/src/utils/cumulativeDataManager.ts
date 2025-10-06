/**
 * Cumulative Data Manager
 * Handles daily file uploads with cumulative data aggregation
 */

export interface DailyDataEntry {
  date: string; // ISO date string (YYYY-MM-DD)
  topLevelData: any[];
  adsetData: any[];
  uploadTimestamp: string;
}

export interface CumulativeDataStore {
  dailyEntries: { [date: string]: DailyDataEntry };
  lastUpdated: string;
  version: string;
}

const CUMULATIVE_STORAGE_KEY = 'moi-cumulative-data';
const STORAGE_VERSION = '1.0.0';

/**
 * Get all stored cumulative data
 */
export const getCumulativeData = (): CumulativeDataStore => {
  try {
    const stored = localStorage.getItem(CUMULATIVE_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate version compatibility
      if (parsed.version === STORAGE_VERSION) {
        return parsed;
      } else {
        clearCumulativeData();
      }
    }
  } catch (error) {
  }
  
  // Return empty store
  return {
    dailyEntries: {},
    lastUpdated: new Date().toISOString(),
    version: STORAGE_VERSION
  };
};

/**
 * Store daily data entry (replaces if date already exists)
 */
export const storeDailyData = (
  date: string,
  topLevelData: any[],
  adsetData: any[]
): void => {
  try {
    const store = getCumulativeData();
    
    // Normalize date to YYYY-MM-DD format
    const normalizedDate = normalizeDate(date);
    
    // Store/replace the daily entry
    store.dailyEntries[normalizedDate] = {
      date: normalizedDate,
      topLevelData,
      adsetData,
      uploadTimestamp: new Date().toISOString()
    };
    
    store.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(CUMULATIVE_STORAGE_KEY, JSON.stringify(store));
    
  } catch (error) {
  }
};

/**
 * Get all cumulative data merged across all stored dates
 */
export const getCumulativeDataArrays = (): { 
  topLevelData: any[], 
  adsetData: any[],
  dateRange: { earliest: string, latest: string },
  totalDays: number
} => {
  const store = getCumulativeData();
  const dates = Object.keys(store.dailyEntries).sort();
  
  if (dates.length === 0) {
    return {
      topLevelData: [],
      adsetData: [],
      dateRange: { earliest: '', latest: '' },
      totalDays: 0
    };
  }
  
  
  const allTopLevelData: any[] = [];
  const allAdsetData: any[] = [];
  
  // Merge data from all stored dates
  for (const date of dates) {
    const entry = store.dailyEntries[date];
    
    // Add date information to each row if not present
    const topLevelWithDate = entry.topLevelData.map(row => ({
      ...row,
      date: row.date || date // Ensure date is present
    }));
    
    const adsetWithDate = entry.adsetData.map(row => ({
      ...row,
      date: row.date || date // Ensure date is present
    }));
    
    allTopLevelData.push(...topLevelWithDate);
    allAdsetData.push(...adsetWithDate);
  }
  
  return {
    topLevelData: allTopLevelData,
    adsetData: allAdsetData,
    dateRange: { 
      earliest: dates[0], 
      latest: dates[dates.length - 1] 
    },
    totalDays: dates.length
  };
};

/**
 * Check if data exists for a specific date
 */
export const hasDataForDate = (date: string): boolean => {
  const store = getCumulativeData();
  const normalizedDate = normalizeDate(date);
  return !!store.dailyEntries[normalizedDate];
};

/**
 * Get list of all stored dates
 */
export const getStoredDates = (): string[] => {
  const store = getCumulativeData();
  return Object.keys(store.dailyEntries).sort();
};

/**
 * Clear all cumulative data
 */
export const clearCumulativeData = (): void => {
  try {
    localStorage.removeItem(CUMULATIVE_STORAGE_KEY);
    // Also clear old single-day cache
    localStorage.removeItem('moi-output-data');
    localStorage.removeItem('moi-output-timestamp');
    localStorage.removeItem('moi-server-topLevel');
    localStorage.removeItem('moi-server-topLevel-timestamp');
    localStorage.removeItem('moi-server-adset');
    localStorage.removeItem('moi-server-adset-timestamp');
  } catch (error) {
  }
};

/**
 * Get summary statistics about stored data
 */
export const getCumulativeDataSummary = () => {
  const store = getCumulativeData();
  const dates = Object.keys(store.dailyEntries).sort();
  
  if (dates.length === 0) {
    return {
      totalDays: 0,
      dateRange: null,
      totalSize: '0 KB',
      campaigns: []
    };
  }
  
  // Calculate total data size
  const dataSize = JSON.stringify(store).length;
  const sizeKB = Math.round(dataSize / 1024);
  
  // Get unique campaigns across all days
  const allCampaigns = new Set<string>();
  dates.forEach(date => {
    store.dailyEntries[date].adsetData.forEach((row: any) => {
      if (row.campaignName) {
        allCampaigns.add(row.campaignName);
      }
    });
  });
  
  return {
    totalDays: dates.length,
    dateRange: dates.length > 0 ? {
      start: dates[0],
      end: dates[dates.length - 1]
    } : null,
    totalSize: `${sizeKB} KB`,
    campaigns: Array.from(allCampaigns).sort(),
    lastUpdated: store.lastUpdated
  };
};

/**
 * Normalize date string to YYYY-MM-DD format
 */
const normalizeDate = (date: string): string => {
  try {
    // Handle various date formats and normalize to YYYY-MM-DD
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      // If date parsing fails, try to extract YYYY-MM-DD pattern
      const match = date.match(/(\d{4}-\d{2}-\d{2})/);
      if (match) {
        return match[1];
      }
      // Fallback to current date
      return new Date().toISOString().split('T')[0];
    }
    return parsedDate.toISOString().split('T')[0];
  } catch (error) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Get daily breakdown data (separate rows for each date) for exports
 */
export const getDailyBreakdownData = (): { 
  topLevelData: any[], 
  adsetData: any[],
  dateRange: { earliest: string, latest: string },
  totalDays: number
} => {
  const store = getCumulativeData();
  const dates = Object.keys(store.dailyEntries).sort();
  
  if (dates.length === 0) {
    return {
      topLevelData: [],
      adsetData: [],
      dateRange: { earliest: '', latest: '' },
      totalDays: 0
    };
  }
  
  
  const dailyTopLevelData: any[] = [];
  const dailyAdsetData: any[] = [];
  
  // Keep data separate by date - don't aggregate
  for (const date of dates) {
    const entry = store.dailyEntries[date];
    
    // Add date information to each row and keep them separate
    const topLevelWithDate = entry.topLevelData.map(row => ({
      ...row,
      date: row.date || date // Ensure date is present
    }));
    
    const adsetWithDate = entry.adsetData.map(row => ({
      ...row,
      date: row.date || date // Ensure date is present
    }));
    
    // Add each day's data as separate entries (don't merge/aggregate)
    dailyTopLevelData.push(...topLevelWithDate);
    dailyAdsetData.push(...adsetWithDate);
  }
  
  return {
    topLevelData: dailyTopLevelData,
    adsetData: dailyAdsetData,
    dateRange: { 
      earliest: dates[0], 
      latest: dates[dates.length - 1] 
    },
    totalDays: dates.length
  };
};

/**
 * Detect date from data rows or filename
 */
export const detectDateFromData = (
  topLevelData: any[], 
  adsetData: any[], 
  filename?: string
): string => {
  // Try to get date from the data itself
  if (topLevelData.length > 0 && topLevelData[0].date) {
    return normalizeDate(topLevelData[0].date);
  }
  
  if (adsetData.length > 0 && adsetData[0].date) {
    return normalizeDate(adsetData[0].date);
  }
  
  // Try to extract date from filename
  if (filename) {
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }
  }
  
  // Fallback to current date
  return new Date().toISOString().split('T')[0];
};