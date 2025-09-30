import React from 'react';
import { CheckCircle, AlertTriangle, Clock, Settings } from 'lucide-react';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
}

interface ProcessingProgressProps {
  steps: ProcessingStep[];
  currentStep?: string;
  onCancel?: () => void;
}

const ProcessingProgress: React.FC<ProcessingProgressProps> = ({ 
  steps, 
  currentStep, 
  onCancel 
}) => {
  
  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return (
          <div className="w-5 h-5 border-2 border-moi-red border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepStyle = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'processing':
        return 'border-moi-red bg-red-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTextStyle = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700';
      case 'processing':
        return 'text-moi-red font-medium';
      case 'error':
        return 'text-red-700';
      default:
        return 'text-gray-600';
    }
  };

  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="bg-white border border-moi-light rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Settings className="w-6 h-6 text-moi-charcoal" />
          <div>
            <h3 className="font-orpheus text-lg font-bold text-moi-charcoal">
              Processing Configuration
            </h3>
            <p className="font-benton text-sm text-moi-grey">
              Applying your custom logic template
            </p>
          </div>
        </div>
        
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1 text-sm font-benton text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="font-benton text-sm text-moi-grey">
            Progress
          </span>
          <span className="font-benton text-sm text-moi-charcoal font-medium">
            {completedSteps} of {totalSteps} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-moi-red h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`p-3 rounded-lg border transition-all duration-200 ${getStepStyle(step)} ${
              step.id === currentStep ? 'ring-2 ring-moi-red ring-opacity-50' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {getStepIcon(step)}
              <div className="flex-1 min-w-0">
                <p className={`font-benton text-sm ${getTextStyle(step)}`}>
                  {step.label}
                </p>
                {step.message && (
                  <p className="font-benton text-xs text-gray-500 mt-1">
                    {step.message}
                  </p>
                )}
              </div>
              
              {step.status === 'processing' && (
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-moi-red rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 bg-moi-red rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 bg-moi-red rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm font-benton">
          <span className="text-moi-grey">
            Configuration Status:
          </span>
          <span className={`font-medium ${
            steps.some(step => step.status === 'error') ? 'text-red-600' :
            steps.every(step => step.status === 'completed') ? 'text-green-600' :
            'text-moi-red'
          }`}>
            {steps.some(step => step.status === 'error') ? 'Error Occurred' :
             steps.every(step => step.status === 'completed') ? 'Completed Successfully' :
             'Processing...'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProcessingProgress;