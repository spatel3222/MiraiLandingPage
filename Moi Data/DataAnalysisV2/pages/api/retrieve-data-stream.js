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

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    })

    const sendProgress = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      sendProgress({ 
        type: 'error', 
        error: 'Invalid date range' 
      })
      return res.end()
    }

    sendProgress({ 
      type: 'start', 
      message: 'Starting data retrieval...', 
      dateRange: { startDate, endDate, reportType } 
    })

    const platforms = [
      { name: 'meta', table: 'meta_import_data', dateColumn: 'Day' },
      { name: 'google', table: 'google_import_data', dateColumn: 'Day' },
      { name: 'shopify', table: 'shopify_import_data', dateColumn: 'Day' }
    ]

    const results = []
    const data = {}
    const localStorage = {}

    // First, get total row counts for progress calculation
    sendProgress({ 
      type: 'progress', 
      message: 'Calculating total rows...',
      phase: 'estimation'
    })

    const totalCounts = {}
    for (const platform of platforms) {
      try {
        const { count, error } = await supabase
          .from(platform.table)
          .select('*', { count: 'exact', head: true })
          .gte(platform.dateColumn, startDate)
          .lte(platform.dateColumn, endDate)

        if (error) throw error
        totalCounts[platform.name] = count || 0
        
        sendProgress({
          type: 'estimation',
          platform: platform.name,
          totalRows: count || 0
        })
      } catch (error) {
        totalCounts[platform.name] = 0
        sendProgress({
          type: 'estimation_error',
          platform: platform.name,
          error: error.message
        })
      }
    }

    const grandTotal = Object.values(totalCounts).reduce((sum, count) => sum + count, 0)
    
    sendProgress({
      type: 'estimation_complete',
      totalCounts,
      grandTotal,
      message: `Total ${grandTotal.toLocaleString()} rows to process`
    })

    // Process each platform with progress updates
    for (const platform of platforms) {
      try {
        sendProgress({
          type: 'platform_start',
          platform: platform.name,
          message: `Starting ${platform.name} data retrieval...`,
          totalRows: totalCounts[platform.name]
        })

        let platformData = []
        let hasMoreData = true
        let offset = 0
        const BATCH_SIZE = 500 // Smaller batches for more frequent updates
        const totalRows = totalCounts[platform.name]
        const startTime = Date.now()

        while (hasMoreData) {
          const { data: batchData, error } = await supabase
            .from(platform.table)
            .select('*')
            .gte(platform.dateColumn, startDate)
            .lte(platform.dateColumn, endDate)
            .order(platform.dateColumn, { ascending: true })
            .range(offset, offset + BATCH_SIZE - 1)

          if (error) {
            sendProgress({
              type: 'platform_error',
              platform: platform.name,
              error: error.message,
              offset
            })
            throw error
          }

          if (batchData && batchData.length > 0) {
            platformData.push(...batchData)
            offset += BATCH_SIZE
            hasMoreData = batchData.length === BATCH_SIZE

            // Calculate progress metrics
            const processedRows = Math.min(offset, totalRows)
            const progress = totalRows > 0 ? (processedRows / totalRows) * 100 : 100
            const elapsed = Date.now() - startTime
            const speed = processedRows / (elapsed / 1000) // rows per second
            const remaining = speed > 0 && totalRows > processedRows 
              ? Math.round((totalRows - processedRows) / speed) 
              : 0

            sendProgress({
              type: 'platform_progress',
              platform: platform.name,
              processedRows,
              totalRows,
              progress: Math.round(progress),
              speed: Math.round(speed),
              remainingSeconds: remaining,
              batchSize: batchData.length
            })

            // Small delay to prevent overwhelming the client
            await new Promise(resolve => setTimeout(resolve, 50))
          } else {
            hasMoreData = false
          }
        }

        const rowCount = platformData.length
        
        // Calculate date range from actual data
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

        // Generate CSV content for size calculation
        const csvContent = convertToCSV(platformData)
        const filename = `${platform.name}_${reportType === 'custom' 
          ? `${startDate}_to_${endDate}` 
          : `${reportType}_${startDate}_to_${endDate}`}.csv`

        if (platformData.length > 0) {
          localStorage[platform.name] = {
            filename,
            size: csvContent.length
          }
        }

        const result = {
          platform: platform.name,
          success: true,
          rowCount,
          dateRange: dateRangeActual,
          sampleData: platformData.length > 0 ? [platformData[0]] : []
        }

        results.push(result)
        data[platform.name] = platformData

        sendProgress({
          type: 'platform_complete',
          platform: platform.name,
          result,
          message: `${platform.name}: ${rowCount.toLocaleString()} rows retrieved`
        })

      } catch (platformError) {
        const errorResult = {
          platform: platform.name,
          success: false,
          rowCount: 0,
          dateRange: { min: null, max: null },
          error: platformError.message
        }
        
        results.push(errorResult)
        data[platform.name] = null

        sendProgress({
          type: 'platform_error',
          platform: platform.name,
          result: errorResult,
          error: platformError.message
        })
      }
    }

    // Send final results
    const totalRows = results.reduce((sum, result) => sum + result.rowCount, 0)
    const successCount = results.filter(r => r.success).length

    sendProgress({
      type: 'complete',
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
      },
      message: `Data retrieval complete: ${successCount}/${results.length} platforms successful, ${totalRows.toLocaleString()} total rows`
    })

    res.end()

  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Data retrieval failed',
      details: error.message
    })}\n\n`)
    res.end()
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
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
      if (value === null || value === undefined) return ''
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