import { useState } from 'react'
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface AISuggestion {
  id: string
  type: 'date_format' | 'column_mapping' | 'data_cleaning'
  title: string
  description: string
  confidence: number
  example?: {
    before: string
    after: string
  }
  apply_to_column: string
  transformation: string
}

interface AICorrections {
  suggestions: AISuggestion[]
  timestamp: string
  model: string
  error?: string
}

interface AICorrectionsProps {
  platform: string
  corrections: AICorrections
  onApply: (appliedCorrections: AICorrections & { applied: AISuggestion[] }) => void
}

export default function AICorrections({ platform, corrections, onApply }: AICorrectionsProps) {
  const [selectedCorrections, setSelectedCorrections] = useState<Record<string, boolean>>(
    corrections.suggestions.reduce((acc, suggestion) => ({
      ...acc,
      [suggestion.id]: suggestion.confidence > 0.8 // Auto-select high confidence suggestions
    }), {})
  )

  const [isApplying, setIsApplying] = useState(false)

  const handleApplyCorrections = async () => {
    setIsApplying(true)
    
    const appliedCorrections = corrections.suggestions.filter(
      suggestion => selectedCorrections[suggestion.id]
    )
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onApply({
      ...corrections,
      applied: appliedCorrections
    })
    
    setIsApplying(false)
  }

  const toggleAll = (select: boolean) => {
    const newState = corrections.suggestions.reduce((acc, suggestion) => ({
      ...acc,
      [suggestion.id]: select
    }), {})
    setSelectedCorrections(newState)
  }

  const selectedCount = Object.values(selectedCorrections).filter(Boolean).length

  if (corrections.error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
          <h4 className="font-medium text-red-800">AI Correction Error</h4>
        </div>
        <p className="mt-1 text-sm text-red-700">{corrections.error}</p>
      </div>
    )
  }

  if (!corrections.suggestions || corrections.suggestions.length === 0) {
    return (
      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
          <h4 className="font-medium text-green-800">No Corrections Needed</h4>
        </div>
        <p className="mt-1 text-sm text-green-700">
          Your {platform} data looks good! No automatic corrections are suggested.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
          <h4 className="font-medium text-yellow-800">
            AI-Powered Corrections Available ({corrections.suggestions.length})
          </h4>
        </div>
        <div className="text-xs text-yellow-700">
          Model: {corrections.model} • {new Date(corrections.timestamp).toLocaleString()}
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {corrections.suggestions.map(suggestion => (
          <div key={suggestion.id} className="flex items-start space-x-3 bg-white p-3 rounded border">
            <input
              type="checkbox"
              id={suggestion.id}
              checked={selectedCorrections[suggestion.id] || false}
              onChange={(e) => setSelectedCorrections(prev => ({
                ...prev,
                [suggestion.id]: e.target.checked
              }))}
              className="mt-1"
            />
            <label htmlFor={suggestion.id} className="flex-1 text-sm cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="font-medium text-gray-900">{suggestion.title}</div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.type === 'date_format' ? 'bg-blue-100 text-blue-800' :
                    suggestion.type === 'column_mapping' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    suggestion.confidence >= 0.9 ? 'bg-green-100 text-green-800' :
                    suggestion.confidence >= 0.7 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(suggestion.confidence * 100)}% confident
                  </span>
                </div>
              </div>
              
              <div className="text-gray-600 mt-1">{suggestion.description}</div>
              <div className="text-xs text-gray-500 mt-1">
                Column: <span className="font-mono">{suggestion.apply_to_column}</span>
              </div>
              
              {suggestion.example && (
                <div className="mt-2 text-xs bg-gray-50 p-2 rounded border">
                  <strong>Example:</strong>{' '}
                  <span className="text-red-600 line-through">{suggestion.example.before}</span>
                  {' → '}
                  <span className="text-green-600">{suggestion.example.after}</span>
                </div>
              )}
            </label>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => toggleAll(true)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Select All
          </button>
          <button
            onClick={() => toggleAll(false)}
            className="text-xs text-gray-600 hover:text-gray-800"
          >
            Deselect All
          </button>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {selectedCount} of {corrections.suggestions.length} selected
          </span>
          <button
            onClick={handleApplyCorrections}
            disabled={selectedCount === 0 || isApplying}
            className={`px-4 py-2 rounded text-sm font-medium ${
              selectedCount > 0 && !isApplying
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isApplying ? 'Applying...' : `Apply ${selectedCount} Corrections`}
          </button>
        </div>
      </div>
    </div>
  )
}