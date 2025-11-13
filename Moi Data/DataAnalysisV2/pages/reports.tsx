import { useState } from 'react'
import DateRangeSelector from '../components/DateRangeSelector'
import DataRetrieval from '../components/DataRetrieval'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    startDate: string
    endDate: string
    quickFilter: 'daily' | 'weekly' | 'monthly' | 'custom'
  }>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 7 days ago
    endDate: new Date().toISOString().split('T')[0], // Default today (will be updated by DateRangeSelector)
    quickFilter: 'weekly'
  })

  const [retrievedData, setRetrievedData] = useState<{
    meta: any[] | null
    google: any[] | null
    shopify: any[] | null
  }>({
    meta: null,
    google: null,
    shopify: null
  })

  const [isRetrieving, setIsRetrieving] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [phase3Results, setPhase3Results] = useState<any>(null)

  const handleDateRangeChange = (newRange: typeof dateRange) => {
    setDateRange(newRange)
    // Clear previous data when date range changes
    setRetrievedData({ meta: null, google: null, shopify: null })
  }

  const handleDataRetrieved = (data: typeof retrievedData) => {
    console.log('📥 handleDataRetrieved called with:', {
      meta: data.meta ? (Array.isArray(data.meta) ? `${data.meta.length} rows` : 'Not array') : 'null',
      google: data.google ? (Array.isArray(data.google) ? `${data.google.length} rows` : 'Not array') : 'null',
      shopify: data.shopify ? (Array.isArray(data.shopify) ? `${data.shopify.length} rows` : 'Not array') : 'null'
    })
    setRetrievedData(data)
    // Clear previous Phase 3 results when new data is retrieved
    setPhase3Results(null)
    console.log('📊 Phase 3 section should now be visible:', !!(data.meta || data.google || data.shopify))
  }

  const handlePhase3Processing = async () => {
    if (!retrievedData.meta && !retrievedData.google && !retrievedData.shopify) {
      alert('Please retrieve data first before processing Phase 3 analytics')
      return
    }

    setIsProcessing(true)
    
    try {
      console.log('🚀 Starting Phase 3 Julius V7 processing with streaming batches...')
      
      // Check total data size and decide processing approach
      const totalRows = (retrievedData.meta?.length || 0) + (retrievedData.google?.length || 0) + (retrievedData.shopify?.length || 0)
      console.log(`📊 Total rows to process: ${totalRows}`)
      
      if (totalRows > 1000) {
        // Use streaming approach for large datasets
        console.log('📡 Using streaming processing for large dataset')
        await processLargeDataset()
      } else {
        // Use original approach for small datasets
        console.log('📦 Using standard processing for small dataset')
        await processStandardDataset()
      }
      
    } catch (error) {
      console.error('❌ Phase 3 processing error:', error)
      alert(`Processing failed: ${error.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const processStandardDataset = async () => {
    const response = await fetch('/api/process-phase3', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        data: retrievedData,
        dateRange: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          reportType: dateRange.quickFilter
        },
        platforms: ['meta', 'google', 'shopify'],
        options: {
          applyShrinkage: true,
          generateRecommendations: true
        }
      })
    })

    const result = await response.json()
    if (result.success) {
      setPhase3Results(result)
      console.log('✅ Phase 3 processing completed successfully')
    } else {
      throw new Error(result.error || 'Processing failed')
    }
  }

  const processLargeDataset = async () => {
    // Process each platform separately to avoid 1MB limit
    const BATCH_SIZE = 500
    const platforms = ['meta', 'google', 'shopify'].filter(p => retrievedData[p]?.length > 0)
    
    console.log(`📋 Processing ${platforms.length} platforms with batch size ${BATCH_SIZE}`)
    
    const allResults = []
    
    for (const platform of platforms) {
      const platformData = retrievedData[platform]
      if (!platformData || platformData.length === 0) continue
      
      console.log(`🔄 Processing ${platform}: ${platformData.length} rows`)
      
      // Split platform data into batches
      const batches = []
      for (let i = 0; i < platformData.length; i += BATCH_SIZE) {
        batches.push(platformData.slice(i, i + BATCH_SIZE))
      }
      
      console.log(`📦 ${platform}: Split into ${batches.length} batches`)
      
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        
        // Create batch data structure
        const batchData = {
          [platform]: batch,
          // Add empty arrays for other platforms
          ...(['meta', 'google', 'shopify'].filter(p => p !== platform).reduce((acc, p) => {
            acc[p] = []
            return acc
          }, {}))
        }
        
        console.log(`🚀 Processing ${platform} batch ${batchIndex + 1}/${batches.length} (${batch.length} rows)`)
        
        const response = await fetch('/api/process-phase3', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: batchData,
            dateRange: {
              startDate: dateRange.startDate,
              endDate: dateRange.endDate,
              reportType: dateRange.quickFilter
            },
            platforms: [platform],
            options: {
              applyShrinkage: true,
              generateRecommendations: true
            }
          })
        })

        const batchResult = await response.json()
        if (batchResult.success) {
          allResults.push(batchResult)
          console.log(`✅ ${platform} batch ${batchIndex + 1} completed`)
        } else {
          throw new Error(`Batch ${batchIndex + 1} failed: ${batchResult.error}`)
        }
      }
    }
    
    // Merge all batch results
    const mergedResult = mergeBatchResults(allResults)
    setPhase3Results(mergedResult)
    console.log('✅ Large dataset processing completed successfully')
  }

  const mergeBatchResults = (batchResults) => {
    if (batchResults.length === 0) return null
    if (batchResults.length === 1) return batchResults[0]

    // Merge multiple batch results
    const merged = {
      success: true,
      summary: {
        totalRows: batchResults.reduce((sum, result) => sum + (result.summary?.totalRows || 0), 0),
        platforms: ['meta', 'google', 'shopify'],
        dateRange: batchResults[0].summary?.dateRange
      },
      outputs: {
        topLevel: [],
        adSetLevel: [],
        adLevel: []
      },
      processingTime: batchResults.reduce((sum, result) => sum + (result.processingTime || 0), 0),
      metadata: {
        timestamp: new Date().toISOString(),
        batchCount: batchResults.length,
        processingMethod: 'client-side-batching'
      }
    }

    // Merge CSV data from all batches with safe array handling
    for (const result of batchResults) {
      console.log('🔍 Merging batch result:', {
        hasOutputs: !!result.outputs,
        topLevelType: typeof result.outputs?.topLevel,
        topLevelLength: Array.isArray(result.outputs?.topLevel) ? result.outputs.topLevel.length : 'not array'
      })
      
      // Handle topLevel data (object with csvData and filename properties)
      if (result.outputs?.topLevel) {
        if (Array.isArray(result.outputs.topLevel)) {
          merged.outputs.topLevel.push(...result.outputs.topLevel)
        } else if (typeof result.outputs.topLevel === 'object') {
          // It's an object with csvData and filename - keep the structure
          merged.outputs.topLevel.push(result.outputs.topLevel)
        } else if (typeof result.outputs.topLevel === 'string') {
          merged.outputs.topLevel.push({ csvData: result.outputs.topLevel, filename: `batch_toplevel_${merged.outputs.topLevel.length}.csv` })
        }
      }
      
      // Handle adSetLevel data
      if (result.outputs?.adSetLevel) {
        if (Array.isArray(result.outputs.adSetLevel)) {
          merged.outputs.adSetLevel.push(...result.outputs.adSetLevel)
        } else if (typeof result.outputs.adSetLevel === 'object') {
          merged.outputs.adSetLevel.push(result.outputs.adSetLevel)
        } else if (typeof result.outputs.adSetLevel === 'string') {
          merged.outputs.adSetLevel.push({ csvData: result.outputs.adSetLevel, filename: `batch_adsetlevel_${merged.outputs.adSetLevel.length}.csv` })
        }
      }
      
      // Handle adLevel data
      if (result.outputs?.adLevel) {
        if (Array.isArray(result.outputs.adLevel)) {
          merged.outputs.adLevel.push(...result.outputs.adLevel)
        } else if (typeof result.outputs.adLevel === 'object') {
          merged.outputs.adLevel.push(result.outputs.adLevel)
        } else if (typeof result.outputs.adLevel === 'string') {
          merged.outputs.adLevel.push({ csvData: result.outputs.adLevel, filename: `batch_adlevel_${merged.outputs.adLevel.length}.csv` })
        }
      }
    }

    return merged
  }

  const downloadPhase3CSV = (outputType: 'topLevel' | 'adSetLevel' | 'adLevel') => {
    if (!phase3Results || !phase3Results.outputs[outputType]) return

    const output = phase3Results.outputs[outputType]
    
    if (output.error) {
      alert(`Error accessing ${outputType} file: ${output.error}`)
      return
    }
    
    if (!output.filename) {
      alert('No file available for this output type')
      return
    }

    // Download from server-saved file
    const downloadUrl = `/api/download-csv/${output.filename}`
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = output.filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  const downloadPhase3CSVDirect = (outputType: 'topLevel' | 'adSetLevel' | 'adLevel') => {
    if (!phase3Results || !phase3Results.rawData[outputType]) return

    const data = phase3Results.rawData[outputType].data
    
    if (!data || data.length === 0) {
      alert('No data available for this output type')
      return
    }

    // Convert to CSV (fallback method)
    const headers = Object.keys(data[0])
    const csvRows = [headers.join(',')]
    
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

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${outputType}_fallback.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadCSV = (data: any[], platform: string, dateRange: any) => {
    if (!data || data.length === 0) return

    // Convert data to CSV
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

    const csvContent = csvRows.join('\n')

    // Create download
    const reportSuffix = dateRange.quickFilter === 'custom' 
      ? `${dateRange.startDate}_to_${dateRange.endDate}` 
      : `${dateRange.quickFilter}_${dateRange.startDate}_to_${dateRange.endDate}`
    
    const filename = `${platform}_${reportSuffix}.csv`
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-semibold text-gray-900">MOI Analytics</h1>
              <div className="flex space-x-4">
                <a 
                  href="/upload" 
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Upload Data
                </a>
                <a 
                  href="/reports" 
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
                >
                  Generate Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Reports & Analysis
            </h1>
            <p className="text-gray-600 mt-2">
              Generate comprehensive reports from Meta, Google, and Shopify data
            </p>
          </header>

        <div className="space-y-8">
          {/* Date Range Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Select Date Range</h2>
            <DateRangeSelector 
              dateRange={dateRange}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Data Retrieval */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Data Retrieval</h2>
            <DataRetrieval 
              dateRange={dateRange}
              onDataRetrieved={handleDataRetrieved}
              isRetrieving={isRetrieving}
              setIsRetrieving={setIsRetrieving}
            />
          </div>

          {/* Data Preview */}
          {(retrievedData.meta || retrievedData.google || retrievedData.shopify) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Retrieved Data Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Meta Data</h3>
                  <p className="text-blue-700">
                    {retrievedData.meta ? `${retrievedData.meta.length} rows` : 'No data'}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">Google Data</h3>
                  <p className="text-green-700">
                    {retrievedData.google ? `${retrievedData.google.length} rows` : 'No data'}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">Shopify Data</h3>
                  <p className="text-purple-700">
                    {retrievedData.shopify ? `${retrievedData.shopify.length} rows` : 'No data'}
                  </p>
                </div>
              </div>

              {/* CSV Download Section */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-medium text-green-800 mb-3">Download Data for Processing</h3>
                <p className="text-green-700 text-sm mb-4">
                  Data retrieved successfully! Download CSV files for Julius V7 methodology processing.
                </p>
                <div className="flex flex-wrap gap-2">
                  {retrievedData.meta && (
                    <button
                      onClick={() => downloadCSV(retrievedData.meta!, 'meta', dateRange)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      📘 Download Meta CSV ({retrievedData.meta.length} rows)
                    </button>
                  )}
                  {retrievedData.google && (
                    <button
                      onClick={() => downloadCSV(retrievedData.google!, 'google', dateRange)}
                      className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      🟢 Download Google CSV ({retrievedData.google.length} rows)
                    </button>
                  )}
                  {retrievedData.shopify && (
                    <button
                      onClick={() => downloadCSV(retrievedData.shopify!, 'shopify', dateRange)}
                      className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      🟣 Download Shopify CSV ({retrievedData.shopify.length} rows)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Debug: Show retrieved data state */}
          <div className="text-xs text-gray-400 mt-2">
            Debug: retrievedData.meta={retrievedData.meta?.length || 0}, google={retrievedData.google?.length || 0}, shopify={retrievedData.shopify?.length || 0}
          </div>

          {/* Phase 3 Analytics Processing */}
          {(retrievedData.meta || retrievedData.google || retrievedData.shopify) && (
            <div className="bg-white rounded-lg shadow p-6 mt-8 border-2 border-purple-200">
              <h2 className="text-xl font-semibold mb-4">Phase 3: Julius V7 Analytics</h2>
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-800 mb-2">Julius V7 Methodology</h3>
                  <div className="text-sm text-purple-700 space-y-1">
                    <p>• <strong>Attribution Logic:</strong> Meta (Day+Campaign+AdSet+Ad), Google (Day+Campaign)</p>
                    <p>• <strong>Business Metrics:</strong> Good Leads, Cost-per metrics, ROAS calculation</p>
                    <p>• <strong>Empirical Bayes Shrinkage:</strong> Statistical validation for small samples</p>
                    <p>• <strong>Performance Scoring:</strong> Efficiency (40%) + Quality (40%) + Volume (20%)</p>
                    <p>• <strong>Recommendations:</strong> Scale, Test-to-Scale, Optimize, Pause/Fix</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">
                      Process retrieved data through Julius V7 analytics engine
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Generate 3 output files: Daily Summary, Ad Set Performance, Ad-Level Metrics
                    </p>
                  </div>
                  
                  <button
                    onClick={handlePhase3Processing}
                    disabled={isProcessing || isRetrieving}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${
                      isProcessing || isRetrieving
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Processing Analytics...</span>
                      </div>
                    ) : (
                      'Process Julius V7 Analytics'
                    )}
                  </button>
                </div>
                
                {/* Processing Progress */}
                {isProcessing && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Processing Julius V7 Analytics</p>
                        <p className="text-sm text-purple-700">
                          Applying attribution logic, calculating business metrics, generating performance scores...
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Phase 3 Results */}
                {phase3Results && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-900">
                            Julius V7 Analytics Processing Completed!
                          </p>
                          <div className="text-sm text-green-700 mt-1 space-y-1">
                            <p>Processed {phase3Results.summary.totalRows} rows in {phase3Results.processingTime}ms</p>
                            <p>Total Spend: ${phase3Results.summary.totalSpend} • Total Revenue: ${phase3Results.summary.totalRevenue} • ROAS: {phase3Results.summary.roas}x</p>
                            <p>Active Platforms: {phase3Results.summary.platforms.join(', ')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Output Files */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Daily Summary */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">📊 Daily Summary</h4>
                        <p className="text-sm text-blue-700 mb-2">
                          {phase3Results.outputs.topLevel.rowCount} rows • Top-level daily metrics across all platforms
                        </p>
                        {phase3Results.outputs.topLevel.filePath && (
                          <p className="text-xs text-blue-600 mb-2 font-mono bg-blue-100 p-1 rounded">
                            💾 {phase3Results.outputs.topLevel.filename}
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadPhase3CSV('topLevel')}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            📋 Download Server File
                          </button>
                          <button
                            onClick={() => downloadPhase3CSVDirect('topLevel')}
                            className="px-2 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            title="Fallback download"
                          >
                            ⬇️
                          </button>
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                          {Array.isArray(phase3Results.outputs.topLevel) ? (
                            <span>Batches: {phase3Results.outputs.topLevel.length} files merged</span>
                          ) : (
                            <>
                              Columns: {phase3Results.outputs.topLevel.columns?.length || 0} fields
                              {phase3Results.outputs.topLevel.size && (
                                <span> • {Math.round(phase3Results.outputs.topLevel.size / 1024)} KB</span>
                              )}
                            </>
                          )}
                        </p>
                        {phase3Results.outputs.topLevel.savedAt && (
                          <p className="text-xs text-blue-500 mt-1">
                            Saved: {new Date(phase3Results.outputs.topLevel.savedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      {/* Ad Set Performance */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">🎯 Ad Set Performance</h4>
                        <p className="text-sm text-green-700 mb-2">
                          {phase3Results.outputs.adSetLevel.rowCount} rows • Meta ad set level performance and recommendations
                        </p>
                        {phase3Results.outputs.adSetLevel.filePath && (
                          <p className="text-xs text-green-600 mb-2 font-mono bg-green-100 p-1 rounded">
                            💾 {phase3Results.outputs.adSetLevel.filename}
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadPhase3CSV('adSetLevel')}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            📋 Download Server File
                          </button>
                          <button
                            onClick={() => downloadPhase3CSVDirect('adSetLevel')}
                            className="px-2 py-2 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                            title="Fallback download"
                          >
                            ⬇️
                          </button>
                        </div>
                        <p className="text-xs text-green-600 mt-2">
                          {Array.isArray(phase3Results.outputs.adSetLevel) ? (
                            <span>Batches: {phase3Results.outputs.adSetLevel.length} files merged</span>
                          ) : (
                            <>
                              Columns: {phase3Results.outputs.adSetLevel.columns?.length || 0} fields
                              {phase3Results.outputs.adSetLevel.size && (
                                <span> • {Math.round(phase3Results.outputs.adSetLevel.size / 1024)} KB</span>
                              )}
                            </>
                          )}
                        </p>
                        {phase3Results.outputs.adSetLevel.savedAt && (
                          <p className="text-xs text-green-500 mt-1">
                            Saved: {new Date(phase3Results.outputs.adSetLevel.savedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      
                      {/* Ad-Level Metrics */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-2">🎨 Ad-Level Metrics</h4>
                        <p className="text-sm text-purple-700 mb-2">
                          {phase3Results.outputs.adLevel.rowCount} rows • Individual ad performance with shrinkage applied
                        </p>
                        {phase3Results.outputs.adLevel.filePath && (
                          <p className="text-xs text-purple-600 mb-2 font-mono bg-purple-100 p-1 rounded">
                            💾 {phase3Results.outputs.adLevel.filename}
                          </p>
                        )}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => downloadPhase3CSV('adLevel')}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                          >
                            📋 Download Server File
                          </button>
                          <button
                            onClick={() => downloadPhase3CSVDirect('adLevel')}
                            className="px-2 py-2 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                            title="Fallback download"
                          >
                            ⬇️
                          </button>
                        </div>
                        <p className="text-xs text-purple-600 mt-2">
                          {Array.isArray(phase3Results.outputs.adLevel) ? (
                            <span>Batches: {phase3Results.outputs.adLevel.length} files merged</span>
                          ) : (
                            <>
                              Columns: {phase3Results.outputs.adLevel.columns?.length || 0} fields
                              {phase3Results.outputs.adLevel.size && (
                                <span> • {Math.round(phase3Results.outputs.adLevel.size / 1024)} KB</span>
                              )}
                            </>
                          )}
                        </p>
                        {phase3Results.outputs.adLevel.savedAt && (
                          <p className="text-xs text-purple-500 mt-1">
                            Saved: {new Date(phase3Results.outputs.adLevel.savedAt).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Methodology Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Julius V7 Processing Details</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium text-gray-800">Attribution Logic Applied:</h5>
                            <ul className="mt-1 space-y-1">
                              <li>• Meta: {phase3Results.metadata.methodology.attribution.meta}</li>
                              <li>• Google: {phase3Results.metadata.methodology.attribution.google}</li>
                              <li>• Shopify: {phase3Results.metadata.methodology.attribution.shopify}</li>
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-800">Performance Recommendations:</h5>
                            <ul className="mt-1 space-y-1">
                              {Object.entries(phase3Results.metadata.methodology.recommendations).map(([rec, score]) => (
                                <li key={rec}>• <strong>{rec}:</strong> {String(score)}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                          Processing completed at {new Date(phase3Results.metadata.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}