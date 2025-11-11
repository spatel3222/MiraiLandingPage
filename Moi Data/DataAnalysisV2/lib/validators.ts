import Papa from 'papaparse'
import { Platform } from './supabase'
import { validateStrictSchema } from './strict-schema-validator'

export interface ValidationResult {
  isValid: boolean
  hasErrors: boolean
  hasWarnings: boolean
  needsCorrection: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  rowCount: number
  columnCount: number
  dateRange: DateRange | null
}

export interface ValidationError {
  type: string
  message: string
  howToFix: string
  examples?: string[]
  columns?: string[]
}

export interface ValidationWarning {
  type: string
  message: string
  howToFix?: string
  examples?: string[]
  column?: string
  samples?: any[]
  details?: any
}

export interface DateRange {
  start: string
  end: string
  totalDays: number
}

export const PLATFORM_SCHEMAS: Record<Platform, {
  required: string[]
  dateColumn: string
  requiredDateFormat: string
  acceptedFormats: string[]
  orderMatters: boolean
  expectedOrder?: string[]
}> = {
  meta: {
    required: [
      'Day',
      'Campaign name',
      'Ad set name', 
      'Ad name',
      'Amount spent (INR)',
      'CTR (link click-through rate)',
      'CPM (cost per 1,000 impressions)'
    ],
    dateColumn: 'Day',
    requiredDateFormat: 'YYYY-MM-DD',
    acceptedFormats: ['YYYY-MM-DD'],
    orderMatters: false // Meta exports can vary
  },
  google: {
    required: [
      'Day',
      'Campaign',
      'Cost',
      'CTR',
      'Avg. CPM'
    ],
    dateColumn: 'Day',
    requiredDateFormat: 'YYYY-MM-DD',
    acceptedFormats: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY/MM/DD'], // Google exports in various formats
    orderMatters: false // Google Ads exports are flexible
  },
  shopify: {
    required: [
      'Day',
      'UTM campaign',
      'UTM term',
      'UTM content',
      'Online store visitors',
      'Sessions that completed checkout'
    ],
    dateColumn: 'Day',
    requiredDateFormat: 'YYYY-MM-DD',
    acceptedFormats: ['YYYY-MM-DD'],
    orderMatters: false // Shopify reports are flexible
  }
}

export async function validateCSV(platform: Platform, file: File): Promise<ValidationResult> {
  return new Promise(async (resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 100,
      complete: async (results) => {
        const csvHeaders = results.meta.fields || []
        
        // STRICT SCHEMA VALIDATION FIRST
        const strictValidation = await validateStrictSchema(platform, csvHeaders)
        
        if (!strictValidation.isValid) {
          resolve({
            isValid: false,
            hasErrors: true,
            hasWarnings: strictValidation.warnings.length > 0,
            needsCorrection: false,
            errors: strictValidation.errors.map(error => ({
              type: 'strict_schema_mismatch',
              message: error,
              howToFix: 'Fix column names to exactly match database schema (case-sensitive)',
              examples: [
                'Check spelling and capitalization of column names',
                'Ensure all required columns are present',
                'Remove or rename extra columns',
                'Download template CSV with correct headers'
              ]
            })),
            warnings: strictValidation.warnings.map(warning => ({
              type: 'extra_column',
              message: warning,
              howToFix: 'Extra columns will be ignored during upload'
            })),
            rowCount: results.data.length,
            columnCount: csvHeaders.length,
            dateRange: null
          })
          return
        }
        
        // If strict validation passes, continue with data validation
        const validation = performValidation(platform, results.data, csvHeaders)
        resolve(validation)
      },
      error: (error) => {
        resolve({
          isValid: false,
          hasErrors: true,
          hasWarnings: false,
          needsCorrection: false,
          errors: [{ 
            type: 'parse_error', 
            message: `CSV parsing failed: ${error.message}`,
            howToFix: 'Fix CSV file format issues',
            examples: [
              'Check for unescaped quotes in text fields',
              'Ensure all rows have same number of columns',
              'Remove special characters that break CSV format',
              'Save as proper CSV format from Excel/Google Sheets',
              'Check file encoding (should be UTF-8)'
            ]
          }],
          warnings: [],
          rowCount: 0,
          columnCount: 0,
          dateRange: null
        })
      }
    })
  })
}

function performValidation(platform: Platform, data: any[], headers: string[]): ValidationResult {
  const schema = PLATFORM_SCHEMAS[platform]
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Clean headers (remove BOM, trim whitespace)
  const cleanHeaders = headers.map(h => h.replace(/^\ufeff/, '').trim())
  
  // Check for case-sensitive column matching issues
  const columnMappingIssues: Array<{required: string, found?: string, issue: string}> = []
  
  for (const requiredCol of schema.required) {
    // Try exact match first
    const exactMatch = cleanHeaders.find(h => h === requiredCol)
    if (exactMatch) continue
    
    // Try case-insensitive match
    const caseInsensitiveMatch = cleanHeaders.find(h => 
      h.toLowerCase() === requiredCol.toLowerCase()
    )
    
    if (caseInsensitiveMatch) {
      columnMappingIssues.push({
        required: requiredCol,
        found: caseInsensitiveMatch,
        issue: 'case_mismatch'
      })
    } else {
      // Try fuzzy match (similar names)
      const fuzzyMatch = cleanHeaders.find(h => 
        normalizeColumnName(h) === normalizeColumnName(requiredCol)
      )
      
      if (fuzzyMatch) {
        columnMappingIssues.push({
          required: requiredCol,
          found: fuzzyMatch,
          issue: 'name_variation'
        })
      } else {
        columnMappingIssues.push({
          required: requiredCol,
          issue: 'missing'
        })
      }
    }
  }

  // Report column issues
  const missingColumns = columnMappingIssues.filter(issue => issue.issue === 'missing')
  const caseMismatchColumns = columnMappingIssues.filter(issue => issue.issue === 'case_mismatch')
  const nameVariationColumns = columnMappingIssues.filter(issue => issue.issue === 'name_variation')
  
  if (missingColumns.length > 0) {
    errors.push({
      type: 'missing_columns',
      message: `Missing required columns: ${missingColumns.map(c => c.required).join(', ')}`,
      howToFix: 'Add the missing columns to your CSV file with the exact names shown above',
      examples: [
        'Open your CSV in Excel/Google Sheets',
        'Add new columns with headers: ' + missingColumns.map(c => `"${c.required}"`).join(', '),
        'Fill with appropriate data or leave empty if no data available'
      ],
      columns: missingColumns.map(c => c.required)
    })
  }

  if (caseMismatchColumns.length > 0) {
    // For Google platform, treat case mismatches as warnings instead of errors
    if (platform === 'google') {
      warnings.push({
        type: 'column_case_mismatch',
        message: `Column case mismatch found: ${caseMismatchColumns.map(c => `"${c.found}" should be "${c.required}"`).join(', ')}`,
        howToFix: 'Column names are close enough but case differs. This is acceptable for Google Ads data.',
        examples: [
          'Current: ' + caseMismatchColumns.map(c => `"${c.found}"`).join(', '),
          'Expected: ' + caseMismatchColumns.map(c => `"${c.required}"`).join(', '),
          'This will be handled automatically during upload.'
        ]
      })
    } else {
      errors.push({
        type: 'column_case_mismatch',
        message: `Column case mismatch found: ${caseMismatchColumns.map(c => `"${c.found}" should be "${c.required}"`).join(', ')}`,
        howToFix: 'Update column headers to match the exact case (uppercase/lowercase) required',
        examples: [
          'Open your CSV file in Excel/Google Sheets',
          ...caseMismatchColumns.map(c => `Rename "${c.found}" to "${c.required}"`),
          'Save the file and re-upload'
        ],
        columns: caseMismatchColumns.map(c => c.required)
      })
    }
  }

  if (nameVariationColumns.length > 0) {
    warnings.push({
      type: 'column_name_variations',
      message: `Column name variations detected: ${nameVariationColumns.map(c => `"${c.found}" might be "${c.required}"`).join(', ')}`,
      howToFix: 'Verify and rename columns to match exact required names',
      examples: [
        'Check if these column mappings are correct:',
        ...nameVariationColumns.map(c => `"${c.found}" → "${c.required}"`),
        'Rename columns if needed and re-upload'
      ],
      details: nameVariationColumns
    })
  }

  // Check for unexpected columns that might indicate wrong platform
  const unexpectedColumns = cleanHeaders.filter(header => 
    !schema.required.some(req => normalizeColumnName(header) === normalizeColumnName(req))
  )
  
  // For Google, allow extra columns like "Currency code" - just warn if there are many
  const unexpectedThreshold = platform === 'google' ? 5 : 3;
  
  if (unexpectedColumns.length > unexpectedThreshold) {
    warnings.push({
      type: 'unexpected_columns',
      message: `Many unexpected columns found (${unexpectedColumns.length}). Verify this is the correct platform.`,
      howToFix: 'Verify you selected the correct platform or remove unnecessary columns',
      examples: [
        'Check if this is the right platform (Meta/Google/Shopify)',
        'Unexpected columns: ' + unexpectedColumns.slice(0, 5).join(', '),
        'Remove columns not needed for this platform',
        'Or select different platform if this CSV is for another service'
      ],
      details: { unexpectedColumns: unexpectedColumns.slice(0, 5) }
    })
  } else if (unexpectedColumns.length > 0 && platform === 'google') {
    warnings.push({
      type: 'extra_columns_google',
      message: `Extra columns found: ${unexpectedColumns.join(', ')}. These will be ignored during upload.`,
      howToFix: 'Extra columns are acceptable for Google Ads exports and will be ignored.',
      examples: [
        'Common extra columns: Currency code, Account, etc.',
        'These will not affect the upload process',
        'Only required columns will be processed'
      ],
      details: { extraColumns: unexpectedColumns }
    })
  }

  // Check for common CSV formatting issues
  if (headers.some(h => h.includes('\ufeff'))) {
    warnings.push({
      type: 'bom_detected',
      message: 'BOM (Byte Order Mark) detected in CSV headers. This may cause parsing issues.',
      howToFix: 'Save CSV file as UTF-8 without BOM',
      examples: [
        'Open file in Notepad++ or VS Code',
        'Go to Encoding → Convert to UTF-8 (without BOM)',
        'Or in Excel: File → Save As → CSV UTF-8',
        'Re-upload the converted file'
      ],
      details: { note: 'Save file as UTF-8 without BOM' }
    })
  }

  // Check for empty headers
  const emptyHeaders = cleanHeaders.filter(h => !h || h.trim() === '')
  if (emptyHeaders.length > 0) {
    errors.push({
      type: 'empty_headers',
      message: `Found ${emptyHeaders.length} empty column headers. All columns must have names.`,
      howToFix: 'Add names to all empty column headers',
      examples: [
        'Open your CSV file',
        'Find columns with empty/blank headers',
        'Add descriptive names like: "Column1", "Data", "Notes", etc.',
        'Or remove empty columns if not needed'
      ],
      columns: [`${emptyHeaders.length} empty headers`]
    })
  }

  // Check for duplicate headers
  const duplicateHeaders = cleanHeaders.filter((header, index) => 
    cleanHeaders.indexOf(header) !== index
  )
  if (duplicateHeaders.length > 0) {
    errors.push({
      type: 'duplicate_headers',
      message: `Duplicate column headers found: ${[...new Set(duplicateHeaders)].join(', ')}`,
      howToFix: 'Rename duplicate column headers to unique names',
      examples: [
        'Find duplicate columns: ' + [...new Set(duplicateHeaders)].join(', '),
        'Rename them to unique names like: "Campaign_1", "Campaign_2"',
        'Or remove duplicate columns if identical data',
        'Save and re-upload'
      ],
      columns: duplicateHeaders
    })
  }

  // Validate date formats (STRICT - must be YYYY-MM-DD)
  const dateColumn = findColumnByName(cleanHeaders, schema.dateColumn)
  if (dateColumn) {
    const dateValidation = validateDateFormats(data, dateColumn)
    
    // Check for wrong date formats - make this an ERROR not warning
    const allowedFormats = schema.acceptedFormats
    const nonStandardFormats = dateValidation.detectedFormats.filter(format => !allowedFormats.includes(format))
    if (nonStandardFormats.length > 0) {
      errors.push({
        type: 'invalid_date_format',
        message: `Date column '${dateColumn}' must use ${schema.requiredDateFormat} format. Found: ${nonStandardFormats.join(', ')}`,
        howToFix: `Convert all dates in '${dateColumn}' column to YYYY-MM-DD format`,
        examples: [
          'Open CSV in Excel/Google Sheets',
          'Select the entire Date column',
          'Format cells as Custom: YYYY-MM-DD (e.g., 2025-11-10)',
          'Or use find/replace: 10/11/2025 → 2025-11-10',
          'Save as CSV and re-upload'
        ],
        columns: [dateColumn]
      })
    }
    
    // Check for invalid/unparseable dates
    if (dateValidation.invalidDates.length > 0) {
      errors.push({
        type: 'invalid_date_values',
        message: `Invalid date values found in '${dateColumn}': ${dateValidation.invalidDates.slice(0, 3).map(d => d.value).join(', ')}`,
        howToFix: 'Fix or remove invalid date entries',
        examples: [
          'Check these invalid dates: ' + dateValidation.invalidDates.slice(0, 3).map(d => `"${d.value}"`).join(', '),
          'Replace with valid dates in YYYY-MM-DD format',
          'Or remove rows with invalid dates if not needed',
          'Common valid formats: 2025-11-10, 2025-01-01'
        ],
        columns: [dateColumn]
      })
    }
    
    // Only add warnings for minor issues if no errors
    if (nonStandardFormats.length === 0 && dateValidation.invalidDates.length === 0 && dateValidation.detectedFormats.length > 1) {
      warnings.push({
        type: 'date_format_inconsistency',
        message: `Multiple date formats detected in ${dateColumn}`,
        howToFix: 'Standardize all dates to YYYY-MM-DD format',
        examples: [
          'Found formats: ' + dateValidation.detectedFormats.join(', '),
          'Convert all dates to YYYY-MM-DD format',
          'Use Excel: Format Cells → Custom → YYYY-MM-DD',
          'Or use find/replace to convert format patterns'
        ],
        details: dateValidation
      })
    }
  }

  // Validate numeric columns
  const numericValidation = validateNumericColumns(platform, data, cleanHeaders)
  warnings.push(...numericValidation)

  return {
    isValid: errors.length === 0,
    hasErrors: errors.length > 0,
    hasWarnings: warnings.length > 0,
    needsCorrection: warnings.length > 0,
    errors,
    warnings,
    rowCount: data.length,
    columnCount: headers.length,
    dateRange: detectDateRange(data, dateColumn)
  }
}

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w]/g, '_')
}

function findColumnByName(headers: string[], targetName: string): string | undefined {
  return headers.find(header => 
    normalizeColumnName(header) === normalizeColumnName(targetName)
  )
}

function validateDateFormats(data: any[], dateColumn: string): { hasIssues: boolean; detectedFormats: string[]; invalidDates: any[]; recommendedFormat: string } {
  const formats = new Set<string>()
  const invalidDates: any[] = []
  
  data.slice(0, 50).forEach((row, index) => {
    const dateValue = row[dateColumn]
    if (dateValue) {
      const detectedFormat = detectDateFormat(dateValue)
      if (detectedFormat) {
        formats.add(detectedFormat)
      } else {
        invalidDates.push({ row: index, value: dateValue })
      }
    }
  })

  return {
    hasIssues: formats.size > 1 || invalidDates.length > 0,
    detectedFormats: Array.from(formats),
    invalidDates,
    recommendedFormat: 'YYYY-MM-DD'
  }
}

function detectDateFormat(dateString: string): string | null {
  const trimmed = dateString.trim()
  
  const patterns = [
    { regex: /^\d{4}-\d{2}-\d{2}$/, format: 'YYYY-MM-DD' },
    { regex: /^\d{2}-\d{2}-\d{4}$/, format: 'DD-MM-YYYY' },
    { regex: /^\d{1,2}\/\d{1,2}\/\d{4}$/, format: 'DD/MM/YYYY' }, // More specific for your Google data
    { regex: /^\d{2}\/\d{2}\/\d{4}$/, format: 'DD/MM/YYYY' },
    { regex: /^\d{4}\/\d{2}\/\d{2}$/, format: 'YYYY/MM/DD' },
    { regex: /^\d{2}\.\d{2}\.\d{4}$/, format: 'DD.MM.YYYY' }
  ]

  for (const pattern of patterns) {
    if (pattern.regex.test(trimmed)) {
      return pattern.format
    }
  }
  return null
}

function validateNumericColumns(platform: Platform, data: any[], headers: string[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const numericColumns = getNumericColumns(platform, headers)
  
  numericColumns.forEach(column => {
    const nonNumericValues = data.slice(0, 50)
      .map((row, index) => ({ index, value: row[column] }))
      .filter(item => item.value && isNaN(parseFloat(item.value.toString().replace(/[,%]/g, ''))))
    
    if (nonNumericValues.length > 0) {
      warnings.push({
        type: 'non_numeric_values',
        message: `Non-numeric values detected in ${column}`,
        howToFix: `Clean numeric data in '${column}' column`,
        examples: [
          'Remove currency symbols: $1,234.56 → 1234.56',
          'Remove percentage signs: 24.78% → 24.78',
          'Remove commas: 1,234 → 1234',
          'Replace text with numbers or leave empty',
          'Examples found: ' + nonNumericValues.slice(0, 3).map(v => `"${v.value}"`).join(', ')
        ],
        column,
        samples: nonNumericValues.slice(0, 5)
      })
    }
  })

  return warnings
}

function getNumericColumns(platform: Platform, headers: string[]): string[] {
  const numericPatterns: Record<Platform, string[]> = {
    meta: ['amount', 'spent', 'cost', 'ctr', 'cpm'],
    google: ['cost', 'ctr', 'cpm'],
    shopify: ['visitors', 'sessions', 'checkout', 'duration', 'pageviews']
  }

  return headers.filter(header => {
    const normalized = normalizeColumnName(header)
    return numericPatterns[platform].some(pattern => normalized.includes(pattern))
  })
}

function detectDateRange(data: any[], dateColumn: string | undefined): DateRange | null {
  if (!dateColumn || data.length === 0) return null
  
  const dates = data
    .map(row => row[dateColumn])
    .filter(Boolean)
    .map(dateStr => new Date(dateStr))
    .filter(date => !isNaN(date.getTime()))
    .sort()

  if (dates.length === 0) return null

  return {
    start: dates[0].toISOString().split('T')[0],
    end: dates[dates.length - 1].toISOString().split('T')[0],
    totalDays: Math.ceil((dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)) + 1
  }
}