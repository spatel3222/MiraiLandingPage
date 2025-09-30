import React, { useState, useCallback } from 'react';
import { X, Download, Upload, AlertCircle, CheckCircle, RotateCcw, FileText, Info } from 'lucide-react';
import { LogicTemplateManager } from '../services/logicTemplateManager';
import { LogicTemplateValidator } from '../services/logicTemplateValidator';
import ValidationChatBot from './ValidationChatBot';
import type * as LogicTypes from '../types/logicConfiguration';

type LogicConfiguration = LogicTypes.LogicConfiguration;
type LogicTemplateRow = LogicTypes.LogicTemplateRow;
type ValidationResult = LogicTypes.ValidationResult;
type ValidationError = LogicTypes.ValidationError;
type ValidationWarning = LogicTypes.ValidationWarning;

interface Props {
  onClose: () => void;
  onConfigurationChange?: (config: LogicConfiguration) => void;
}

const LogicTemplateSettings: React.FC<Props> = ({ onClose, onConfigurationChange }) => {
  const [currentConfig, setCurrentConfig] = useState<LogicConfiguration>(
    LogicTemplateManager.getCurrentConfiguration()
  );
  const [isUploading, setIsUploading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentTemplateRows, setCurrentTemplateRows] = useState<LogicTemplateRow[]>([]);
  const [showChatBot, setShowChatBot] = useState(false);

  const handleDownloadTemplate = useCallback(() => {
    try {
      LogicTemplateManager.downloadTemplate(currentConfig);
      setSuccessMessage('Template downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setUploadError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentConfig]);

  const handleDownloadDocumentation = useCallback(() => {
    try {
      LogicTemplateManager.downloadDocumentationTemplate();
      setSuccessMessage('Documentation template downloaded!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setUploadError(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setValidationResult(null);

    try {
      const templateRows = await LogicTemplateManager.parseUploadedTemplate(file);
      const validation = await LogicTemplateValidator.validateTemplate(templateRows);
      
      setCurrentTemplateRows(templateRows);
      setValidationResult(validation);

      if (validation.isValid) {
        const newConfig = LogicTemplateManager.saveConfiguration(templateRows);
        setCurrentConfig(newConfig);
        onConfigurationChange?.(newConfig);
        setSuccessMessage('Template uploaded and validated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setShowValidationDetails(true);
        // Show chat bot if there are errors or warnings
        if (validation.errors.length > 0 || validation.warnings.length > 0) {
          setShowChatBot(true);
        }
      }
    } catch (error) {
      setUploadError(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  }, [onConfigurationChange]);

  const handleResetToDefault = useCallback(() => {
    if (window.confirm('Are you sure you want to reset to the default configuration? This will remove all custom logic templates.')) {
      try {
        const defaultConfig = LogicTemplateManager.resetToDefault();
        setCurrentConfig(defaultConfig);
        setValidationResult(null);
        onConfigurationChange?.(defaultConfig);
        setSuccessMessage('Reset to default configuration successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        setUploadError(`Reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }, [onConfigurationChange]);

  const handleApplyValidatedTemplate = useCallback(() => {
    if (validationResult && !validationResult.isValid) {
      setUploadError('Cannot apply template with validation errors. Please fix all errors first.');
      return;
    }

    if (validationResult) {
      setSuccessMessage('Template applied successfully with warnings. Check details for optimization suggestions.');
      setValidationResult(null);
      setShowValidationDetails(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [validationResult]);

  const handleChatBotFixApplied = useCallback(async (updatedRows: LogicTemplateRow[]) => {
    // Re-validate the updated template
    try {
      const newValidation = await LogicTemplateValidator.validateTemplate(updatedRows);
      setCurrentTemplateRows(updatedRows);
      setValidationResult(newValidation);
      
      if (newValidation.isValid) {
        // Apply the fixed template
        const newConfig = LogicTemplateManager.saveConfiguration(updatedRows);
        setCurrentConfig(newConfig);
        onConfigurationChange?.(newConfig);
        setSuccessMessage('Template fixed and applied successfully!');
        setShowChatBot(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setUploadError(`Failed to validate updated template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [onConfigurationChange]);

  const getValidationSummary = () => {
    if (!validationResult) return null;

    const { errors, warnings } = validationResult;
    const errorCount = errors.length;
    const warningCount = warnings.length;

    if (errorCount === 0 && warningCount === 0) {
      return (
        <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5" />
          <span>Template is valid and ready to use!</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {errorCount > 0 && (
          <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{errorCount} error{errorCount !== 1 ? 's' : ''} found. Template cannot be applied.</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center space-x-2 text-yellow-700 bg-yellow-50 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            <span>{warningCount} warning{warningCount !== 1 ? 's' : ''} found. Consider reviewing.</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
              Logic Template Settings
            </h2>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Configure custom data transformation logic for report generation
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Messages */}
          {successMessage && (
            <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span>{successMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center space-x-2 text-red-700 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Current Configuration Status */}
          <div className="bg-moi-beige p-4 rounded-lg">
            <h3 className="font-benton font-semibold text-moi-charcoal mb-2">Current Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-moi-grey">Status:</span>
                <span className="ml-2 font-medium">
                  {currentConfig.isActive ? 'Custom Active' : 'Default'}
                </span>
              </div>
              <div>
                <span className="text-moi-grey">Fields:</span>
                <span className="ml-2 font-medium">{currentConfig.templateRows.length}</span>
              </div>
              <div>
                <span className="text-moi-grey">Last Modified:</span>
                <span className="ml-2 font-medium">
                  {currentConfig.lastModified.toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-moi-grey">Version:</span>
                <span className="ml-2 font-medium">{currentConfig.version}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download Section */}
            <div className="space-y-3">
              <h3 className="font-benton font-semibold text-moi-charcoal">Download Templates</h3>
              
              <button
                onClick={handleDownloadTemplate}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Current Template</span>
              </button>

              <button
                onClick={handleDownloadDocumentation}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-moi-light text-moi-charcoal rounded-lg hover:bg-moi-beige transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Download Documentation & Examples</span>
              </button>
            </div>

            {/* Upload Section */}
            <div className="space-y-3">
              <h3 className="font-benton font-semibold text-moi-charcoal">Upload Custom Template</h3>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-moi-light text-moi-charcoal rounded-lg hover:border-moi-charcoal hover:bg-moi-beige transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Modified Template (CSV)'}</span>
                </div>
              </div>

              <button
                onClick={handleResetToDefault}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          {/* Validation Results */}
          {validationResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-benton font-semibold text-moi-charcoal">Validation Results</h3>
                <button
                  onClick={() => setShowValidationDetails(!showValidationDetails)}
                  className="flex items-center space-x-1 text-moi-charcoal hover:text-moi-grey transition-colors"
                >
                  <Info className="w-4 h-4" />
                  <span>{showValidationDetails ? 'Hide' : 'Show'} Details</span>
                </button>
              </div>

              {getValidationSummary()}

              {showValidationDetails && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  {/* Errors */}
                  {validationResult.errors.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Errors (Must Fix)</h4>
                      <div className="space-y-2">
                        {validationResult.errors.map((error, index) => (
                          <div key={index} className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                            <div className="font-medium text-red-800">
                              Row {error.row}: {error.field}
                            </div>
                            <div className="text-red-700">{error.message}</div>
                            <div className="text-red-600 text-xs mt-1">Code: {error.code}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Warnings */}
                  {validationResult.warnings.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-700 mb-2">Warnings (Suggestions)</h4>
                      <div className="space-y-2">
                        {validationResult.warnings.map((warning, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 p-3 rounded text-sm">
                            <div className="font-medium text-yellow-800">
                              Row {warning.row}: {warning.field}
                            </div>
                            <div className="text-yellow-700">{warning.message}</div>
                            {warning.suggestion && (
                              <div className="text-yellow-600 text-xs mt-1">
                                Suggestion: {warning.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Apply Button */}
              {validationResult.isValid && (
                <button
                  onClick={handleApplyValidatedTemplate}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Apply Template Configuration
                </button>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-benton font-semibold text-blue-800 mb-2">How It Works</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. <strong>Download:</strong> Get the current logic template to understand the structure</p>
              <p>2. <strong>Modify:</strong> Edit the CSV file to customize data transformation logic</p>
              <p>3. <strong>Upload:</strong> Upload your modified template for validation</p>
              <p>4. <strong>Apply:</strong> Use the validated template for future report generation</p>
              <p className="mt-3 text-blue-600">
                <strong>Tip:</strong> Download the documentation template for examples and formula patterns.
              </p>
            </div>
          </div>
        </div>

        {/* Validation Chat Bot */}
        {showChatBot && validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <ValidationChatBot
            validationResult={validationResult}
            templateRows={currentTemplateRows}
            onFixApplied={handleChatBotFixApplied}
            onClose={() => setShowChatBot(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LogicTemplateSettings;