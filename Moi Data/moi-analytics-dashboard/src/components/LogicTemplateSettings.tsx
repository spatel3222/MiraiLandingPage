import React, { useState, useCallback } from 'react';
import { X, Download, Upload, AlertCircle, CheckCircle, RotateCcw, FileText, Info, Zap, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { LogicTemplateManager } from '../services/logicTemplateManager';
import { LogicTemplateValidator } from '../services/logicTemplateValidator';
import { TemplateExportBridge } from '../utils/templateExportBridge';
import ValidationChatBot from './ValidationChatBot';
import DataInspectorWidget from './DataInspectorWidget';
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

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

  const handleExportForPython = useCallback(async () => {
    try {
      await TemplateExportBridge.exportConfigurationForPython();
      setSuccessMessage('Template exported for Python converter! Check downloads folder.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      setUploadError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          <div className="flex items-center space-x-3">
            <div>
              <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
                Logic Template Settings
              </h2>
              <p className="font-benton text-sm text-moi-grey mt-1">
                Download template → Edit locally → Upload changes
              </p>
            </div>
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors rounded-lg hover:bg-gray-100"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
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

          {/* Data Inspector Widget */}
          <DataInspectorWidget />

          {/* Simple Template Management */}
          <div className="space-y-4">
            {/* Main Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Download */}
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center space-x-2 px-6 py-4 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors text-lg font-medium"
              >
                <Download className="w-5 h-5" />
                <span>Download Current Template</span>
              </button>

              {/* Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <div className="flex items-center justify-center space-x-2 px-6 py-4 border-2 border-dashed border-moi-charcoal text-moi-charcoal rounded-lg hover:bg-moi-beige transition-colors text-lg font-medium">
                  <Upload className="w-5 h-5" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Modified Template'}</span>
                </div>
              </div>
            </div>

            {/* Reset Option */}
            <div className="flex justify-center">
              <button
                onClick={handleResetToDefault}
                className="flex items-center space-x-2 px-4 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Default Template</span>
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-2 text-sm text-moi-grey hover:text-moi-charcoal transition-colors"
            >
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              <span>Advanced Options</span>
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={handleDownloadDocumentation}
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm border border-moi-light text-moi-charcoal rounded-lg hover:bg-moi-beige transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Download Examples</span>
                  </button>

                  <button
                    onClick={handleExportForPython}
                    className="flex items-center justify-center space-x-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Export for Python</span>
                  </button>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Python Integration:</strong> Export syncs dashboard templates with Python conversion scripts.
                  </p>
                </div>
              </div>
            )}
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

        {/* Help Modal */}
        {showHelpModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="font-orpheus text-xl font-bold text-moi-charcoal">How to Use Template Settings</h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Simple Steps */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-benton font-semibold text-blue-800 mb-3">4 Simple Steps</h4>
                  <div className="space-y-3 text-sm text-blue-700">
                    <div className="flex space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <div>
                        <p className="font-medium">Download Current Template</p>
                        <p className="text-blue-600">Gets your current template as a CSV file</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <div>
                        <p className="font-medium">Edit Locally</p>
                        <p className="text-blue-600">Open in Excel or text editor to customize fields and formulas</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <div>
                        <p className="font-medium">Upload Modified Template</p>
                        <p className="text-blue-600">Drag & drop or click to upload your changes</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <div>
                        <p className="font-medium">Auto-Applied</p>
                        <p className="text-blue-600">If no errors, your custom template becomes active immediately</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Handling */}
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-benton font-semibold text-amber-800 mb-2">Error Handling</h4>
                  <div className="text-sm text-amber-700 space-y-2">
                    <p>✅ <strong>No Errors:</strong> Template automatically becomes active</p>
                    <p>⚠️ <strong>With Warnings:</strong> Template works but shows optimization suggestions</p>
                    <p>❌ <strong>With Errors:</strong> Shows specific fixes needed before applying</p>
                  </div>
                </div>

                {/* Template Structure */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-benton font-semibold text-gray-800 mb-2">Template Structure</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Fields:</strong> Name of the output field</p>
                    <p><strong>Output File Name:</strong> Which CSV file to include this field</p>
                    <p><strong>Input from:</strong> Data source (Meta Ads, Google Ads, Shopify Export, etc.)</p>
                    <p><strong>Type:</strong> Data type (Date, Text, Number, Calculate)</p>
                    <p><strong>Formula:</strong> How to calculate or extract the value</p>
                  </div>
                </div>

                {/* Advanced Features */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-benton font-semibold text-green-800 mb-2">Advanced Features</h4>
                  <div className="text-sm text-green-700 space-y-2">
                    <p><strong>Reset to Default:</strong> Returns to original 33-field template</p>
                    <p><strong>Download Examples:</strong> Get sample templates with common patterns</p>
                    <p><strong>Python Integration:</strong> Sync templates with backend conversion scripts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogicTemplateSettings;