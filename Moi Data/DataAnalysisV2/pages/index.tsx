import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            MOI Data Analytics
          </h1>
          <p className="text-gray-600 mb-6">
            Upload and analyze your marketing data from Meta, Google, and Shopify.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/bulk-upload"
              className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Bulk Upload (Multiple Files)
            </Link>
            
            <Link 
              href="/upload"
              className="inline-block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Single File Upload
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}