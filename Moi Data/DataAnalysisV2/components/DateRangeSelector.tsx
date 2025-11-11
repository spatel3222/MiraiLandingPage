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

export default function DateRangeSelector({ dateRange, onChange }: DateRangeSelectorProps) {
  const [localRange, setLocalRange] = useState(dateRange)

  useEffect(() => {
    setLocalRange(dateRange)
  }, [dateRange])

  const handleQuickFilterChange = (filter: typeof dateRange.quickFilter) => {
    const today = new Date()
    let startDate: string
    let endDate = today.toISOString().split('T')[0]

    switch (filter) {
      case 'daily':
        // Last 7 days for daily view
        startDate = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'weekly':
        // Last 4 weeks (28 days)
        startDate = new Date(today.getTime() - 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'monthly':
        // Last 3 months (90 days)
        startDate = new Date(today.getTime() - 89 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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
            { key: 'daily', label: 'Daily (Last 7 Days)', desc: 'Past week' },
            { key: 'weekly', label: 'Weekly (Last 4 Weeks)', desc: 'Past month' },
            { key: 'monthly', label: 'Monthly (Last 3 Months)', desc: 'Past quarter' },
            { key: 'custom', label: 'Custom Range', desc: 'Select dates' }
          ].map(({ key, label, desc }) => (
            <button
              key={key}
              onClick={() => handleQuickFilterChange(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                localRange.quickFilter === key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div className="text-center">
                <div>{label.split(' ')[0]}</div>
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
            max={new Date().toISOString().split('T')[0]}
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