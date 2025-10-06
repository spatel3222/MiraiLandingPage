import { parse } from 'papaparse';

export interface ValidationResult {
  isValid: boolean;
  source: 'meta' | 'google' | 'shopify' | 'unknown';
  errors: ValidationError[];
  warnings: ValidationWarning[];
  rowCount: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sampleData?: any[];
}

export interface ValidationError {
  type: 'missing_columns' | 'invalid_format' | 'empty_file' | 'invalid_date' | 'duplicate_data';
  message: string;
  details?: any;
  row?: number;
  column?: string;
}

export interface ValidationWarning {
  type: 'missing_data' | 'format_inconsistency' | 'large_file' | 'date_gaps';
  message: string;
  details?: any;
  row?: number;
  column?: string;
}

interface SourceSchema {
  required: string[];
  optional: string[];
  dateColumns: string[];
  numericColumns: string[];
}

export class FileValidationService {
  private static readonly MAX_FILE_SIZE = 150 * 1024 * 1024; // 150MB
  private static readonly MAX_ROWS_PREVIEW = 5;

  private static readonly SCHEMAS: Record<string, SourceSchema> = {
    meta: {
      required: ['Reporting ends', 'Campaign Name', 'Ad Set Name', 'Amount spent (INR)'],
      optional: ['Reach', 'Frequency', 'CTR', 'CPC', 'CPM', 'Impressions', 'Link Clicks'],
      dateColumns: ['Reporting ends'],
      numericColumns: ['Amount spent (INR)', 'Reach', 'Frequency']
    },
    google: {
      required: ['Campaign', 'Cost', 'Clicks', 'Conversions'],
      optional: ['Impressions', 'CTR', 'CPC', 'CPM', 'Conversion Rate'],
      dateColumns: [], // Date comes from metadata, not column headers
      numericColumns: ['Cost', 'Clicks', 'Impressions', 'Conversions']
    },
    shopify: {
      required: ['Day', 'UTM campaign', 'Online store visitors'],
      optional: ['UTM term', 'Cart Additions', 'Checkouts', 'Orders', 'Total Sales'],
      dateColumns: ['Day'],
      numericColumns: ['Online store visitors', 'Cart Additions', 'Checkouts', 'Orders', 'Total Sales']
    }
  };

  static async validateFile(file: File): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: false,
      source: 'unknown',
      errors: [],
      warnings: [],
      rowCount: 0
    };

    try {
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        result.errors.push({
          type: 'invalid_format',
          message: `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of 150MB`
        });
        return result;
      }

      // Check file type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        result.errors.push({
          type: 'invalid_format',
          message: 'Only CSV files are supported'
        });
        return result;
      }

      // Parse CSV
      const csvData = await this.parseCSV(file);
      
      if (csvData.length === 0) {
        result.errors.push({
          type: 'empty_file',
          message: 'File contains no data rows'
        });
        return result;
      }

      result.rowCount = csvData.length;

      // Detect source type
      const source = this.detectSource(csvData[0]);
      result.source = source;

      if (source === 'unknown') {
        result.errors.push({
          type: 'invalid_format',
          message: 'Unable to detect file source (Meta, Google, or Shopify). Please check column headers.'
        });
        return result;
      }

      // Validate schema
      const schemaValidation = this.validateSchema(csvData, source);
      result.errors.push(...schemaValidation.errors);
      result.warnings.push(...schemaValidation.warnings);

      // Validate dates and get date range
      const dateValidation = this.validateDates(csvData, source);
      result.errors.push(...dateValidation.errors);
      result.warnings.push(...dateValidation.warnings);
      if (dateValidation.dateRange) {
        result.dateRange = dateValidation.dateRange;
      }

      // Validate numeric data
      const numericValidation = this.validateNumericData(csvData, source);
      result.errors.push(...numericValidation.errors);
      result.warnings.push(...numericValidation.warnings);

      // Check for large file warning
      if (file.size > 50 * 1024 * 1024) {
        result.warnings.push({
          type: 'large_file',
          message: `Large file detected (${(file.size / 1024 / 1024).toFixed(1)}MB). Processing may take longer.`
        });
      }

      // Add sample data for preview
      result.sampleData = csvData.slice(0, this.MAX_ROWS_PREVIEW);

      // Determine if valid
      result.isValid = result.errors.length === 0;

      return result;

    } catch (error) {
      result.errors.push({
        type: 'invalid_format',
        message: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      return result;
    }
  }

  private static async parseCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      // First, read the file as text to detect Google Ads format
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvContent = e.target?.result as string;
        const lines = csvContent.split('\n');
        
        // Check if this is a Google Ads CSV (metadata in first 2 rows)
        console.log('🔍 CSV FORMAT DETECTION:');
        console.log('  First 3 lines of CSV:', lines.slice(0, 3));
        const isGoogleAds = this.isGoogleAdsFormat(lines);
        console.log('  Is Google Ads format?', isGoogleAds);
        
        if (isGoogleAds) {
          console.log('✅ Using Google Ads parser with metadata handling');
          // Parse Google Ads format with metadata handling
          this.parseGoogleAdsCSV(csvContent, resolve, reject);
        } else {
          console.log('📝 Using standard CSV parser');
          // Parse standard CSV format
          parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            transform: (value) => value.trim(),
            complete: (results) => {
              if (results.errors.length > 0) {
                reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
              } else {
                resolve(results.data);
              }
            },
            error: (error) => {
              reject(new Error(`CSV parsing failed: ${error.message}`));
            }
          });
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private static isGoogleAdsFormat(lines: string[]): boolean {
    // Google Ads CSVs typically have metadata in first few rows
    // Look for patterns like date ranges, account info, etc.
    console.log('🔎 GOOGLE ADS DETECTION:');
    console.log('  Total lines:', lines.length);
    
    if (lines.length < 3) {
      console.log('  ❌ Not enough lines (need at least 3)');
      return false;
    }
    
    // Check if first line looks like metadata (not column headers)
    const firstLine = lines[0].toLowerCase();
    const secondLine = lines[1].toLowerCase();
    console.log('  Row 1:', firstLine);
    console.log('  Row 2:', secondLine);
    
    // First, check if this is actually a Shopify file (headers in first row)
    if (firstLine.includes('utm campaign') || firstLine.includes('online store visitors') || firstLine.includes('day')) {
      console.log('  ❌ This is a Shopify file (headers in first row), not Google Ads');
      return false;
    }
    
    // Google Ads metadata often contains these patterns
    const metadataPatterns = [
      'account',
      'time zone',
      'currency',
      'date range',
      'downloaded',
      'report',
      'performance',  // Added: "Campaign performance"
      '2024',         // Added: Date patterns
      '2025',         // Added: Date patterns  
      'september',    // Added: Month names
      'october',
      'november',
      'december'
    ];
    
    const hasMetadataPattern = metadataPatterns.some(pattern => 
      firstLine.includes(pattern) || secondLine.includes(pattern)
    );
    console.log('  Has metadata pattern?', hasMetadataPattern);
    
    // Also check if third line has typical Google Ads headers
    const thirdLine = lines[2]?.toLowerCase() || '';
    console.log('  Row 3:', thirdLine);
    const googleHeaders = ['campaign', 'cost', 'clicks', 'impressions'];
    const hasGoogleHeaders = googleHeaders.some(header => thirdLine.includes(header));
    console.log('  Has Google headers?', hasGoogleHeaders);
    
    const result = hasMetadataPattern && hasGoogleHeaders;
    console.log('  Final result:', result);
    return result;
  }

  private static parseGoogleAdsCSV(csvContent: string, resolve: Function, reject: Function): void {
    const lines = csvContent.split('\n');
    
    console.log('🔍 Google Ads CSV structure analysis:');
    console.log('  Row 1 (Basic info):', lines[0]);
    console.log('  Row 2 (Date info):', lines[1]);
    console.log('  Row 3 (Headers):', lines[2]);
    console.log('  Row 4 (First data):', lines[3]);
    
    // Extract date information from second row (row 2)
    let dateStamp = '';
    if (lines[1]) {
      const secondRow = lines[1];
      console.log('  🔍 Date extraction from:', secondRow);
      
      // Try different date formats
      let dateMatch = secondRow.match(/(\d{4}-\d{2}-\d{2})/); // 2024-09-29 format
      if (!dateMatch) {
        // Try "September 29, 2025" format - extract first date
        const monthDateMatch = secondRow.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2}),?\s+(\d{4})/i);
        if (monthDateMatch) {
          const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
          const month = monthNames.indexOf(monthDateMatch[1].toLowerCase()) + 1;
          const day = monthDateMatch[2].padStart(2, '0');
          const year = monthDateMatch[3];
          dateStamp = `${year}-${month.toString().padStart(2, '0')}-${day}`;
          console.log('  📅 Converted date:', `${monthDateMatch[1]} ${monthDateMatch[2]}, ${monthDateMatch[3]} → ${dateStamp}`);
        }
      } else {
        dateStamp = dateMatch[1];
        console.log('  📅 Extracted date:', dateStamp);
      }
    }
    
    // Fixed structure: Row 3 is headers, Row 4+ is data
    const headerRowIndex = 2; // Row 3 (0-indexed)
    const dataStartIndex = 3;  // Row 4+ (0-indexed)
    
    // Reconstruct CSV with just headers and data
    const headerRow = lines[headerRowIndex];
    const dataRows = lines.slice(dataStartIndex).filter(line => line.trim());
    
    const cleanCSV = [headerRow, ...dataRows].join('\n');
    
    // Debug logging
    console.log('🔍 Google Ads parsing debug:');
    console.log('Header row:', headerRow);
    console.log('Data rows count:', dataRows.length);
    console.log('Clean CSV preview:', cleanCSV.substring(0, 200));
    
    // Parse the cleaned CSV with more relaxed settings
    parse(cleanCSV, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      quoteChar: '"',
      transformHeader: (header) => header.trim(),
      transform: (value) => value ? value.trim() : value,
      dynamicTyping: false,
      relaxColumnCount: true, // Allow rows with different column counts
      skipFirstNLines: 0,
      complete: (results) => {
        console.log('📊 Parse results:', results);
        console.log('📊 Results meta:', results.meta);
        console.log('📊 Field count:', results.meta.fields?.length);
        console.log('📊 Sample data:', results.data?.slice(0, 2));
        
        if (results.errors.length > 0) {
          console.warn('⚠️ Parse errors:', results.errors);
          // Filter out field count errors since we expect them in Google Ads format
          const criticalErrors = results.errors.filter(error => 
            error.type === 'Delimiter' || error.type === 'MissingQuotes'
          );
          if (criticalErrors.length > 0) {
            console.error('❌ Critical parsing errors:', criticalErrors);
            reject(new Error(`Google Ads CSV parsing error: ${criticalErrors[0].message}`));
            return;
          }
          // Log non-critical errors but continue
          console.log('ℹ️ Non-critical errors (continuing):', results.errors.filter(e => e.type !== 'FieldMismatch'));
        }
        
        // Filter out empty rows and add extracted date
        const data = (results.data as any[])
          .filter(row => row && Object.keys(row).length > 0)
          .map((row: any) => {
            // Ensure each row has a Date field using extracted date from row 2
            if (dateStamp) {
              row.Date = dateStamp;
            }
            // Also ensure Campaign field exists (header row 3 should have this)
            if (!row.Campaign && row.campaign) {
              row.Campaign = row.campaign;
            }
            console.log('🔧 Processed row:', { Campaign: row.Campaign, Date: row.Date, Cost: row.Cost });
            return row;
          });
          
        console.log('✅ Parsed Google Ads data:', data);
        resolve(data);
      },
      error: (error) => {
        console.error('❌ Google Ads parsing error:', error);
        reject(new Error(`Google Ads CSV parsing failed: ${error.message}`));
      }
    });
  }

  private static detectSource(firstRow: any): 'meta' | 'google' | 'shopify' | 'unknown' {
    const headers = Object.keys(firstRow).map(h => h.toLowerCase());

    // Meta detection - look for specific Meta columns
    if (headers.includes('amount spent (inr)') || headers.includes('reporting ends') || (headers.includes('ad set name') && headers.includes('campaign name'))) {
      return 'meta';
    }

    // Google detection - look for specific Google columns
    if (headers.includes('cost') && headers.includes('campaign') && !headers.includes('utm campaign')) {
      return 'google';
    }

    // Shopify detection - look for UTM columns and Day column
    if (headers.includes('utm campaign') || headers.includes('online store visitors') || (headers.includes('day') && headers.includes('utm campaign'))) {
      return 'shopify';
    }

    return 'unknown';
  }

  private static validateSchema(data: any[], source: string): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const schema = this.SCHEMAS[source];
    
    if (!schema) {
      errors.push({
        type: 'invalid_format',
        message: `No validation schema found for source: ${source}`
      });
      return { errors, warnings };
    }

    const headers = Object.keys(data[0]).map(h => h.toLowerCase());
    const requiredLower = schema.required.map(r => r.toLowerCase());

    // Check for missing required columns
    const missingColumns = requiredLower.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      errors.push({
        type: 'missing_columns',
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        details: { missing: missingColumns, found: headers }
      });
    }

    // Check for empty required columns
    schema.required.forEach(requiredCol => {
      const matchingHeader = Object.keys(data[0]).find(h => h.toLowerCase() === requiredCol.toLowerCase());
      if (matchingHeader) {
        const emptyCount = data.filter(row => !row[matchingHeader] || row[matchingHeader].toString().trim() === '').length;
        if (emptyCount > 0) {
          warnings.push({
            type: 'missing_data',
            message: `Column "${requiredCol}" has ${emptyCount} empty values out of ${data.length} rows`,
            details: { column: requiredCol, emptyCount, totalRows: data.length }
          });
        }
      }
    });

    return { errors, warnings };
  }

  private static validateDates(data: any[], source: string): { 
    errors: ValidationError[], 
    warnings: ValidationWarning[], 
    dateRange?: { startDate: string, endDate: string } 
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const schema = this.SCHEMAS[source];
    
    if (!schema || schema.dateColumns.length === 0) {
      return { errors, warnings };
    }

    const dateColumn = schema.dateColumns[0];
    const matchingHeader = Object.keys(data[0]).find(h => h.toLowerCase() === dateColumn.toLowerCase());
    
    if (!matchingHeader) {
      return { errors, warnings };
    }

    const validDates: Date[] = [];
    const invalidDates: { row: number, value: string }[] = [];

    data.forEach((row, index) => {
      const dateValue = row[matchingHeader];
      if (dateValue) {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) {
          invalidDates.push({ row: index + 2, value: dateValue }); // +2 for header and 1-based indexing
        } else {
          validDates.push(date);
        }
      }
    });

    // Report invalid dates
    if (invalidDates.length > 0) {
      if (invalidDates.length > 10) {
        errors.push({
          type: 'invalid_date',
          message: `Found ${invalidDates.length} invalid dates. First few: ${invalidDates.slice(0, 3).map(d => `Row ${d.row}: "${d.value}"`).join(', ')}`,
          details: { invalidCount: invalidDates.length, examples: invalidDates.slice(0, 10) }
        });
      } else {
        errors.push({
          type: 'invalid_date',
          message: `Invalid dates found: ${invalidDates.map(d => `Row ${d.row}: "${d.value}"`).join(', ')}`,
          details: { invalidDates }
        });
      }
    }

    // Calculate date range
    if (validDates.length > 0) {
      const sortedDates = validDates.sort((a, b) => a.getTime() - b.getTime());
      const startDate = sortedDates[0].toISOString().split('T')[0];
      const endDate = sortedDates[sortedDates.length - 1].toISOString().split('T')[0];
      
      return { 
        errors, 
        warnings, 
        dateRange: { startDate, endDate } 
      };
    }

    return { errors, warnings };
  }

  private static validateNumericData(data: any[], source: string): { errors: ValidationError[], warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const schema = this.SCHEMAS[source];
    
    if (!schema) {
      return { errors, warnings };
    }

    schema.numericColumns.forEach(numericCol => {
      const matchingHeader = Object.keys(data[0]).find(h => h.toLowerCase() === numericCol.toLowerCase());
      if (matchingHeader) {
        const invalidNumbers: { row: number, value: string }[] = [];
        const validNumbers: number[] = [];

        data.forEach((row, index) => {
          const value = row[matchingHeader];
          if (value !== null && value !== undefined && value !== '') {
            const numValue = parseFloat(value.toString().replace(/[,$]/g, ''));
            if (isNaN(numValue)) {
              invalidNumbers.push({ row: index + 2, value: value.toString() });
            } else {
              validNumbers.push(numValue);
            }
          }
        });

        // Report invalid numbers
        if (invalidNumbers.length > 0) {
          warnings.push({
            type: 'format_inconsistency',
            message: `Column "${numericCol}" has ${invalidNumbers.length} non-numeric values`,
            details: { 
              column: numericCol, 
              invalidCount: invalidNumbers.length,
              examples: invalidNumbers.slice(0, 5)
            }
          });
        }

        // Check for suspiciously high values (potential data quality issue)
        if (validNumbers.length > 0) {
          const avg = validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length;
          const outliers = validNumbers.filter(n => n > avg * 100); // 100x average
          if (outliers.length > 0) {
            warnings.push({
              type: 'format_inconsistency',
              message: `Column "${numericCol}" has ${outliers.length} potentially outlier values (>100x average)`,
              details: { column: numericCol, outliers: outliers.slice(0, 5), average: avg }
            });
          }
        }
      }
    });

    return { errors, warnings };
  }

  static getExpectedFormat(source: 'meta' | 'google' | 'shopify'): SourceSchema {
    return this.SCHEMAS[source];
  }

  static generateSampleHeaders(source: 'meta' | 'google' | 'shopify'): string[] {
    const schema = this.SCHEMAS[source];
    return [...schema.required, ...schema.optional.slice(0, 3)]; // Show first 3 optional columns as examples
  }
}