import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { CheckCircleIcon, ExclamationCircleIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { Platform } from '../lib/supabase'
import { ValidationResult } from '../lib/validators'

interface FileDropZoneProps {
  platform: Platform
  onFileSelect: (file: File) => void
  validationResult?: ValidationResult
}

export default function FileDropZone({ platform, onFileSelect, validationResult }: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === 'text/csv') {
      onFileSelect(file)
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false)
  })

  const getDropZoneClasses = () => {
    let classes = 'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors '
    
    if (isDragActive) {
      classes += 'border-blue-400 bg-blue-50 '
    } else if (validationResult?.isValid) {
      classes += 'border-green-400 bg-green-50 '
    } else if (validationResult?.hasErrors) {
      classes += 'border-red-400 bg-red-50 '
    } else {
      classes += 'border-gray-300 hover:border-gray-400 '
    }
    
    return classes
  }

  return (
    <div
      {...getRootProps()}
      className={getDropZoneClasses()}
    >
      <input {...getInputProps()} />
      
      {validationResult?.isValid ? (
        <div className="text-green-600">
          <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">File validated successfully</p>
          <p className="text-sm">{validationResult.rowCount} rows detected</p>
        </div>
      ) : validationResult?.hasErrors ? (
        <div className="text-red-600">
          <ExclamationCircleIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Validation errors detected</p>
          <p className="text-sm">{validationResult.errors.length} issues found</p>
        </div>
      ) : (
        <div className="text-gray-600">
          <CloudArrowUpIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="font-medium">Drop your {platform} CSV file here</p>
          <p className="text-sm">or click to browse</p>
        </div>
      )}
    </div>
  )
}