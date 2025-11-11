import { Platform } from './supabase'

export interface DetectedPlatform {
  platform: Platform
  confidence: number
  matchedColumns: string[]
}

// Platform signatures based on unique column combinations
const PLATFORM_SIGNATURES: Record<Platform, {
  required: string[]
  unique: string[]  // Columns that uniquely identify this platform
}> = {
  meta: {
    required: ['Day', 'Campaign name', 'Ad set name', 'Ad name', 'Amount spent (INR)'],
    unique: ['Campaign name', 'Ad set name', 'Ad name', 'Amount spent (INR)', 'CPM (cost per 1,000 impressions)']
  },
  google: {
    required: ['Day', 'Campaign', 'Cost', 'CTR', 'Avg. CPM'],
    unique: ['Campaign', 'Avg. CPM', 'Currency code']
  },
  shopify: {
    required: ['Day', 'UTM campaign', 'UTM term', 'UTM content'],
    unique: ['UTM campaign', 'UTM term', 'UTM content', 'Online store visitors', 'Sessions that completed checkout']
  }
}

export function detectPlatformFromHeaders(headers: string[]): DetectedPlatform | null {
  const normalizedHeaders = headers.map(h => h.trim())
  let bestMatch: DetectedPlatform | null = null
  
  for (const [platform, signature] of Object.entries(PLATFORM_SIGNATURES)) {
    const matchedColumns = signature.unique.filter(col => 
      normalizedHeaders.some(header => normalizeColumnName(header) === normalizeColumnName(col))
    )
    
    const confidence = matchedColumns.length / signature.unique.length
    
    // Require at least 60% confidence and some required columns
    if (confidence >= 0.6) {
      const requiredMatches = signature.required.filter(col =>
        normalizedHeaders.some(header => normalizeColumnName(header) === normalizeColumnName(col))
      )
      
      if (requiredMatches.length >= 3) { // At least 3 required columns must match
        if (!bestMatch || confidence > bestMatch.confidence) {
          bestMatch = {
            platform: platform as Platform,
            confidence,
            matchedColumns
          }
        }
      }
    }
  }
  
  return bestMatch
}

function normalizeColumnName(name: string): string {
  return name.toLowerCase().trim().replace(/[^\w]/g, '_')
}

export function getPlatformDisplayName(platform: Platform): string {
  const names: Record<Platform, string> = {
    meta: 'Meta Ads',
    google: 'Google Ads', 
    shopify: 'Shopify Analytics'
  }
  return names[platform]
}