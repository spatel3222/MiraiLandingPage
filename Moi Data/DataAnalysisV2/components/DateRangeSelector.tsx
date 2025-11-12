import { useState, useEffect } from 'react'

interface DateRangeSelectorProps {
  dateRange: {
    startDate: string
    endDate: string
    quickFilter: 'daily' | 'weekly' | 'monthly' | 'custom'
  }
  onChange: (range: {
    startDate: string
    endDate: string
    quickFilter: 'daily' | 'weekly' | 'monthly' | 'custom'
  }) => void
}

interface LatestDateInfo {
  latestDate: string
  availablePlatforms: string[]
  missingPlatforms: string[]
  message: string
}

export default function DateRangeSelector({ dateRange, onChange }: DateRangeSelectorProps) {
  const [localRange, setLocalRange] = useState(dateRange)
  const [latestDateInfo, setLatestDateInfo] = useState<LatestDateInfo | null>(null)
  const [isLoadingLatestDate, setIsLoadingLatestDate] = useState(true)
  const [latestDateError, setLatestDateError] = useState<string | null>(null)

  useEffect(() => {
    setLocalRange(dateRange)
  }, [dateRange])

  // Fetch latest data date on component mount
  useEffect(() => {
    const fetchLatestDate = async () => {
      try {
        setIsLoadingLatestDate(true)
        setLatestDateError(null)
        
        const response = await fetch('/api/latest-data-date')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch latest date')
        }

        setLatestDateInfo(data)
      } catch (error) {
        console.error('Error fetching latest date:', error)
        setLatestDateError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsLoadingLatestDate(false)
      }
    }

    fetchLatestDate()
  }, [])

  const handleQuickFilterChange = (filter: typeof dateRange.quickFilter) => {
    // Require latest data info for quick filters
    if (!latestDateInfo?.latestDate) {
      console.warn('Cannot use quick filters: Latest data date not available yet')
      return
    }
    
    const referenceDate = new Date(latestDateInfo.latestDate)
    
    let startDate: string
    let endDate = referenceDate.toISOString().split('T')[0]

    switch (filter) {
      case 'daily':
        // Just the latest data date (single day)
        startDate = endDate
        break
      case 'weekly':
        // 7 days back from latest data date
        startDate = new Date(referenceDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'monthly':
        // 30 days back from latest data date
        startDate = new Date(referenceDate.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'custom':
        // Keep existing dates for custom
        startDate = localRange.startDate
        endDate = localRange.endDate
        break
    }

    const newRange = {
      startDate,
      endDate,
      quickFilter: filter
    }

    setLocalRange(newRange)
    onChange(newRange)
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newRange = {
      ...localRange,
      [field]: value,
      quickFilter: 'custom' as const
    }

    setLocalRange(newRange)
    onChange(newRange)
  }

  const getDateRangeText = () => {
    const start = new Date(localRange.startDate)
    const end = new Date(localRange.endDate)
    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return `${diffDays + 1} days selected (${start.toLocaleDateString()} - ${end.toLocaleDateString()})`
  }

  return (
    <div className="space-y-4">
      {/* Quick Filters */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Filters
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'daily', label: 'Daily', desc: 'Latest day' },
            { key: 'weekly', label: 'Weekly', desc: '7 days' },
            { key: 'monthly', label: 'Monthly', desc: '30 days' },
            { key: 'custom', label: 'Custom Range', desc: 'Select dates' }
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => handleQuickFilterChange(key as any)}
              disabled={isLoadingLatestDate || !latestDateInfo?.latestDate}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                localRange.quickFilter === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isLoadingLatestDate || !latestDateInfo?.latestDate
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-center">
                <div>{label}</div>
                <div className="text-xs opacity-75">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDate"
            value={localRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            max={localRange.endDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={localRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            min={localRange.startDate}
            max={latestDateInfo?.latestDate || new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Range Summary */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-900">Selected Range</p>
            <p className="text-sm text-blue-700">{getDateRangeText()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-blue-900">Report Type</p>
            <p className="text-sm text-blue-700 capitalize">{localRange.quickFilter}</p>
          </div>
        </div>
      </div>

      {/* Latest Data Info */}
      {isLoadingLatestDate && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-blue-800">Loading latest data information...</p>
          </div>
        </div>
      )}

      {latestDateError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error Loading Latest Date</p>
              <p className="text-sm text-red-700">{latestDateError}</p>
            </div>
          </div>
        </div>
      )}

      {latestDateInfo && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">Latest Available Data</p>
              <p className="text-sm text-green-700">
                <strong>Date:</strong> {latestDateInfo.latestDate} | 
                <strong> Platforms:</strong> {latestDateInfo.availablePlatforms.join(', ')}
                {latestDateInfo.missingPlatforms.length > 0 && (
                  <span className="text-yellow-700"> | <strong>Missing:</strong> {latestDateInfo.missingPlatforms.join(', ')}</span>
                )}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Quick filters are calculated from this latest data date.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Coverage Warning */}
      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-medium text-yellow-800">Data Availability</p>
            <p className="text-sm text-yellow-700">
              Data will be pulled from Supabase tables on demand. Ensure the selected date range contains uploaded data.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}