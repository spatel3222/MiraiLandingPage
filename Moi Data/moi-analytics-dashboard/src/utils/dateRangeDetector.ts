import Papa from 'papaparse';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  dayCount: number;
  formattedDates: string[]; // Array of formatted date strings
}

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
            const startDate = new Date(data[0]['Reporting starts']);
            const endDate = new Date(data[0]['Reporting ends']);
            
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
            // Parse dates and normalize to UTC midnight to avoid timezone issues
            const startDate = new Date(dateRangeMatch[1]);
            const endDate = new Date(dateRangeMatch[2]);
            
            // Normalize to UTC midnight
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(0, 0, 0, 0);
            
            resolve(createDateRange(startDate, endDate));
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
      const startDate = new Date(dateRangeMatch[1]);
      const endDate = new Date(dateRangeMatch[2]);
      
      return createDateRange(startDate, endDate);
    }
    
    // Alternative pattern if needed
    const altMatch = filename.match(/(\d{2})-(\d{2})-(\d{4})/g);
    if (altMatch && altMatch.length === 2) {
      const [start, end] = altMatch;
      const startParts = start.split('-');
      const endParts = end.split('-');
      
      const startDate = new Date(`${startParts[2]}-${startParts[0]}-${startParts[1]}`);
      const endDate = new Date(`${endParts[2]}-${endParts[0]}-${endParts[1]}`);
      
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
    
    // Format as "Wed, Sep 10, 25"
    const formatted = currentDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    });
    
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
export const consolidateDateRanges = (ranges: (DateRange | null)[]): DateRange => {
  const validRanges = ranges.filter(r => r !== null) as DateRange[];
  
  if (validRanges.length === 0) {
    // Default fallback to Sep 10-23, 2025 if no ranges detected
    return createDateRange(new Date('2025-09-10'), new Date('2025-09-23'));
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
  
  // Try to detect from each file
  if (files.shopify) {
    const shopifyRange = detectShopifyDateRange(files.shopify.name);
    if (shopifyRange) ranges.push(shopifyRange);
  }
  
  if (files.meta) {
    const metaRange = await detectMetaDateRange(files.meta);
    if (metaRange) ranges.push(metaRange);
  }
  
  if (files.google) {
    const googleRange = await detectGoogleDateRange(files.google);
    if (googleRange) ranges.push(googleRange);
  }
  
  // Consolidate all detected ranges
  return consolidateDateRanges(ranges);
};

/**
 * Formats a date for CSV output
 */
export const formatDateForCSV = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: '2-digit'
  });
};

/**
 * Formats a date for app display (same as CSV for consistency)
 */
export const formatDateForApp = (date: Date): string => {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: '2-digit'
  });
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