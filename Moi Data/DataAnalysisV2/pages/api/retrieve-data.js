import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { startDate, endDate, reportType } = req.body

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' })
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' })
    }

    if (start > end) {
      return res.status(400).json({ error: 'Start date must be before end date' })
    }

    console.log(`Retrieving data from ${startDate} to ${endDate} for ${reportType} report`)

    const results = []
    const data = {}
    const localStorage = {}

    // Platform configurations
    const platforms = [
      { name: 'meta', table: 'meta_import_data', dateColumn: 'Day' },
      { name: 'google', table: 'google_import_data', dateColumn: 'Day' },
      { name: 'shopify', table: 'shopify_import_data', dateColumn: 'Day' }
    ]

    for (const platform of platforms) {
      try {
        console.log(`Querying ${platform.table} for date range ${startDate} to ${endDate}`)

        // Query Supabase for the platform data
        const { data: platformData, error } = await supabase
          .from(platform.table)
          .select('*')
          .gte(platform.dateColumn, startDate)
          .lte(platform.dateColumn, endDate)
          .order(platform.dateColumn, { ascending: true })

        if (error) {
          console.error(`Error querying ${platform.table}:`, error)
          results.push({
            platform: platform.name,
            success: false,
            rowCount: 0,
            dateRange: { min: null, max: null },
            error: error.message
          })
          data[platform.name] = null
          continue
        }

        const rowCount = platformData ? platformData.length : 0
        
        // Get date range from actual data
        let dateRangeActual = { min: null, max: null }
        if (rowCount > 0) {
          const dates = platformData.map(row => row[platform.dateColumn]).filter(Boolean)
          if (dates.length > 0) {
            const sortedDates = dates.sort()
            dateRangeActual = {
              min: sortedDates[0],
              max: sortedDates[sortedDates.length - 1]
            }
          }
        }

        // Generate filename for reference (even though we're not saving files in production)
        const reportSuffix = reportType === 'custom' 
          ? `${startDate}_to_${endDate}` 
          : `${reportType}_${startDate}_to_${endDate}`
        const filename = `${platform.name}_${reportSuffix}.csv`

        // Simulate local storage info for UI
        if (platformData && platformData.length > 0) {
          const csvContent = convertToCSV(platformData)
          localStorage[platform.name] = {
            filename: filename,
            size: csvContent.length // Use string length as size approximation
          }
        }

        results.push({
          platform: platform.name,
          success: true,
          rowCount: rowCount,
          dateRange: dateRangeActual,
          sampleData: platformData && platformData.length > 0 ? [platformData[0]] : []
        })

        data[platform.name] = platformData

        console.log(`${platform.name}: ${rowCount} rows retrieved`)

      } catch (platformError) {
        console.error(`Error processing ${platform.name}:`, platformError)
        results.push({
          platform: platform.name,
          success: false,
          rowCount: 0,
          dateRange: { min: null, max: null },
          error: platformError.message
        })
        data[platform.name] = null
      }
    }

    // Summary
    const totalRows = results.reduce((sum, result) => sum + result.rowCount, 0)
    const successCount = results.filter(r => r.success).length

    console.log(`Data retrieval complete: ${successCount}/${results.length} platforms successful, ${totalRows} total rows`)

    res.status(200).json({
      success: successCount === results.length,
      results,
      data,
      localStorage,
      summary: {
        totalRows,
        successfulPlatforms: successCount,
        totalPlatforms: results.length,
        dateRange: { startDate, endDate },
        reportType
      }
    })

  } catch (error) {
    console.error('Data retrieval error:', error)
    res.status(500).json({ 
      error: 'Data retrieval failed',
      details: error.message 
    })
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) return ''

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
      // Escape commas and quotes in values
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}