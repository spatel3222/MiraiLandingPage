/**
 * SINGLE SOURCE OF TRUTH: Date Normalizer
 * Converts ANY date format from input files to consistent YYYY-MM-DD format
 */

export interface NormalizedDate {
  isoString: string; // Always YYYY-MM-DD
  originalString: string;
  source: 'meta' | 'google' | 'shopify' | 'unknown';
}

/**
 * Normalizes any date string/Date object to YYYY-MM-DD format
 * This is the ONLY function that should handle date format conversion
 */
export const normalizeDateToISO = (
  dateInput: string | Date,
  source: 'meta' | 'google' | 'shopify' | 'unknown' = 'unknown'
): NormalizedDate => {
  let originalString: string;
  let parsedDate: Date;

  // Handle Date object input
  if (dateInput instanceof Date) {
    originalString = dateInput.toISOString();
    parsedDate = dateInput;
  } else {
    originalString = dateInput;
    parsedDate = parseInputDateString(dateInput);
  }

  // Convert to YYYY-MM-DD format in local timezone (no UTC shifts)
  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');
  const isoString = `${year}-${month}-${day}`;

  console.log(`🔄 Date normalized [${source}]: "${originalString}" → "${isoString}"`);

  return {
    isoString,
    originalString,
    source
  };
};

/**
 * Parse various date string formats into Date object
 */
const parseInputDateString = (dateStr: string): Date => {
  // Clean the input
  const cleaned = dateStr.trim().replace(/"/g, '');

  // Pattern 1: YYYY-MM-DD (ISO format)
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const [year, month, day] = cleaned.split('-').map(Number);
    return new Date(year, month - 1, day); // months are 0-based
  }

  // Pattern 2: MM/DD/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
    const [month, day, year] = cleaned.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Pattern 3: DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
    // Ambiguous - assume MM/DD/YYYY for now
    const [month, day, year] = cleaned.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Pattern 4: "September 29, 2025" (Google format)
  if (/^[A-Za-z]+ \d{1,2}, \d{4}$/.test(cleaned)) {
    return new Date(cleaned);
  }

  // Pattern 5: "Month DD, YYYY" variations
  if (/^[A-Za-z]{3,} \d{1,2}, \d{4}$/.test(cleaned)) {
    return new Date(cleaned);
  }

  // Pattern 6: DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(cleaned)) {
    const [day, month, year] = cleaned.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  // Pattern 7: YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(cleaned)) {
    const [year, month, day] = cleaned.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Fallback: try native Date parsing
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) {
    return fallback;
  }

  // Last resort: current date
  console.warn(`⚠️ Could not parse date: "${cleaned}", using current date`);
  return new Date();
};

/**
 * Normalize date ranges from various sources
 */
export const normalizeDateRange = (
  startDate: string | Date,
  endDate: string | Date,
  source: 'meta' | 'google' | 'shopify' | 'unknown'
): { start: NormalizedDate; end: NormalizedDate } => {
  return {
    start: normalizeDateToISO(startDate, source),
    end: normalizeDateToISO(endDate, source)
  };
};

/**
 * Extract date from Google CSV header pattern
 */
export const extractGoogleDateFromHeader = (headerLine: string): NormalizedDate | null => {
  // Pattern: "September 29, 2025 - September 29, 2025"
  const dateRangeMatch = headerLine.match(/(\w+\s+\d+,\s+\d{4})\s*-\s*(\w+\s+\d+,\s+\d{4})/);
  if (dateRangeMatch) {
    // Extract the END date (second one) as per existing logic
    const endDateStr = dateRangeMatch[2];
    return normalizeDateToISO(endDateStr, 'google');
  }
  return null;
};

/**
 * Extract date from Shopify filename
 */
export const extractShopifyDateFromFilename = (filename: string): { start: NormalizedDate; end: NormalizedDate } | null => {
  // Pattern: "Shopify Export  2025-09-10 to 2025-09-23.csv"
  const dateRangeMatch = filename.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
  if (dateRangeMatch) {
    return {
      start: normalizeDateToISO(dateRangeMatch[1], 'shopify'),
      end: normalizeDateToISO(dateRangeMatch[2], 'shopify')
    };
  }
  return null;
};

/**
 * Normalize data records by converting date fields
 */
export const normalizeRecordDates = <T extends Record<string, any>>(
  records: T[],
  dateFields: string[],
  source: 'meta' | 'google' | 'shopify' | 'unknown'
): T[] => {
  return records.map(record => {
    const normalized = { ...record };
    
    dateFields.forEach(field => {
      if (record[field] && typeof record[field] === 'string') {
        const normalizedDate = normalizeDateToISO(record[field], source);
        normalized[field] = normalizedDate.isoString;
      }
    });
    
    return normalized;
  });
};

/**
 * Generate date array between two dates in ISO format
 */
export const generateISODateArray = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};