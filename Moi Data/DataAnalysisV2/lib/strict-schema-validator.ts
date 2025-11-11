import { Platform } from './supabase'

interface SchemaValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  exactMatches: string[]
  missingColumns: string[]
  extraColumns: string[]
  caseMismatches: { csv: string; expected: string }[]
}

// Known schemas from Supabase (discovered via API)
const SUPABASE_SCHEMAS: Record<Platform, string[]> = {
  google: [
    'id', 'Day', 'Campaign', 'Campaign status', 'Currency code', 
    'Cost', 'Avg. CPM', 'CTR', 'ref_parameter', 'processed_at'
  ],
  meta: [
    'id', 'Campaign name', 'Ad set name', 'Ad name', 'Day',
    'Amount spent (INR)', 'CPM (cost per 1,000 impressions)', 
    'CTR (link click-through rate)', 'Ad Set Delivery',
    'Reporting starts', 'Reporting ends', 'ref_parameter', 'processed_at'
  ],
  shopify: [
    'id', 'Day', 'UTM campaign', 'UTM term', 'UTM content',
    'Landing page URL', 'Online store visitors', 'Sessions that completed checkout',
    'Sessions that reached checkout', 'Sessions with cart additions',
    'Average session duration', 'Pageviews', 'ref_parameter', 'processed_at'
  ]
}

// Required columns that user must provide (excluding auto-generated ones)
const REQUIRED_USER_COLUMNS: Record<Platform, string[]> = {
  google: ['Day', 'Campaign', 'Currency code', 'Cost', 'Avg. CPM', 'CTR'],
  meta: [
    'Campaign name', 'Ad set name', 'Ad name', 'Day',
    'Amount spent (INR)', 'CPM (cost per 1,000 impressions)', 
    'CTR (link click-through rate)'
  ],
  shopify: [
    'Day', 'UTM campaign', 'UTM term', 'UTM content',
    'Landing page URL', 'Online store visitors', 'Sessions that completed checkout',
    'Sessions that reached checkout', 'Sessions with cart additions',
    'Average session duration', 'Pageviews'
  ]
}

export async function validateStrictSchema(
  platform: Platform, 
  csvHeaders: string[]
): Promise<SchemaValidationResult> {
  const requiredColumns = REQUIRED_USER_COLUMNS[platform]
  const allDbColumns = SUPABASE_SCHEMAS[platform]
  
  const errors: string[] = []
  const warnings: string[] = []
  const exactMatches: string[] = []
  const missingColumns: string[] = []
  const extraColumns: string[] = []
  const caseMismatches: { csv: string; expected: string }[] = []
  
  // Check each required column
  for (const requiredCol of requiredColumns) {
    const exactMatch = csvHeaders.find(header => header === requiredCol)
    
    if (exactMatch) {
      exactMatches.push(exactMatch)
    } else {
      // Check for case-insensitive match
      const caseInsensitiveMatch = csvHeaders.find(
        header => header.toLowerCase() === requiredCol.toLowerCase()
      )
      
      if (caseInsensitiveMatch) {
        caseMismatches.push({
          csv: caseInsensitiveMatch,
          expected: requiredCol
        })
        errors.push(
          `Column case mismatch: Found "${caseInsensitiveMatch}" but expected "${requiredCol}" (case-sensitive)`
        )
      } else {
        missingColumns.push(requiredCol)
        errors.push(`Missing required column: "${requiredCol}"`)
      }
    }
  }
  
  // Check for extra columns
  for (const csvHeader of csvHeaders) {
    if (!allDbColumns.includes(csvHeader)) {
      extraColumns.push(csvHeader)
      warnings.push(`Extra column "${csvHeader}" will be ignored during upload`)
    }
  }
  
  // Summary validation
  const isValid = errors.length === 0
  
  if (!isValid) {
    errors.unshift(
      `❌ STRICT SCHEMA VALIDATION FAILED for ${platform.toUpperCase()} platform`
    )
    errors.push(
      `📋 Expected columns (case-sensitive): ${requiredColumns.join(', ')}`
    )
    errors.push(
      `📄 Your CSV headers: ${csvHeaders.join(', ')}`
    )
  }
  
  return {
    isValid,
    errors,
    warnings,
    exactMatches,
    missingColumns,
    extraColumns,
    caseMismatches
  }
}

export async function getSupabaseSchema(platform: Platform): Promise<string[]> {
  try {
    const response = await fetch(`/api/get-table-schema?table=${platform}_import_data`)
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    return data.columns || SUPABASE_SCHEMAS[platform]
  } catch (error) {
    console.warn(`Failed to fetch live schema for ${platform}, using cached:`, error)
    return SUPABASE_SCHEMAS[platform]
  }
}