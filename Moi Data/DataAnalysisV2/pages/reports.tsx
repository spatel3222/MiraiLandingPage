import { useState } from 'react'
import DateRangeSelector from '../components/DateRangeSelector'
import DataRetrieval from '../components/DataRetrieval'

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    startDate: string
    endDate: string
    quickFilter: 'daily' | 'weekly' | 'monthly' | 'custom'
  }>({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0], // today
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

  const handleDateRangeChange = (newRange: typeof dateRange) => {
    setDateRange(newRange)
    // Clear previous data when date range changes
    setRetrievedData({ meta: null, google: null, shopify: null })
  }

  const handleDataRetrieved = (data: typeof retrievedData) => {
    setRetrievedData(data)
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
        </div>
        </div>
      </div>
    </div>
  )
}