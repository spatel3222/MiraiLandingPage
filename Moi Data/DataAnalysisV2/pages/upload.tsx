import { useState } from 'react'
import FileDropZone from '../components/FileDropZone'
import { Platform, uploadCSVToSupabase } from '../lib/supabase'
import { validateCSV, ValidationResult } from '../lib/validators'
import AICorrections from '../components/AICorrections'

export default function UploadPage() {
  const [files, setFiles] = useState<Record<Platform, File | null>>({
    meta: null,
    google: null,
    shopify: null
  })
  
  const [validationResults, setValidationResults] = useState<Record<Platform, ValidationResult | null>>({
    meta: null,
    google: null,
    shopify: null
  })
  
  const [uploadState, setUploadState] = useState<'initial' | 'uploading' | 'success' | 'error'>('initial')
  const [uploadResults, setUploadResults] = useState<Record<Platform, any> | null>(null)
  const [corrections, setCorrections] = useState<Record<Platform, any>>({} as Record<Platform, any>)

  const handleFileSelect = async (platform: Platform, file: File) => {
    setFiles(prev => ({ ...prev, [platform]: file }))
    
    // Validate immediately
    const result = await validateCSV(platform, file)
    setValidationResults(prev => ({ ...prev, [platform]: result }))
    
    // AI corrections would be set here if available
    // Currently using strict schema validation instead
  }

  const canUpload = () => {
    const platforms: Platform[] = ['meta', 'google', 'shopify']
    return platforms.every(platform => 
      files[platform] && validationResults[platform]?.isValid && !validationResults[platform]?.hasErrors
    )
  }

  // Check if any uploaded files have no errors (warnings are OK for upload)
  const hasFilesReadyForUpload = () => {
    const platforms: Platform[] = ['meta', 'google', 'shopify']
    return platforms.some(platform => 
      files[platform] && validationResults[platform] && !validationResults[platform]?.hasErrors
    )
  }

  // Get only the files that are ready for upload
  const getReadyFiles = () => {
    const platforms: Platform[] = ['meta', 'google', 'shopify']
    return platforms.filter(platform => 
      files[platform] && validationResults[platform] && !validationResults[platform]?.hasErrors
    )
  }

  const handleUpload = async () => {
    if (!hasFilesReadyForUpload()) return
    
    setUploadState('uploading')
    const results: Record<Platform, any> = {} as Record<Platform, any>
    
    try {
      const readyPlatforms = getReadyFiles()
      
      // Upload only the files that are ready (no errors)
      for (const platform of readyPlatforms) {
        const file = files[platform]
        if (file) {
          console.log(`Uploading ${platform} file:`, file.name)
          const result = await uploadCSVToSupabase(platform, file)
          results[platform] = result
          
          if (!result.success) {
            throw new Error(`${platform} upload failed: ${result.message}`)
          }
        }
      }
      
      setUploadResults(results)
      setUploadState('success')
      console.log('All uploads completed successfully:', results)
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadState('error')
      setUploadResults(results) // Partial results for debugging
    }
  }

  const platforms: { key: Platform; label: string }[] = [
    { key: 'meta', label: 'Meta Ads' },
    { key: 'google', label: 'Google Ads' }, 
    { key: 'shopify', label: 'Shopify Data' }
  ]

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
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md"
                >
                  Upload Data
                </a>
                <a 
                  href="/reports" 
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Generate Reports
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Upload & Validation
            </h1>
            <p className="text-gray-600 mt-2">
              Upload Meta, Google, and Shopify CSV files for processing
            </p>
          </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {platforms.map(({ key, label }) => (
            <div key={key} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">{label}</h3>
              
              <FileDropZone
                platform={key}
                onFileSelect={(file) => handleFileSelect(key, file)}
                validationResult={validationResults[key] || undefined}
              />
              
              {validationResults[key]?.hasErrors && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Validation Errors</h4>
                  <div className="space-y-2 text-sm text-red-700">
                    {validationResults[key]?.errors.map((error, index) => (
                      <div key={index}>
                        <div className="font-medium">{error.message}</div>
                        {error.howToFix && (
                          <div className="text-red-600 mt-1">💡 {error.howToFix}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {validationResults[key]?.hasWarnings && !validationResults[key]?.hasErrors && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Validation Warnings</h4>
                  <div className="space-y-2 text-sm text-yellow-700">
                    {validationResults[key]?.warnings.map((warning, index) => (
                      <div key={index}>
                        <div className="font-medium">{warning.message}</div>
                        {warning.howToFix && (
                          <div className="text-yellow-600 mt-1">💡 {warning.howToFix}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {corrections[key] && (
                <AICorrections
                  platform={key}
                  corrections={corrections[key]}
                  onApply={(appliedCorrections) => 
                    setCorrections(prev => ({ ...prev, [key]: appliedCorrections }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">Upload Progress</h3>
              <p className="text-sm text-gray-600">
                {Object.values(files).filter(Boolean).length} of 3 files uploaded • {hasFilesReadyForUpload() ? getReadyFiles().length : 0} ready for upload
              </p>
            </div>
          </div>

          {/* Show success message when any files are ready for upload */}
          {hasFilesReadyForUpload() && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">✅ Files ready for upload!</p>
              <p className="text-green-700 text-sm mt-1">
                {getReadyFiles().length} platform(s) ready •{' '}
                {Object.entries(validationResults)
                  .filter(([platform, result]) => files[platform as Platform] && result && !result.hasErrors)
                  .reduce((total, [, result]) => total + (result?.rowCount || 0), 0)} total rows ready for upload.
                {Object.values(validationResults).some(result => result?.hasWarnings) && (
                  <span className="text-yellow-700"> (Some warnings exist but won't prevent upload)</span>
                )}
              </p>
            </div>
          )}

          {/* Validation Status */}
          <div className="mb-4 space-y-2">
            {Object.entries(validationResults).map(([platform, result]) => {
              if (!result) return null;
              return (
                <div key={platform} className="flex items-center justify-between text-sm">
                  <span className="capitalize font-medium">{platform}:</span>
                  <div className="flex items-center space-x-2">
                    {result.hasErrors ? (
                      <span className="text-red-600 flex items-center">
                        ❌ Schema validation failed
                      </span>
                    ) : result.hasWarnings ? (
                      <span className="text-yellow-600 flex items-center">
                        ⚠️ Has warnings (upload OK)
                      </span>
                    ) : result.isValid ? (
                      <span className="text-green-600 flex items-center">
                        ✅ Ready for upload
                      </span>
                    ) : (
                      <span className="text-gray-500">Pending validation</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Upload Button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={!hasFilesReadyForUpload() || uploadState === 'uploading'}
              className={`px-6 py-3 rounded-lg font-medium ${
                hasFilesReadyForUpload() && uploadState !== 'uploading'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {uploadState === 'uploading' ? 'Uploading to Supabase...' : 
               hasFilesReadyForUpload() ? `Upload ${getReadyFiles().length} File(s) to Supabase` : 
               'Upload to Supabase Database'}
            </button>
          </div>
          
          {!hasFilesReadyForUpload() && Object.values(files).filter(Boolean).length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-800 text-sm">
                <strong>Upload blocked:</strong> Please fix all validation errors before uploading to the Supabase database.
                <span className="text-amber-700 block mt-1">Note: Files with warnings (like extra columns) can still be uploaded safely.</span>
              </p>
            </div>
          )}
          
          {uploadState === 'success' && uploadResults && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">✅ Upload to Supabase completed successfully!</p>
              <div className="mt-2 space-y-1 text-sm text-green-700">
                {Object.entries(uploadResults).map(([platform, result]) => (
                  <div key={platform}>
                    <strong className="capitalize">{platform}:</strong> {result.insertedCount} rows uploaded to Supabase
                  </div>
                ))}
              </div>
              <button
                onClick={() => window.location.href = '/reports'}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                View Reports Dashboard
              </button>
            </div>
          )}
          
          {uploadState === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">❌ Upload to Supabase failed. Please try again.</p>
              {uploadResults && Object.keys(uploadResults).length > 0 && (
                <div className="mt-2 text-sm text-red-700">
                  <p>Partial results:</p>
                  {Object.entries(uploadResults).map(([platform, result]) => (
                    <div key={platform}>
                      <strong className="capitalize">{platform}:</strong> {result.success ? '✅' : '❌'} {result.message}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}