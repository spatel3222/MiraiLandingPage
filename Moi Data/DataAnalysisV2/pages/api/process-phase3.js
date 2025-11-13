import { JuliusV7Engine } from '../../lib/JuliusV7Engine'
import { supabase, TABLE_NAMES } from '../../lib/supabase'
import fs from 'fs'
import path from 'path'

/**
 * Phase 3 Analytics Processing API
 * Takes retrieved data from Phase 2 and processes it through Julius V7 methodology
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      data: rawData, 
      dateRange, 
      platforms = ['meta', 'google', 'shopify'],
      options = {} 
    } = req.body

    // Validate required inputs
    if (!rawData) {
      return res.status(400).json({ error: 'Data is required for processing' })
    }

    if (!dateRange || !dateRange.startDate || !dateRange.endDate) {
      return res.status(400).json({ error: 'Date range with startDate and endDate is required' })
    }

    console.log(`🚀 Starting Phase 3 processing for ${platforms.join(', ')} platforms`)
    console.log(`📅 Date range: ${dateRange.startDate} to ${dateRange.endDate}`)

    // Check if we need to fetch data from database
    let actualData = rawData
    const needsDatabaseFetch = options.fetchFromDatabase || 
      Object.values(rawData).every(platformData => !platformData || platformData.length === 0)
    
    console.log('🔧 Database fetch check:', {
      fetchFromDatabaseOption: options.fetchFromDatabase,
      rawDataEmpty: Object.values(rawData).every(platformData => !platformData || platformData.length === 0),
      needsDatabaseFetch,
      rawDataStructure: Object.keys(rawData).map(key => `${key}: ${Array.isArray(rawData[key]) ? rawData[key].length + ' rows' : typeof rawData[key]}`)
    })
    
    if (needsDatabaseFetch) {
      console.log('🔗 Fetching data directly from database for large dataset processing...')
      actualData = await fetchDataFromDatabase(dateRange, platforms)
      console.log('🔗 Database fetch results:', Object.keys(actualData).map(key => `${key}: ${Array.isArray(actualData[key]) ? actualData[key].length + ' rows' : typeof actualData[key]}`))
    }

    // Log data availability
    platforms.forEach(platform => {
      const platformData = actualData[platform]
      if (platformData && Array.isArray(platformData)) {
        console.log(`📊 ${platform}: ${platformData.length} rows available`)
        console.log(`🔍 ${platform} first row keys:`, platformData.length > 0 ? Object.keys(platformData[0]) : 'No rows')
        console.log(`🔍 ${platform} first row sample:`, platformData.length > 0 ? JSON.stringify(platformData[0]).substring(0, 150) + '...' : 'No data')
      } else {
        console.log(`⚠️ ${platform}: No data available - type:`, typeof platformData, 'isArray:', Array.isArray(platformData))
      }
    })
    
    console.log('🔍 rawData structure being passed to Julius V7:')
    console.log('🔍 rawData keys:', Object.keys(rawData))
    console.log('🔍 rawData overview:', {
      meta: rawData.meta ? (Array.isArray(rawData.meta) ? `${rawData.meta.length} rows` : typeof rawData.meta) : 'missing',
      google: rawData.google ? (Array.isArray(rawData.google) ? `${rawData.google.length} rows` : typeof rawData.google) : 'missing',
      shopify: rawData.shopify ? (Array.isArray(rawData.shopify) ? `${rawData.shopify.length} rows` : typeof rawData.shopify) : 'missing'
    })

    // Initialize Julius V7 Engine
    const engine = new JuliusV7Engine()

    // Process analytics through Julius V7 methodology
    const startTime = Date.now()
    const result = await engine.processAnalytics(actualData, dateRange, platforms)
    const processingTime = Date.now() - startTime

    console.log(`✅ Phase 3 processing completed in ${processingTime}ms`)

    // Save CSV files to outputs folder
    const outputDir = path.join(process.cwd(), 'outputs')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    const sessionId = `${timestamp}_${Date.now()}`
    
    // Ensure outputs directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    const savedFiles = {}
    
    // Save each CSV file
    const outputs = {
      topLevel: {
        data: result.outputs.topLevel,
        filename: `daily_summary_${dateRange.startDate}_to_${dateRange.endDate}_${sessionId}.csv`
      },
      adSetLevel: {
        data: result.outputs.adSetLevel,
        filename: `adset_performance_${dateRange.startDate}_to_${dateRange.endDate}_${sessionId}.csv`
      },
      adLevel: {
        data: result.outputs.adLevel,
        filename: `ad_performance_${dateRange.startDate}_to_${dateRange.endDate}_${sessionId}.csv`
      }
    }
    
    for (const [outputType, output] of Object.entries(outputs)) {
      const csvContent = convertToCSV(output.data, output.filename)
      const filePath = path.join(outputDir, output.filename)
      
      try {
        fs.writeFileSync(filePath, csvContent.csv)
        savedFiles[outputType] = {
          filename: output.filename,
          filePath: filePath,
          relativePath: `/outputs/${output.filename}`,
          size: csvContent.size,
          rowCount: output.data.length,
          columns: output.data.length > 0 ? Object.keys(output.data[0]) : [],
          savedAt: new Date().toISOString()
        }
        console.log(`💾 Saved ${outputType} CSV: ${output.filename} (${csvContent.size} bytes, ${output.data.length} rows)`)
      } catch (error) {
        console.error(`❌ Failed to save ${outputType} CSV:`, error)
        savedFiles[outputType] = {
          filename: output.filename,
          error: error.message,
          rowCount: output.data.length,
          columns: output.data.length > 0 ? Object.keys(output.data[0]) : []
        }
      }
    }

    // Prepare response with CSV data and metadata
    const response = {
      success: true,
      processingTime,
      summary: result.summary,
      outputs: savedFiles,
      rawData: {
        topLevel: { data: result.outputs.topLevel },
        adSetLevel: { data: result.outputs.adSetLevel },
        adLevel: { data: result.outputs.adLevel }
      },
      metadata: {
        dateRange,
        platforms,
        processingOptions: options,
        timestamp: new Date().toISOString(),
        juliusVersion: 'V7',
        methodology: {
          attribution: {
            meta: 'Day + Campaign + Ad Set + Ad',
            google: 'Day + Campaign',
            shopify: 'Day'
          },
          businessMetrics: [
            'Good Leads (Sessions ≥60s AND Pageviews ≥5)',
            'Cost Per Lead (CPL)',
            'Cost Per User (CPU)', 
            'Cost Per Good Lead (CPGL)',
            'Return on Ad Spend (ROAS)'
          ],
          scoring: {
            efficiency: '40% - Cost efficiency metrics',
            quality: '40% - Engagement and conversion quality',
            volume: '20% - Scale and reach metrics'
          },
          recommendations: {
            'Scale': '≥0.90 overall score',
            'Test-to-Scale': '0.80-0.90 overall score',
            'Optimize': '0.70-0.80 overall score',
            'Pause/Fix': '<0.70 overall score'
          }
        }
      }
    }

    // Log summary statistics
    console.log('📈 Processing Summary:')
    console.log(`  • Total Rows Processed: ${result.summary.totalRows}`)
    console.log(`  • Total Spend: $${result.summary.totalSpend}`)
    console.log(`  • Total Revenue: $${result.summary.totalRevenue}`)
    console.log(`  • ROAS: ${result.summary.roas}x`)
    console.log(`  • Active Platforms: ${result.summary.platforms.join(', ')}`)
    console.log('📋 Output Files:')
    console.log(`  • Daily Summary: ${response.outputs.topLevel.rowCount} rows`)
    console.log(`  • Ad Set Performance: ${response.outputs.adSetLevel.rowCount} rows`)
    console.log(`  • Ad Performance: ${response.outputs.adLevel.rowCount} rows`)

    res.status(200).json(response)

  } catch (error) {
    console.error('❌ Phase 3 Processing Error:', error)
    
    // Determine error type for better user feedback
    let errorMessage = 'Analytics processing failed'
    let statusCode = 500

    if (error.message.includes('Invalid date') || error.message.includes('required')) {
      statusCode = 400
      errorMessage = 'Invalid input parameters'
    } else if (error.message.includes('timeout') || error.message.includes('memory')) {
      statusCode = 503
      errorMessage = 'Processing timeout - dataset too large'
    }

    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString(),
      phase: 'julius_v7_processing'
    })
  }
}

/**
 * Helper function to convert array of objects to CSV string
 */
export function convertToCSV(data, filename = 'data.csv') {
  if (!data || data.length === 0) {
    return { csv: '', filename, size: 0 }
  }

  const headers = Object.keys(data[0])
  
  // Properly escape headers that contain commas, quotes, or newlines
  const escapedHeaders = headers.map(header => {
    if (header.includes(',') || header.includes('"') || header.includes('\n')) {
      return `"${header.replace(/"/g, '""')}"`
    }
    return header
  })
  
  const csvRows = [escapedHeaders.join(',')]

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      // Handle null/undefined values
      if (value === null || value === undefined) return ''
      
      // Format numbers appropriately
      if (typeof value === 'number') {
        // Round to 4 decimal places for percentages and rates
        if (header.includes('Rate') || header.includes('Score') || header.includes('CTR') || header.includes('ROAS')) {
          return (Math.round(value * 10000) / 10000).toString()
        }
        // Round to 2 decimal places for currency
        if (header.includes('Spend') || header.includes('Cost') || header.includes('Revenue')) {
          return (Math.round(value * 100) / 100).toString()
        }
        // Integer for counts
        if (header.includes('Count') || header.includes('Impressions') || header.includes('Clicks') || header.includes('Users') || header.includes('Sessions') || header.includes('Orders')) {
          return Math.round(value).toString()
        }
        return value.toString()
      }
      
      // Escape commas and quotes in string values
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(','))
  }

  const csvContent = csvRows.join('\n')
  
  return {
    csv: csvContent,
    filename,
    size: csvContent.length
  }
}

/**
 * Helper function to fetch data directly from database for large dataset processing
 */
async function fetchDataFromDatabase(dateRange, platforms) {
  const data = {}
  
  const platformConfigs = [
    { name: 'meta', table: 'meta_import_data', dateColumn: 'Day' },
    { name: 'google', table: 'google_import_data', dateColumn: 'Day' },
    { name: 'shopify', table: 'shopify_import_data', dateColumn: 'Day' }
  ]

  for (const platform of platformConfigs) {
    if (!platforms.includes(platform.name)) continue

    try {
      console.log(`🔗 Fetching ${platform.name} data from database for date range ${dateRange.startDate} to ${dateRange.endDate}`)

      let platformData = []
      let hasMoreData = true
      let offset = 0
      const BATCH_SIZE = 1000

      while (hasMoreData) {
        const { data: batchData, error } = await supabase
          .from(platform.table)
          .select('*')
          .gte(platform.dateColumn, dateRange.startDate)
          .lte(platform.dateColumn, dateRange.endDate)
          .order(platform.dateColumn, { ascending: true })
          .range(offset, offset + BATCH_SIZE - 1)

        if (error) {
          console.error(`❌ Error fetching ${platform.name} data at offset ${offset}:`, error)
          throw error
        }

        if (batchData && batchData.length > 0) {
          platformData.push(...batchData)
          offset += BATCH_SIZE
          hasMoreData = batchData.length === BATCH_SIZE
          console.log(`📊 ${platform.name}: Fetched batch of ${batchData.length} rows (total: ${platformData.length})`)
        } else {
          hasMoreData = false
        }
      }

      data[platform.name] = platformData
      console.log(`✅ ${platform.name}: Successfully fetched ${platformData.length} rows`)

    } catch (platformError) {
      console.error(`❌ Failed to fetch ${platform.name} data:`, platformError)
      data[platform.name] = []
    }
  }

  const totalRows = Object.values(data).reduce((sum, platformData) => sum + (Array.isArray(platformData) ? platformData.length : 0), 0)
  console.log(`🔗 Database fetch complete: ${totalRows} total rows across ${Object.keys(data).length} platforms`)
  
  return data
}