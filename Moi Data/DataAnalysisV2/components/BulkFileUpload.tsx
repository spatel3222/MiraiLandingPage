import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CloudArrowUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { detectPlatformFromHeaders, getPlatformDisplayName } from '../lib/platformDetector'
import Papa from 'papaparse'

export interface UploadFile {
  id: string
  file: File
  platform?: string
  confidence?: number
  headers?: string[]
  previewData?: any[]
  error?: string
}

interface BulkFileUploadProps {
  onFilesSelected: (files: UploadFile[]) => void
  onRemoveFile: (fileId: string) => void
  files: UploadFile[]
  disabled?: boolean
}

export default function BulkFileUpload({ 
  onFilesSelected, 
  onRemoveFile, 
  files, 
  disabled = false 
}: BulkFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const processFiles = async (acceptedFiles: File[]) => {
    setIsProcessing(true)
    
    const processedFiles: UploadFile[] = []
    
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      try {
        // Parse CSV headers to detect platform
        await new Promise<void>((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            preview: 5, // Only parse first 5 rows for detection
            complete: (results) => {
              const headers = results.meta.fields || []
              const detectedPlatform = detectPlatformFromHeaders(headers)
              
              if (detectedPlatform) {
                processedFiles.push({
                  id: fileId,
                  file,
                  platform: getPlatformDisplayName(detectedPlatform.platform),
                  confidence: detectedPlatform.confidence,
                  headers,
                  previewData: results.data.slice(0, 3) // First 3 rows for preview
                })
              } else {
                processedFiles.push({
                  id: fileId,
                  file,
                  error: 'Could not detect platform from CSV headers. Please check column names.'
                })
              }
              resolve()
            },
            error: (error) => {
              processedFiles.push({
                id: fileId,
                file,
                error: `Failed to parse CSV: ${error.message}`
              })
              resolve() // Continue processing other files
            }
          })
        })
      } catch (error) {
        processedFiles.push({
          id: fileId,
          file,
          error: 'Failed to process file'
        })
      }
    }
    
    setIsProcessing(false)
    onFilesSelected([...files, ...processedFiles])
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csvFiles = acceptedFiles.filter(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    if (csvFiles.length > 0) {
      processFiles(csvFiles)
    }
  }, [files, onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    disabled: disabled || isProcessing,
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled || isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        {isProcessing ? (
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">Processing files...</p>
            <p className="text-gray-500">Detecting platforms and validating CSV structure</p>
          </div>
        ) : isDragActive ? (
          <div>
            <p className="text-lg font-medium text-blue-600 mb-2">Drop your CSV files here</p>
            <p className="text-blue-500">Multiple files supported</p>
          </div>
        ) : (
          <div>
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop CSV files here or click to browse
            </p>
            <p className="text-gray-500 mb-4">
              Upload multiple Meta, Google, and Shopify CSV files at once
            </p>
            <div className="text-sm text-gray-400">
              Platform auto-detection • Supports .csv files
            </div>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Selected Files ({files.length})</h4>
          
          {files.map((uploadFile) => (
            <div key={uploadFile.id} className="border rounded-lg p-4 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="font-medium text-gray-900 truncate">
                      {uploadFile.file.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatFileSize(uploadFile.file.size)}
                    </div>
                    {uploadFile.platform && (
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {uploadFile.platform}
                        {uploadFile.confidence && (
                          <span className="ml-1 text-blue-600">
                            ({Math.round(uploadFile.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {uploadFile.error ? (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      {uploadFile.error}
                    </div>
                  ) : uploadFile.headers && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Columns detected:</span> {uploadFile.headers.slice(0, 5).join(', ')}
                      {uploadFile.headers.length > 5 && ` +${uploadFile.headers.length - 5} more`}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onRemoveFile(uploadFile.id)}
                  className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={disabled}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}