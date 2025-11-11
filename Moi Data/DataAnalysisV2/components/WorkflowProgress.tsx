import React from 'react'
import { 
  CloudArrowUpIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  DatabaseIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'

export type FileStatus = 'pending' | 'uploading' | 'validating' | 'validated' | 'ingesting' | 'completed' | 'error'

export interface FileProgress {
  id: string
  name: string
  platform: string
  status: FileStatus
  progress: number // 0-100
  errorMessage?: string
  rowCount?: number
}

interface WorkflowProgressProps {
  files: FileProgress[]
  overallStatus: 'idle' | 'processing' | 'completed' | 'error'
}

const STATUS_STEPS = [
  { key: 'uploading', label: 'Reading', icon: CloudArrowUpIcon },
  { key: 'validating', label: 'Validating', icon: DocumentCheckIcon },
  { key: 'validated', label: 'Schema OK', icon: CheckCircleIcon }
]

export default function WorkflowProgress({ files, overallStatus }: WorkflowProgressProps) {
  const getStatusColor = (status: FileStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
      case 'uploading':
      case 'validating': 
      case 'ingesting': return 'text-blue-600 bg-blue-50'
      case 'validated': return 'text-emerald-600 bg-emerald-50'
      default: return 'text-gray-400 bg-gray-50'
    }
  }

  const getStatusIcon = (status: FileStatus) => {
    switch (status) {
      case 'uploading': return CloudArrowUpIcon
      case 'validating': return DocumentCheckIcon
      case 'validated': return CheckCircleIcon
      case 'ingesting': return DatabaseIcon
      case 'completed': return CheckCircleIcon
      case 'error': return ExclamationCircleIcon
      default: return ClockIcon
    }
  }

  const getOverallProgress = () => {
    if (files.length === 0) return 0
    const totalProgress = files.reduce((sum, file) => sum + file.progress, 0)
    return Math.round(totalProgress / files.length)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upload Progress</h3>
        <div className="text-sm text-gray-500">
          {files.length} files • {getOverallProgress()}% complete
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm text-gray-500">{getOverallProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getOverallProgress()}%` }}
          />
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = files.some(f => f.status === step.key)
            const isCompleted = files.every(f => 
              f.status === 'completed' || 
              (f.status === 'error' && STATUS_STEPS.findIndex(s => s.key === f.status) < index)
            )
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors
                  ${isActive ? 'bg-blue-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-600">{step.label}</span>
                {index < STATUS_STEPS.length - 1 && (
                  <div className="absolute h-px bg-gray-300 w-16 mt-5 ml-16 hidden sm:block" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Individual File Progress */}
      <div className="space-y-3">
        {files.map((file) => {
          const StatusIcon = getStatusIcon(file.status)
          
          return (
            <div key={file.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusColor(file.status)}`}>
                    <StatusIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{file.name}</div>
                    <div className="text-sm text-gray-500">{file.platform}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {file.status === 'completed' ? '✓ Complete' : 
                     file.status === 'error' ? '✗ Error' :
                     file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                  </div>
                  {file.rowCount && (
                    <div className="text-xs text-gray-500">{file.rowCount.toLocaleString()} rows</div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              {file.status !== 'pending' && file.status !== 'completed' && file.status !== 'error' && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {file.status === 'error' && file.errorMessage && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {file.errorMessage}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Status */}
      {overallStatus === 'completed' && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800 font-medium">
              All files validated successfully! 
              {files.reduce((sum, f) => sum + (f.rowCount || 0), 0).toLocaleString()} total rows ready for upload.
            </span>
          </div>
        </div>
      )}

      {overallStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">
              Some files failed to process. Please check the errors above and try again.
            </span>
          </div>
        </div>
      )}
    </div>
  )
}