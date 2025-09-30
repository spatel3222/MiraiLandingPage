import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import type * as LogicTypes from '../types/logicConfiguration';
type ValidationResult = LogicTypes.ValidationResult;
type ValidationError = LogicTypes.ValidationError;

interface ValidationFeedbackProps {
  validationResult: ValidationResult;
  onClose?: () => void;
  compact?: boolean;
  showDetails?: boolean;
}

const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({ 
  validationResult, 
  onClose, 
  compact = false, 
  showDetails = true 
}) => {
  
  const getIcon = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBgColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (severity: ValidationError['severity']) => {
    switch (severity) {
      case 'error':
        return 'text-red-700';
      case 'warning':
        return 'text-yellow-700';
      case 'info':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const allIssues = [...validationResult.errors, ...validationResult.warnings];
  const hasIssues = allIssues.length > 0;

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-benton ${
        validationResult.isValid 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-red-100 text-red-700 border border-red-200'
      }`}>
        {validationResult.isValid ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <AlertTriangle className="w-4 h-4" />
        )}
        <span>
          {validationResult.isValid ? 'Valid' : `${validationResult.errors.length} Error(s)`}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`p-4 rounded-lg border ${
        validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {validationResult.isValid ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-benton font-semibold ${
              validationResult.isValid ? 'text-green-700' : 'text-red-700'
            }`}>
              {validationResult.isValid ? 'Configuration Valid' : 'Configuration Has Issues'}
            </span>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="mt-2 text-sm font-benton">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-1 font-medium">{validationResult.isValid ? 'Valid' : 'Has Issues'}</span>
            </div>
            {validationResult.errors.length > 0 && (
              <div>
                <span className="text-red-600">Errors:</span>
                <span className="ml-1 font-medium">{validationResult.errors.length}</span>
              </div>
            )}
            {validationResult.warnings.length > 0 && (
              <div>
                <span className="text-yellow-600">Warnings:</span>
                <span className="ml-1 font-medium">{validationResult.warnings.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Issues */}
      {hasIssues && showDetails && (
        <div className="space-y-2">
          <h4 className="font-benton font-medium text-moi-charcoal">
            Validation Details
          </h4>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allIssues.map((issue, index) => (
              <div
                key={index}
                className={`p-3 rounded border ${getBgColor(issue.severity)}`}
              >
                <div className="flex items-start space-x-2">
                  {getIcon(issue.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`font-benton text-sm font-medium ${getTextColor(issue.severity)}`}>
                        {issue.row > 0 ? `Row ${issue.row}` : 'Configuration'}
                      </span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {issue.field}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        issue.severity === 'error' ? 'bg-red-100 text-red-700' :
                        issue.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="font-benton text-sm text-gray-600">
                      {issue.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {hasIssues && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-benton font-medium text-blue-800 mb-2">
            Recommendations
          </h4>
          <ul className="font-benton text-sm text-blue-700 space-y-1">
            {validationResult.errors.length > 0 && (
              <li>• Fix all errors before applying the configuration</li>
            )}
            {validationResult.warnings.length > 0 && (
              <li>• Review warnings to ensure intended behavior</li>
            )}
            <li>• Test the configuration with sample data</li>
            <li>• Keep a backup of your working configuration</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationFeedback;