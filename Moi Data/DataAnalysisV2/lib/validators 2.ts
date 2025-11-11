import Papa from 'papaparse'
import { Platform } from './supabase'

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
  columns?: string[]
}

export interface ValidationWarning {
  type: string
  message: string
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
  expectedFormats: string[]
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
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
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
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
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
    expectedFormats: ['YYYY-MM-DD', 'DD-MM-YYYY', 'MM/DD/YYYY']
  }
}

export async function validateCSV(platform: Platform, file: File): Promise<ValidationResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      preview: 100,
      complete: (results) => {
        const validation = performValidation(platform, results.data, results.meta.fields || [])
        resolve(validation)
      },
      error: (error) => {
        resolve({
          isValid: false,
          hasErrors: true,
          hasWarnings: false,
          needsCorrection: false,
          errors: [{ type: 'parse_error', message: error.message }],
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

  // Check required columns
  const missingColumns = schema.required.filter(col => 
    !headers.some(header => normalizeColumnName(header) === normalizeColumnName(col))
  )
  
  if (missingColumns.length > 0) {
    errors.push({
      type: 'missing_columns',
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      columns: missingColumns
    })
  }

  // Validate date formats (STRICT - must be YYYY-MM-DD)
  const dateColumn = findColumnByName(headers, schema.dateColumn)
  if (dateColumn) {
    const dateValidation = validateDateFormats(data, dateColumn)
    
    // Check for wrong date formats - make this an ERROR not warning
    const nonStandardFormats = dateValidation.detectedFormats.filter(format => format !== 'YYYY-MM-DD')
    if (nonStandardFormats.length > 0) {
      errors.push({
        type: 'invalid_date_format',
        message: `Date column '${dateColumn}' must use YYYY-MM-DD format. Found: ${nonStandardFormats.join(', ')}. Example correct format: 2025-11-10`,
        columns: [dateColumn]
      })
    }
    
    // Check for invalid/unparseable dates
    if (dateValidation.invalidDates.length > 0) {
      errors.push({
        type: 'invalid_date_values',
        message: `Invalid date values found in '${dateColumn}': ${dateValidation.invalidDates.slice(0, 3).map(d => d.value).join(', ')}`,
        columns: [dateColumn]
      })
    }
    
    // Only add warnings for minor issues if no errors
    if (nonStandardFormats.length === 0 && dateValidation.invalidDates.length === 0 && dateValidation.detectedFormats.length > 1) {
      warnings.push({
        type: 'date_format_inconsistency',
        message: `Multiple date formats detected in ${dateColumn}`,
        details: dateValidation
      })
    }
  }

  // Validate numeric columns
  const numericValidation = validateNumericColumns(platform, data, headers)
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