import React from 'react'
import { ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { ValidationResult } from '../lib/validators'

interface ValidationDetailsProps {
  validation: ValidationResult
  fileName: string
}

export default function ValidationDetails({ validation, fileName }: ValidationDetailsProps) {
  if (!validation) return null

  const getIssueIcon = (type: 'error' | 'warning' | 'info') => {
    switch (type) {
      case 'error': return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />
      case 'warning': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getIssueTitle = (errorType: string) => {
    const titles: Record<string, string> = {
      'missing_columns': 'Missing Required Columns',
      'column_case_mismatch': 'Column Case Mismatch',
      'column_name_variations': 'Column Name Variations',
      'invalid_date_format': 'Invalid Date Format',
      'invalid_date_values': 'Invalid Date Values',
      'non_numeric_values': 'Non-Numeric Values',
      'unexpected_columns': 'Unexpected Columns',
      'bom_detected': 'BOM Detected',
      'empty_headers': 'Empty Headers',
      'duplicate_headers': 'Duplicate Headers',
      'date_format_inconsistency': 'Date Format Issues'
    }
    return titles[errorType] || errorType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }


  return (
    <div className="mt-4 space-y-3">
      <div className="text-sm font-medium text-gray-900">
        Validation Report for {fileName}
      </div>

      {/* Summary */}
      <div className="flex items-center space-x-4 text-sm">
        <span className={`px-2 py-1 rounded-full ${
          validation.isValid 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {validation.isValid ? '✓ Valid' : '✗ Invalid'}
        </span>
        <span className="text-gray-600">
          {validation.rowCount.toLocaleString()} rows, {validation.columnCount} columns
        </span>
        {validation.dateRange && (
          <span className="text-gray-600">
            {validation.dateRange.start} to {validation.dateRange.end}
          </span>
        )}
      </div>

      {/* Errors */}
      {validation.errors.map((error, index) => (
        <div key={`error-${index}`} className="border border-red-200 rounded-lg p-4 bg-red-50">
          <div className="flex items-start space-x-3">
            {getIssueIcon('error')}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-red-900">
                {getIssueTitle(error.type)}
              </div>
              <div className="text-sm text-red-700 mt-1">
                {error.message}
              </div>
              
              {/* How to Fix Instructions */}
              {error.howToFix && (
                <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                  <div className="text-sm font-medium text-red-900 mb-2">
                    🔧 How to fix:
                  </div>
                  <div className="text-sm text-red-800 mb-2">
                    {error.howToFix}
                  </div>
                  {error.examples && (
                    <div className="text-xs text-red-700">
                      <div className="font-medium mb-1">Steps:</div>
                      <ol className="list-decimal list-inside space-y-1">
                        {error.examples.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {validation.warnings.map((warning, index) => (
        <div key={`warning-${index}`} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
          <div className="flex items-start space-x-3">
            {getIssueIcon('warning')}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-yellow-900">
                {getIssueTitle(warning.type)}
              </div>
              <div className="text-sm text-yellow-700 mt-1">
                {warning.message}
              </div>
              
              {/* How to Fix Instructions for warnings */}
              {warning.howToFix && (
                <div className="mt-3 p-3 bg-yellow-100 rounded border border-yellow-200">
                  <div className="text-sm font-medium text-yellow-900 mb-2">
                    💡 How to fix:
                  </div>
                  <div className="text-sm text-yellow-800 mb-2">
                    {warning.howToFix}
                  </div>
                  {warning.examples && (
                    <div className="text-xs text-yellow-700">
                      <div className="font-medium mb-1">Steps:</div>
                      <ol className="list-decimal list-inside space-y-1">
                        {warning.examples.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Success message */}
      {validation.isValid && validation.errors.length === 0 && (
        <div className="border border-green-200 rounded-lg p-3 bg-green-50">
          <div className="flex items-center space-x-3">
            {getIssueIcon('info')}
            <div className="text-green-800">
              <div className="font-medium">Schema Validation Passed</div>
              <div className="text-sm mt-1">
                All required columns found and data format looks correct. Ready for upload.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}