import { JuliusV7Engine } from '../../lib/JuliusV7Engine'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { rawData, startDate, endDate, reportType } = req.body

    if (!rawData) {
      return res.status(400).json({ error: 'Raw data is required' })
    }

    // Setup SSE headers for streaming processing
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

    sendProgress({
      type: 'start',
      message: 'Starting Julius V7 streaming analytics...',
      timestamp: new Date().toISOString()
    })

    // Process each platform in batches
    const BATCH_SIZE = 500 // Process 500 rows at a time
    const platforms = ['meta', 'google', 'shopify']
    const results = {}
    
    for (const platform of platforms) {
      const platformData = rawData[platform]
      if (!platformData || platformData.length === 0) {
        sendProgress({
          type: 'platform_skip',
          platform,
          message: `${platform}: No data to process`
        })
        continue
      }

      sendProgress({
        type: 'platform_start',
        platform,
        message: `${platform}: Starting processing of ${platformData.length} rows`,
        totalRows: platformData.length
      })

      // Process data in batches
      const batches = []
      for (let i = 0; i < platformData.length; i += BATCH_SIZE) {
        const batch = platformData.slice(i, Math.min(i + BATCH_SIZE, platformData.length))
        batches.push(batch)
      }

      sendProgress({
        type: 'platform_batches',
        platform,
        message: `${platform}: Split into ${batches.length} batches of ${BATCH_SIZE} rows`,
        totalBatches: batches.length
      })

      const platformResults = []
      let processedRows = 0

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        
        sendProgress({
          type: 'batch_start',
          platform,
          batchIndex: batchIndex + 1,
          totalBatches: batches.length,
          batchSize: batch.length,
          message: `${platform}: Processing batch ${batchIndex + 1}/${batches.length} (${batch.length} rows)`
        })

        try {
          // Create Julius V7 engine for this batch
          const juliusEngine = new JuliusV7Engine()
          
          // Create batch data structure
          const batchData = {
            [platform]: batch,
            // Add empty arrays for other platforms to avoid errors
            ...platforms.filter(p => p !== platform).reduce((acc, p) => {
              acc[p] = []
              return acc
            }, {})
          }

          // Process the batch
          const batchResult = await juliusEngine.processAnalytics(batchData, startDate, endDate, reportType)
          
          // Merge results
          platformResults.push(batchResult)
          processedRows += batch.length

          sendProgress({
            type: 'batch_complete',
            platform,
            batchIndex: batchIndex + 1,
            processedRows,
            totalRows: platformData.length,
            progress: Math.round((processedRows / platformData.length) * 100),
            message: `${platform}: Completed batch ${batchIndex + 1}/${batches.length} - ${processedRows}/${platformData.length} rows processed`
          })

          // Small delay to prevent overwhelming
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (batchError) {
          sendProgress({
            type: 'batch_error',
            platform,
            batchIndex: batchIndex + 1,
            error: batchError.message,
            message: `${platform}: Error in batch ${batchIndex + 1}: ${batchError.message}`
          })
        }
      }

      // Merge all batch results for this platform
      results[platform] = {
        totalRows: platformData.length,
        processedRows,
        batches: platformResults.length,
        data: mergeBatchResults(platformResults)
      }

      sendProgress({
        type: 'platform_complete',
        platform,
        result: {
          totalRows: platformData.length,
          processedRows,
          batches: platformResults.length
        },
        message: `${platform}: Complete - ${processedRows} rows processed in ${platformResults.length} batches`
      })
    }

    // Send final results
    sendProgress({
      type: 'complete',
      results,
      message: 'Julius V7 streaming processing complete',
      timestamp: new Date().toISOString()
    })

    res.end()

  } catch (error) {
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Streaming processing failed',
      details: error.message
    })}\n\n`)
    res.end()
  }
}

function mergeBatchResults(batchResults) {
  if (batchResults.length === 0) return null
  if (batchResults.length === 1) return batchResults[0]

  // Merge multiple batch results
  const merged = {
    topLevel: [],
    adSetLevel: [],
    adLevel: []
  }

  for (const result of batchResults) {
    if (result && result.topLevel) merged.topLevel.push(...result.topLevel)
    if (result && result.adSetLevel) merged.adSetLevel.push(...result.adSetLevel)
    if (result && result.adLevel) merged.adLevel.push(...result.adLevel)
  }

  return merged
}