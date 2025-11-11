import { useState } from 'react'

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

  const handleDataRetrieval = async () => {
    setIsRetrieving(true)
    setRetrievalResults([])

    try {
      // Call the data retrieval API
      const response = await fetch('/api/retrieve-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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

      // Update results
      setRetrievalResults(result.results)
      setLocalStorageInfo(result.localStorage)

      // Pass data to parent
      onDataRetrieved({
        meta: result.data.meta,
        google: result.data.google,
        shopify: result.data.shopify
      })

    } catch (error) {
      console.error('Data retrieval error:', error)
      setRetrievalResults([
        {
          platform: 'meta',
          success: false,
          rowCount: 0,
          dateRange: { min: null, max: null },
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        {
          platform: 'google',
          success: false,
          rowCount: 0,
          dateRange: { min: null, max: null },
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        {
          platform: 'shopify',
          success: false,
          rowCount: 0,
          dateRange: { min: null, max: null },
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      ])
    } finally {
      setIsRetrieving(false)
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

      {/* Progress Indicator */}
      {isRetrieving && (
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