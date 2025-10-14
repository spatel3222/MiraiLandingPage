import Papa from 'papaparse';
import { normalizeDateToISO, normalizeDateRange, extractGoogleDateFromHeader, extractShopifyDateFromFilename, generateISODateArray } from './dateNormalizer';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  dayCount: number;
  formattedDates: string[]; // Array of formatted date strings
}

// REMOVED: normalizeToLocalTime - replaced with dateNormalizer.ts

/**
 * Detects date range from Meta CSV file
 * Looks for "Reporting starts" and "Reporting ends" columns
 */
export const detectMetaDateRange = async (file: File): Promise<DateRange | null> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 2, // Only need first row to get date range
      complete: (results) => {
        try {
          const data = results.data as any[];
          if (data.length > 0 && data[0]['Reporting starts'] && data[0]['Reporting ends']) {
            const normalizedRange = normalizeDateRange(
              data[0]['Reporting starts'],
              data[0]['Reporting ends'],
              'meta'
            );
            // Convert normalized ISO strings back to Date objects for createDateRange
            const startDate = new Date(normalizedRange.start.isoString + 'T00:00:00');
            const endDate = new Date(normalizedRange.end.isoString + 'T00:00:00');
            
            console.log('🔍 Meta date parsing (normalized):', {
              originalStart: data[0]['Reporting starts'],
              originalEnd: data[0]['Reporting ends'],
              normalizedStart: startDate.toISOString(),
              normalizedEnd: endDate.toISOString()
            });
            
            resolve(createDateRange(startDate, endDate));
          } else {
            resolve(null);
          }
        } catch (error) {
          console.error('Error parsing Meta date range:', error);
          resolve(null);
        }
      },
      error: () => resolve(null)
    });
  });
};

/**
 * Detects date range from Google CSV file
 * Looks for date range in header like "September 10, 2025 - September 23, 2025"
 */
export const detectGoogleDateRange = async (file: File): Promise<DateRange | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        
        // Look for date range pattern in first few lines
        for (const line of lines.slice(0, 5)) {
          // Pattern: "Month DD, YYYY - Month DD, YYYY"
          const dateRangeMatch = line.match(/(\w+\s+\d+,\s+\d{4})\s*-\s*(\w+\s+\d+,\s+\d{4})/);
          if (dateRangeMatch) {
            // USER REQUIREMENT: Extract and use only the LAST date from the range
            const endDateStr = dateRangeMatch[2]; // "September 29, 2025"
            const normalizedEndDate = normalizeDateToISO(endDateStr, 'google');
            const endDate = new Date(normalizedEndDate.isoString + 'T00:00:00');
            
            console.log('🔍 Google date extraction (normalized):', {
              fullRange: line.trim(),
              extractedEndDate: endDateStr,
              normalizedDate: endDate.toISOString(),
              localDateString: endDate.toISOString().split('T')[0]
            });
            
            // Create single-day range using only the end date
            resolve(createDateRange(endDate, endDate));
            return;
          }
        }
        resolve(null);
      } catch (error) {
        console.error('Error parsing Google date range:', error);
        resolve(null);
      }
    };
    reader.readAsText(file);
  });
};

/**
 * Detects date range from Shopify filename
 * Pattern: "Shopify Export  2025-09-10 to 2025-09-23.csv"
 */
export const detectShopifyDateRange = (filename: string): DateRange | null => {
  try {
    // Pattern: YYYY-MM-DD to YYYY-MM-DD
    const dateRangeMatch = filename.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
    if (dateRangeMatch) {
      const normalizedRange = normalizeDateRange(
        dateRangeMatch[1],
        dateRangeMatch[2],
        'shopify'
      );
      const startDate = new Date(normalizedRange.start.isoString + 'T00:00:00');
      const endDate = new Date(normalizedRange.end.isoString + 'T00:00:00');
      
      console.log('🔍 Shopify filename date parsing (normalized):', {
        originalStart: dateRangeMatch[1],
        originalEnd: dateRangeMatch[2],
        normalizedStart: startDate.toISOString(),
        normalizedEnd: endDate.toISOString()
      });
      
      return createDateRange(startDate, endDate);
    }
    
    // Alternative pattern if needed
    const altMatch = filename.match(/(\d{2})-(\d{2})-(\d{4})/g);
    if (altMatch && altMatch.length === 2) {
      const [start, end] = altMatch;
      const startParts = start.split('-');
      const endParts = end.split('-');
      
      const normalizedRange = normalizeDateRange(
        `${startParts[2]}-${startParts[0]}-${startParts[1]}`,
        `${endParts[2]}-${endParts[0]}-${endParts[1]}`,
        'shopify'
      );
      const startDate = new Date(normalizedRange.start.isoString + 'T00:00:00');
      const endDate = new Date(normalizedRange.end.isoString + 'T00:00:00');
      
      console.log('🔍 Shopify alt pattern date parsing (normalized):', {
        originalStart: start,
        originalEnd: end,
        normalizedStart: normalizedRange.start.isoString,
        normalizedEnd: normalizedRange.end.isoString
      });
      
      return createDateRange(startDate, endDate);
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing Shopify date range:', error);
    return null;
  }
};

/**
 * Creates a DateRange object with all necessary date information
 */
function createDateRange(startDate: Date, endDate: Date): DateRange {
  const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const formattedDates: string[] = [];
  
  // Generate formatted dates for each day in range
  for (let i = 0; i < dayCount; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    // CRITICAL FIX: Use date normalizer for consistency across entire pipeline
    const normalized = normalizeDateToISO(currentDate, 'unknown');
    const formatted = normalized.isoString;
    
    formattedDates.push(formatted);
  }
  
  return {
    startDate,
    endDate,
    dayCount,
    formattedDates
  };
}

/**
 * Consolidates multiple date ranges to find the most comprehensive range
 */
export const consolidateDateRanges = (ranges: (DateRange | null)[], shopifyData?: any[]): DateRange => {
  const validRanges = ranges.filter(r => r !== null) as DateRange[];
  
  console.log('🔍 Consolidating date ranges:', validRanges.map(r => {
    const startNormalized = normalizeDateToISO(r.startDate, 'unknown');
    const endNormalized = normalizeDateToISO(r.endDate, 'unknown');
    return {
      start: startNormalized.isoString,
      end: endNormalized.isoString,
      dayCount: r.dayCount
    };
  }));
  
  if (validRanges.length === 0) {
    // If we have Shopify data, try to determine date from the current date or data
    // For single-day data scenarios, create a single-day range
    if (shopifyData && shopifyData.length > 0) {
      // Try to find date information in the data or use a reasonable single-day default
      const normalizedToday = normalizeDateToISO(new Date().toISOString().split('T')[0], 'unknown');
      const singleDayDate = new Date(normalizedToday.isoString + 'T00:00:00'); // Use current date as fallback
      console.log('🔍 No date range detected from files, creating single-day range for:', singleDayDate.toDateString());
      return createDateRange(singleDayDate, singleDayDate);
    }
    
    // Last resort fallback - use current week if no data available
    console.log('⚠️ No date range detected and no Shopify data, using current week as fallback');
    // Use current date range as fallback instead of hardcoded dates
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];
    const normalizedFallbackStart = normalizeDateToISO(weekAgo, 'unknown');
    const normalizedFallbackEnd = normalizeDateToISO(todayStr, 'unknown');
    const fallbackStart = new Date(normalizedFallbackStart.isoString + 'T00:00:00'); // 7 days ago
    const fallbackEnd = new Date(normalizedFallbackEnd.isoString + 'T00:00:00'); // Today
    return createDateRange(fallbackStart, fallbackEnd);
  }
  
  // Find earliest start and latest end
  let earliestStart = validRanges[0].startDate;
  let latestEnd = validRanges[0].endDate;
  
  for (const range of validRanges) {
    if (range.startDate < earliestStart) {
      earliestStart = range.startDate;
    }
    if (range.endDate > latestEnd) {
      latestEnd = range.endDate;
    }
  }
  
  const earliestStartNormalized = normalizeDateToISO(earliestStart, 'unknown');
  const latestEndNormalized = normalizeDateToISO(latestEnd, 'unknown');
  console.log('🔍 Consolidation result:', {
    earliestStart: earliestStartNormalized.isoString,
    latestEnd: latestEndNormalized.isoString,
    timeDifference: latestEnd.getTime() - earliestStart.getTime()
  });
  
  return createDateRange(earliestStart, latestEnd);
};

/**
 * Main function to detect date range from all input files
 */
export const detectDateRangeFromFiles = async (files: {
  shopify: File | null;
  meta: File | null;
  google: File | null;
}): Promise<DateRange> => {
  const ranges: (DateRange | null)[] = [];
  let shopifyData: any[] = [];
  
  // Try to detect from each file
  if (files.shopify) {
    const shopifyRange = detectShopifyDateRange(files.shopify.name);
    if (shopifyRange) ranges.push(shopifyRange);
    
    // If no range found from filename, try to parse shopify data for date info
    if (!shopifyRange) {
      try {
        // Quick parse to get some data for fallback logic
        const Papa = await import('papaparse');
        Papa.parse(files.shopify, {
          header: true,
          preview: 5,
          complete: (results) => {
            shopifyData = results.data as any[];
          }
        });
      } catch (error) {
        console.log('Could not parse Shopify data for date detection');
      }
    }
  }
  
  if (files.meta) {
    const metaRange = await detectMetaDateRange(files.meta);
    if (metaRange) ranges.push(metaRange);
  }
  
  if (files.google) {
    const googleRange = await detectGoogleDateRange(files.google);
    if (googleRange) ranges.push(googleRange);
  }
  
  // Consolidate all detected ranges, passing Shopify data for better fallback
  return consolidateDateRanges(ranges, shopifyData);
};

/**
 * Formats a date for CSV output - USE SAME ISO FORMAT AS APP
 */
export const formatDateForCSV = (date: Date): string => {
  // CRITICAL FIX: Use same ISO format as formatDateForApp for consistency
  return date.toISOString().split('T')[0];
};

/**
 * Formats a date for app display - USE DATE NORMALIZER to match Shopify CSV
 */
export const formatDateForApp = (date: Date): string => {
  // CRITICAL FIX: Use date normalizer to avoid timezone shifts
  const normalized = normalizeDateToISO(date, 'unknown');
  return normalized.isoString;
};

/**
 * Generates an array of dates for a given range
 */
export const generateDateArray = (dateRange: DateRange): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(dateRange.startDate);
  
  while (currentDate <= dateRange.endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Alternative overload for direct date parameters
 */
export const generateDateArrayFromDates = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

/**
 * Formats a date range for filename use
 */
export const formatDateRangeForFilename = (dateRange: DateRange): string => {
  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]}${date.getDate()}`;
  };
  
  return `${formatDate(dateRange.startDate)}-${formatDate(dateRange.endDate)}_${dateRange.endDate.getFullYear()}`;
};
/**
 * Detect date range from JSON data (for Supabase processing)
 */
export function detectDateRangeFromData(data: {
  shopify?: any[];
  meta?: any[];
  google?: any[];
}): DateRange | null {
  const allDates: string[] = [];
  
  // Extract dates from Shopify data
  if (data.shopify && data.shopify.length > 0) {
    data.shopify.forEach((row: any) => {
      const date = row['Day'] || row['Date'];
      if (date) {
        try {
          const normalized = normalizeDateToISO(date, 'unknown').isoString;
          if (normalized) allDates.push(normalized);
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
  }
  
  // Extract dates from Meta data
  if (data.meta && data.meta.length > 0) {
    data.meta.forEach((row: any) => {
      const date = row['Date'];
      if (date) {
        try {
          const normalized = normalizeDateToISO(date, 'unknown').isoString;
          if (normalized) allDates.push(normalized);
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
  }
  
  // Extract dates from Google data
  if (data.google && data.google.length > 0) {
    data.google.forEach((row: any) => {
      const date = row['Date'];
      if (date) {
        try {
          const normalized = normalizeDateToISO(date, 'unknown').isoString;
          if (normalized) allDates.push(normalized);
        } catch (e) {
          // Skip invalid dates
        }
      }
    });
  }
  
  if (allDates.length === 0) {
    console.warn('No valid dates found in data');
    return null;
  }
  
  // Sort and get unique dates
  const uniqueDates = Array.from(new Set(allDates)).sort();
  
  console.log('📅 Date range detection from data:', {
    allDatesCount: allDates.length,
    uniqueDatesCount: uniqueDates.length,
    firstDate: uniqueDates[0],
    lastDate: uniqueDates[uniqueDates.length - 1],
    allUniqueDates: uniqueDates
  });
  
  // Log the actual unique dates for debugging
  console.log('📅 All unique dates found:', uniqueDates);
  
  // For single-day data, use the most common date
  // For multi-day data, use the actual range
  if (uniqueDates.length === 1) {
    // Only one unique date - use it for both start and end
    return {
      startDate: uniqueDates[0],
      endDate: uniqueDates[0],
      dataPoints: 1
    };
  }
  
  // Check if most dates are the same (e.g., 1000 records of Sept 29, but a few outliers)
  const dateFrequency: Record<string, number> = {};
  allDates.forEach(date => {
    dateFrequency[date] = (dateFrequency[date] || 0) + 1;
  });
  
  // Find the most common date
  let mostCommonDate = uniqueDates[0];
  let maxCount = 0;
  Object.entries(dateFrequency).forEach(([date, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonDate = date;
    }
  });
  
  // If one date represents > 95% of all records, use just that date
  if (maxCount > allDates.length * 0.95) {
    console.log(`📅 Single dominant date detected: ${mostCommonDate} (${maxCount}/${allDates.length} records)`);
    return {
      startDate: mostCommonDate,
      endDate: mostCommonDate,
      dataPoints: 1
    };
  }
  
  // Otherwise use the full range
  return {
    startDate: uniqueDates[0],
    endDate: uniqueDates[uniqueDates.length - 1],
    dataPoints: uniqueDates.length
  };
}

// Simple helper for date normalization
function normalizeDate(date: string): string | null {
  try {
    const normalized = normalizeDateToISO(date, 'unknown');
    return normalized.isoString;
  } catch (e) {
    return null;
  }
}
