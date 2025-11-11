import { useState } from 'react'
import FileDropZone from '../components/FileDropZone'
import { Platform } from '../lib/supabase'
import { validateCSV, ValidationResult } from '../lib/validators'

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

  const handleFileSelect = async (platform: Platform, file: File) => {
    setFiles(prev => ({ ...prev, [platform]: file }))
    
    // Validate immediately
    const result = await validateCSV(platform, file)
    setValidationResults(prev => ({ ...prev, [platform]: result }))
  }

  const canUpload = () => {
    const platforms: Platform[] = ['meta', 'google', 'shopify']
    return platforms.every(platform => 
      files[platform] && validationResults[platform]?.isValid
    )
  }

  const handleUpload = async () => {
    if (!canUpload()) return
    
    setUploadState('uploading')
    
    try {
      // TODO: Implement upload logic
      console.log('Uploading files...', files)
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setUploadState('success')
    } catch (error) {
      console.error('Upload failed:', error)
      setUploadState('error')
    }
  }

  const platforms: { key: Platform; label: string }[] = [
    { key: 'meta', label: 'Meta Ads' },
    { key: 'google', label: 'Google Ads' }, 
    { key: 'shopify', label: 'Shopify Data' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            MOI Data Analytics - Upload & Validation
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
                <div className="mt-4 text-sm text-red-600">
                  {validationResults[key]?.errors.map((error, index) => (
                    <div key={index}>{error.message}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Upload Progress</h3>
              <p className="text-sm text-gray-600">
                {Object.values(files).filter(Boolean).length} of 3 files ready
              </p>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={!canUpload() || uploadState === 'uploading'}
              className={`px-6 py-3 rounded-lg font-medium ${
                canUpload() && uploadState !== 'uploading'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {uploadState === 'uploading' ? 'Uploading...' : 'Upload All Files'}
            </button>
          </div>
          
          {uploadState === 'success' && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">✅ Upload completed successfully!</p>
            </div>
          )}
          
          {uploadState === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">❌ Upload failed. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}