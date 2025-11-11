import React, { useState } from 'react'
import BulkFileUpload, { UploadFile } from '../components/BulkFileUpload'
import WorkflowProgress, { FileProgress, FileStatus } from '../components/WorkflowProgress'
import ValidationDetails from '../components/ValidationDetails'
import { validateCSV, ValidationResult } from '../lib/validators'
import { detectPlatformFromHeaders } from '../lib/platformDetector'
import Papa from 'papaparse'

type OverallStatus = 'idle' | 'processing' | 'completed' | 'error'

export default function BulkUploadPage() {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([])
  const [fileProgress, setFileProgress] = useState<FileProgress[]>([])
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({})
  const [overallStatus, setOverallStatus] = useState<OverallStatus>('idle')
  const [isUploading, setIsUploading] = useState(false)

  const handleFilesSelected = (files: UploadFile[]) => {
    setUploadFiles(files)
    // Reset progress when new files are selected
    setFileProgress([])
    setOverallStatus('idle')
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadFiles(files => files.filter(f => f.id !== fileId))
    setFileProgress(progress => progress.filter(p => p.id !== fileId))
  }

  const updateFileProgress = (fileId: string, updates: Partial<FileProgress>) => {
    setFileProgress(prev => prev.map(p => 
      p.id === fileId ? { ...p, ...updates } : p
    ))
  }

  const validateFileOnly = async (uploadFile: UploadFile): Promise<void> => {
    const fileProgress: FileProgress = {
      id: uploadFile.id,
      name: uploadFile.file.name,
      platform: uploadFile.platform || 'Unknown',
      status: 'uploading',
      progress: 0
    }

    // Initialize progress
    setFileProgress(prev => [...prev.filter(p => p.id !== uploadFile.id), fileProgress])

    try {
      // Step 1: Reading file
      updateFileProgress(uploadFile.id, { status: 'uploading', progress: 20 })
      await new Promise(resolve => setTimeout(resolve, 300))

      // Step 2: Validate schema and data
      updateFileProgress(uploadFile.id, { status: 'validating', progress: 50 })
      
      // Determine platform from detected platform string
      const platformKey = uploadFile.platform?.toLowerCase().includes('meta') ? 'meta' :
                         uploadFile.platform?.toLowerCase().includes('google') ? 'google' : 'shopify'
      
      // Perform full CSV validation
      const validation = await validateCSV(platformKey, uploadFile.file)

      // Store validation results for detailed view
      setValidationResults(prev => ({
        ...prev,
        [uploadFile.id]: validation
      }))

      if (!validation.isValid) {
        // Show detailed validation errors
        const errorCount = validation.errors.length
        const warningCount = validation.warnings.length
        
        updateFileProgress(uploadFile.id, { 
          status: 'error', 
          progress: 50,
          errorMessage: `${errorCount} errors${warningCount > 0 ? `, ${warningCount} warnings` : ''}`
        })
        return
      }

      // Success - stop at validation (no upload)
      updateFileProgress(uploadFile.id, { 
        status: 'validated', 
        progress: 100,
        rowCount: validation.rowCount,
        errorMessage: validation.hasWarnings ? 
          `${validation.warnings.length} warnings (check details below)` : undefined
      })

    } catch (error) {
      updateFileProgress(uploadFile.id, { 
        status: 'error', 
        progress: 0,
        errorMessage: error instanceof Error ? error.message : 'Processing failed'
      })
    }
  }

  const handleStartUpload = async () => {
    if (uploadFiles.length === 0 || uploadFiles.some(f => f.error)) return

    setIsUploading(true)
    setOverallStatus('processing')
    setFileProgress([])

    try {
      // Process all files in parallel (validation only)
      await Promise.all(
        uploadFiles.map(uploadFile => validateFileOnly(uploadFile))
      )

      // Check if all files completed successfully
      const finalProgress = fileProgress.filter(p => uploadFiles.some(f => f.id === p.id))
      const hasErrors = finalProgress.some(p => p.status === 'error')
      
      setOverallStatus(hasErrors ? 'error' : 'completed')
      
    } catch (error) {
      console.error('Bulk upload failed:', error)
      setOverallStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const canStartUpload = () => {
    return uploadFiles.length > 0 && 
           uploadFiles.every(f => !f.error && f.platform) && 
           !isUploading
  }

  const getUploadButtonText = () => {
    if (isUploading) return 'Processing...'
    if (uploadFiles.length === 0) return 'Select Files First'
    const validFiles = uploadFiles.filter(f => !f.error).length
    return `Validate ${validFiles} File${validFiles !== 1 ? 's' : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            CSV Schema Validation & Testing
          </h1>
          <p className="text-gray-600 mt-2">
            Upload multiple Meta, Google, and Shopify CSV files for schema validation (no data upload)
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            🛡️ Safe Mode: Files validated only, no database upload
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: File Upload */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Select CSV Files
              </h2>
              
              <BulkFileUpload
                onFilesSelected={handleFilesSelected}
                onRemoveFile={handleRemoveFile}
                files={uploadFiles}
                disabled={isUploading}
              />

              {uploadFiles.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600">
                      {uploadFiles.filter(f => !f.error).length} of {uploadFiles.length} files ready
                    </div>
                    
                    <button
                      onClick={handleStartUpload}
                      disabled={!canStartUpload()}
                      className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                        canStartUpload()
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {getUploadButtonText()}
                    </button>
                  </div>

                  {uploadFiles.some(f => f.error) && (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                      ⚠️ Some files have errors and will be skipped. Remove or fix them to proceed.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Progress */}
          <div>
            {(fileProgress.length > 0 || overallStatus !== 'idle') ? (
              <WorkflowProgress 
                files={fileProgress}
                overallStatus={overallStatus}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Upload Progress
                </h3>
                <div className="text-center py-12 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📄</span>
                  </div>
                  <p>Select CSV files to see upload progress</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Validation Results */}
        {Object.keys(validationResults).length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Validation Results</h3>
            
            {Object.entries(validationResults).map(([fileId, validation]) => {
              const uploadFile = uploadFiles.find(f => f.id === fileId)
              if (!uploadFile) return null
              
              return (
                <div key={fileId} className="bg-white rounded-lg shadow p-6">
                  <ValidationDetails 
                    validation={validation}
                    fileName={uploadFile.file.name}
                  />
                </div>
              )
            })}
          </div>
        )}

        {/* Quick Start Guide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Quick Start Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-medium mb-1">1. Drop Files</div>
              <div>Drag & drop multiple CSV files or click to browse</div>
            </div>
            <div>
              <div className="font-medium mb-1">2. Auto-Detect</div>
              <div>Platform detection based on column headers</div>
            </div>
            <div>
              <div className="font-medium mb-1">3. Upload</div>
              <div>Validate, process & ingest into database</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}