import { useState, useRef } from 'react'

interface DataRetrievalProps {
  dateRange: {
    startDate: string
    endDate: string
    quickFilter: 'daily' | 'weekly' | 'monthly' | 'custom'
  }
  onDataRetrieved: (data: {
    meta: any[] | null
    google: any[] | null
    shopify: any[] | null
  }) => void
  isRetrieving: boolean
  setIsRetrieving: (retrieving: boolean) => void
}

interface RetrievalResult {
  platform: 'meta' | 'google' | 'shopify'
  success: boolean
  rowCount: number
  dateRange: {
    min: string | null
    max: string | null
  }
  error?: string
  sampleData?: any[]
}

interface PlatformProgress {
  platform: string
  processedRows: number
  totalRows: number
  progress: number
  speed: number
  remainingSeconds: number
  status: 'waiting' | 'processing' | 'completed' | 'error'
  error?: string
}

export default function DataRetrieval({ 
  dateRange, 
  onDataRetrieved, 
  isRetrieving, 
  setIsRetrieving 
}: DataRetrievalProps) {
  const [retrievalResults, setRetrievalResults] = useState<RetrievalResult[]>([])
  const [localStorageInfo, setLocalStorageInfo] = useState<{
    meta?: { filename: string; size: number }
    google?: { filename: string; size: number }
    shopify?: { filename: string; size: number }
  }>({})
  const [platformProgress, setPlatformProgress] = useState<Record<string, PlatformProgress>>({})
  const [overallProgress, setOverallProgress] = useState({
    totalRows: 0,
    processedRows: 0,
    percentage: 0,
    currentPhase: '',
    estimatedTimeRemaining: 0
  })
  const [useStreaming, setUseStreaming] = useState(true)
  const abortControllerRef = useRef<AbortController | null>(null)

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsRetrieving(false)
    setPlatformProgress({})
    setOverallProgress({ totalRows: 0, processedRows: 0, percentage: 0, currentPhase: '', estimatedTimeRemaining: 0 })
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const handleStreamingRetrieval = async () => {
    setIsRetrieving(true)
    setRetrievalResults([])
    setPlatformProgress({})
    setOverallProgress({ totalRows: 0, processedRows: 0, percentage: 0, currentPhase: 'Starting...', estimatedTimeRemaining: 0 })
    
    // Create abort controller
    abortControllerRef.current = new AbortController()
    
    try {
      // Date validation
      const latestDateResponse = await fetch('/api/latest-data-date')
      const latestDateData = await latestDateResponse.json()
      
      if (latestDateResponse.ok && latestDateData.latestDate) {
        const latestDate = latestDateData.latestDate
        const requestedEndDate = dateRange.endDate
        
        if (requestedEndDate > latestDate) {
          setRetrievalResults([{
            platform: 'validation' as any,
            success: false,
            rowCount: 0,
            dateRange: { min: null, max: null },
            error: `No data available for ${requestedEndDate}. Latest available data is ${latestDate}. Please select a date range up to ${latestDate}.`
          }])
          setIsRetrieving(false)
          return
        }
      }

      // Initialize platform progress
      const platforms = ['meta', 'google', 'shopify']
      const initialProgress = platforms.reduce((acc, platform) => {
        acc[platform] = {
          platform,
          processedRows: 0,
          totalRows: 0,
          progress: 0,
          speed: 0,
          remainingSeconds: 0,
          status: 'waiting'
        }
        return acc
      }, {} as Record<string, PlatformProgress>)
      setPlatformProgress(initialProgress)

      // Start SSE connection
      const response = await fetch('/api/retrieve-data-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          reportType: dateRange.quickFilter
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('Failed to start data retrieval')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      let finalData = null

      while (reader) {
        const { done, value } = await reader.read()
        
        if (done) break
        if (abortControllerRef.current?.signal.aborted) {
          reader.cancel()
          break
        }

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              switch (data.type) {
                case 'start':
                  setOverallProgress(prev => ({ ...prev, currentPhase: 'Starting data retrieval...' }))
                  break
                  
                case 'estimation':
                  setPlatformProgress(prev => ({
                    ...prev,
                    [data.platform]: {
                      ...prev[data.platform],
                      totalRows: data.totalRows,
                      status: 'waiting'
                    }
                  }))
                  break
                  
                case 'estimation_complete':
                  setOverallProgress(prev => ({
                    ...prev,
                    totalRows: data.grandTotal,
                    currentPhase: `Processing ${data.grandTotal.toLocaleString()} total rows`
                  }))
                  break
                  
                case 'platform_start':
                  setPlatformProgress(prev => ({
                    ...prev,
                    [data.platform]: {
                      ...prev[data.platform],
                      status: 'processing'
                    }
                  }))
                  break
                  
                case 'platform_progress':
                  setPlatformProgress(prev => ({
                    ...prev,
                    [data.platform]: {
                      ...prev[data.platform],
                      processedRows: data.processedRows,
                      totalRows: data.totalRows,
                      progress: data.progress,
                      speed: data.speed,
                      remainingSeconds: data.remainingSeconds,
                      status: 'processing'
                    }
                  }))
                  
                  // Update overall progress
                  setOverallProgress(prev => {
                    const totalProcessed = Object.values(platformProgress).reduce((sum, p) => sum + p.processedRows, 0) + data.processedRows
                    const totalRows = Object.values(platformProgress).reduce((sum, p) => sum + p.totalRows, 0)
                    return {
                      ...prev,
                      processedRows: totalProcessed,
                      percentage: totalRows > 0 ? Math.round((totalProcessed / totalRows) * 100) : 0,
                      currentPhase: `Processing ${data.platform}...`
                    }
                  })
                  break
                  
                case 'platform_complete':
                  setPlatformProgress(prev => ({
                    ...prev,
                    [data.platform]: {
                      ...prev[data.platform],
                      status: 'completed',
                      progress: 100
                    }
                  }))
                  break
                  
                case 'platform_error':
                  setPlatformProgress(prev => ({
                    ...prev,
                    [data.platform]: {
                      ...prev[data.platform],
                      status: 'error',
                      error: data.error
                    }
                  }))
                  break
                  
                case 'complete':
                  finalData = data
                  setOverallProgress(prev => ({
                    ...prev,
                    percentage: 100,
                    currentPhase: 'Complete'
                  }))
                  break
                  
                case 'error':
                  throw new Error(data.error)
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE data:', line)
            }
          }
        }
      }

      // Process final results
      if (finalData) {
        setRetrievalResults(finalData.results)
        setLocalStorageInfo(finalData.localStorageKeys ? {} : finalData.localStorage || {})
        
        // If the response was modified to avoid 4MB limit, fetch the actual data
        if (finalData.dataKeys) {
          console.log('Fetching actual data after streaming completion...')
          try {
            const dataResponse = await fetch('/api/retrieve-data', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                startDate: dateRange.startDate, 
                endDate: dateRange.endDate, 
                reportType: dateRange.quickFilter 
              })
            })
            
            if (dataResponse.ok) {
              const actualData = await dataResponse.json()
              console.log('✅ Successfully fetched actual data:', {
                success: actualData.success,
                meta: actualData.data?.meta?.length || 0,
                google: actualData.data?.google?.length || 0,
                shopify: actualData.data?.shopify?.length || 0,
                keys: Object.keys(actualData)
              })
              
              if (actualData.success && actualData.data) {
                console.log('🎯 Calling onDataRetrieved with data:', {
                  meta: actualData.data.meta?.length || 0,
                  google: actualData.data.google?.length || 0,
                  shopify: actualData.data.shopify?.length || 0
                })
                
                onDataRetrieved({
                  meta: actualData.data.meta || null,
                  google: actualData.data.google || null,
                  shopify: actualData.data.shopify || null
                })
                
                console.log('✅ onDataRetrieved called successfully')
              } else {
                throw new Error(`API returned unsuccessful response: ${JSON.stringify(actualData)}`)
              }
            } else {
              const errorText = await dataResponse.text()
              throw new Error(`HTTP ${dataResponse.status}: ${errorText}`)
            }
          } catch (error) {
            console.error('Error fetching actual data:', error)
            // Show user-friendly error but don't break the flow
            setRetrievalResults(finalData.results.map(r => ({
              ...r,
              success: false,
              error: 'Failed to retrieve data for Julius V7 processing'
            })))
            onDataRetrieved({ meta: null, google: null, shopify: null })
          }
        } else {
          // Old format with full data
          onDataRetrieved({
            meta: finalData.data?.meta || null,
            google: finalData.data?.google || null,
            shopify: finalData.data?.shopify || null
          })
        }
      }

    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Data retrieval cancelled')
        setOverallProgress(prev => ({ ...prev, currentPhase: 'Cancelled' }))
      } else {
        console.error('Streaming retrieval error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setRetrievalResults([
          { platform: 'meta', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage },
          { platform: 'google', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage },
          { platform: 'shopify', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage }
        ])
      }
    } finally {
      setIsRetrieving(false)
      abortControllerRef.current = null
    }
  }

  const handleLegacyRetrieval = async () => {
    setIsRetrieving(true)
    setRetrievalResults([])

    try {
      const latestDateResponse = await fetch('/api/latest-data-date')
      const latestDateData = await latestDateResponse.json()
      
      if (latestDateResponse.ok && latestDateData.latestDate) {
        const latestDate = latestDateData.latestDate
        const requestedEndDate = dateRange.endDate
        
        if (requestedEndDate > latestDate) {
          setRetrievalResults([{
            platform: 'validation' as any,
            success: false,
            rowCount: 0,
            dateRange: { min: null, max: null },
            error: `No data available for ${requestedEndDate}. Latest available data is ${latestDate}. Please select a date range up to ${latestDate}.`
          }])
          setIsRetrieving(false)
          return
        }
      }

      const response = await fetch('/api/retrieve-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          reportType: dateRange.quickFilter
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Data retrieval failed')
      }

      setRetrievalResults(result.results)
      setLocalStorageInfo(result.localStorage)
      onDataRetrieved({
        meta: result.data.meta,
        google: result.data.google,
        shopify: result.data.shopify
      })

    } catch (error: unknown) {
      console.error('Data retrieval error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setRetrievalResults([
        { platform: 'meta', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage },
        { platform: 'google', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage },
        { platform: 'shopify', success: false, rowCount: 0, dateRange: { min: null, max: null }, error: errorMessage }
      ])
    } finally {
      setIsRetrieving(false)
    }
  }

  const handleDataRetrieval = () => {
    if (useStreaming) {
      handleStreamingRetrieval()
    } else {
      handleLegacyRetrieval()
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'meta':
        return '📘' // Blue book for Meta/Facebook
      case 'google':
        return '🟢' // Green circle for Google
      case 'shopify':
        return '🟣' // Purple circle for Shopify
      default:
        return '📊'
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'meta':
        return 'Meta Ads'
      case 'google':
        return 'Google Ads'
      case 'shopify':
        return 'Shopify Analytics'
      default:
        return platform
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings */}
      <div className="mb-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={useStreaming}
            onChange={(e) => setUseStreaming(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-600">
            Use streaming progress (recommended for large datasets)
          </span>
        </label>
      </div>

      {/* Retrieval Button */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Pull data from Supabase for the selected date range: 
            <span className="font-medium text-gray-900 ml-1">
              {dateRange.startDate} to {dateRange.endDate}
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Data will be saved locally for processing and analysis
          </p>
        </div>
        
        <div className="flex space-x-2">
          {isRetrieving && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-all"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={handleDataRetrieval}
            disabled={isRetrieving}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isRetrieving 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
            }`}
          >
            {isRetrieving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Retrieving Data...</span>
              </div>
            ) : (
              'Retrieve Data'
            )}
          </button>
        </div>
      </div>

      {/* Enhanced Progress Indicator */}
      {isRetrieving && useStreaming && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          {/* Overall Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium text-blue-900">Data Retrieval Progress</h3>
              <span className="text-sm text-blue-700">{overallProgress.currentPhase}</span>
            </div>
            
            <div className="w-full bg-blue-200 rounded-full h-3 mb-2">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${overallProgress.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm text-blue-700">
              <span>
                {overallProgress.processedRows.toLocaleString()} / {overallProgress.totalRows.toLocaleString()} rows
              </span>
              <span>{overallProgress.percentage}%</span>
            </div>
          </div>

          {/* Platform-specific Progress */}
          <div className="space-y-4">
            <h4 className="font-medium text-blue-800">Platform Progress</h4>
            {Object.entries(platformProgress).map(([platformName, progress]) => (
              <div key={platformName} className="bg-white rounded-lg p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlatformIcon(platformName)}</span>
                    <span className="font-medium text-gray-900 capitalize">{platformName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      progress.status === 'completed' ? 'bg-green-100 text-green-800' :
                      progress.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      progress.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {progress.status}
                    </span>
                  </div>
                  
                  {progress.status === 'processing' && (
                    <div className="text-sm text-gray-600">
                      {progress.speed > 0 && (
                        <span>{Math.round(progress.speed)} rows/sec</span>
                      )}
                      {progress.remainingSeconds > 0 && (
                        <span className="ml-2">• ETA {formatTime(progress.remainingSeconds)}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      progress.status === 'completed' ? 'bg-green-500' :
                      progress.status === 'error' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`}
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-600">
                  <span>
                    {progress.processedRows.toLocaleString()} / {progress.totalRows.toLocaleString()} rows
                  </span>
                  <span>{progress.progress}%</span>
                </div>
                
                {progress.error && (
                  <p className="text-xs text-red-600 mt-1">{progress.error}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Legacy Progress Indicator */}
      {isRetrieving && !useStreaming && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-900">Retrieving Data from Supabase</p>
              <p className="text-sm text-blue-700">
                Querying meta_import_data, google_import_data, and shopify_import_data tables...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Retrieval Results */}
      {retrievalResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Retrieval Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {retrievalResults.map((result) => (
              <div 
                key={result.platform}
                className={`p-4 rounded-lg border-2 ${
                  result.success 
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlatformIcon(result.platform)}</span>
                    <h4 className="font-medium text-gray-900">
                      {getPlatformName(result.platform)}
                    </h4>
                  </div>
                  <div className={`text-sm px-2 py-1 rounded ${
                    result.success 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </div>
                </div>

                {result.success ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rows Retrieved:</span>
                      <span className="font-medium text-gray-900">{result.rowCount.toLocaleString()}</span>
                    </div>
                    
                    {result.dateRange.min && result.dateRange.max && (
                      <div className="text-sm">
                        <span className="text-gray-600">Date Coverage:</span>
                        <div className="text-gray-900 font-mono text-xs mt-1">
                          {result.dateRange.min} to {result.dateRange.max}
                        </div>
                      </div>
                    )}

                    {result.sampleData && result.sampleData.length > 0 && (
                      <div className="text-sm">
                        <span className="text-gray-600">Sample Columns:</span>
                        <div className="text-gray-700 text-xs mt-1">
                          {Object.keys(result.sampleData[0]).slice(0, 4).join(', ')}
                          {Object.keys(result.sampleData[0]).length > 4 && '...'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-red-700">
                    <p>Error: {result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Local Storage Info */}
          {Object.keys(localStorageInfo).length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Local Data Storage</h4>
              <div className="space-y-2">
                {Object.entries(localStorageInfo).map(([platform, info]) => (
                  <div key={platform} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 capitalize">{platform}:</span>
                    <span className="text-gray-900 font-mono">
                      {info.filename} ({(info.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💾 Data saved locally for processing using Julius V7 methodology
              </p>
            </div>
          )}

          {/* Success Message */}
          {retrievalResults.every(r => r.success) && retrievalResults.length === 3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Data retrieval completed successfully!
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    All three platforms retrieved. Total: {retrievalResults.reduce((sum, r) => sum + r.rowCount, 0).toLocaleString()} rows.
                    Ready for Julius V7 processing and analysis.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}