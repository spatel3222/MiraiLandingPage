import React, { useState, useCallback } from 'react';
import { FileValidationService, type ValidationResult } from '../services/fileValidationService';
import { DataImportService, type ImportProgress, type ImportResult } from '../services/dataImportService';
import { supabaseConfig } from '../services/supabaseClient';
import DuplicateComparisonModal, { type DuplicateGroup } from './DuplicateComparisonModal';

interface FileUploadInterfaceProps {
  onImportComplete?: (result: ImportResult) => void;
}

export const FileUploadInterface: React.FC<FileUploadInterfaceProps> = ({ onImportComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isResolvingDuplicates, setIsResolvingDuplicates] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  }, []);

  const handleFileSelection = async (file: File) => {
    setSelectedFile(file);
    setValidation(null);
    setImportResult(null);
    
    setIsValidating(true);
    try {
      const validationResult = await FileValidationService.validateFile(file);
      setValidation(validationResult);
    } catch (error) {
      setValidation({
        isValid: false,
        source: 'unknown',
        errors: [{
          type: 'invalid_format',
          message: error instanceof Error ? error.message : 'Validation failed'
        }],
        warnings: [],
        rowCount: 0
      });
    }
    setIsValidating(false);
  };

  const handleStartImport = async () => {
    if (!selectedFile || !validation?.isValid) return;
    
    console.log('🚀 === FILE UPLOAD STARTED ===');
    console.log('📁 File:', selectedFile.name);
    console.log('📏 Size:', selectedFile.size, 'bytes');
    console.log('🏷️ Source:', validation.source);
    console.log('📅 Date range:', validation.dateRange);
    
    // Check if Supabase is configured
    if (!supabaseConfig.isConfigured) {
      console.error('❌ Supabase not configured');
      alert('⚠️ Supabase Configuration Required\n\nPlease configure your Supabase credentials in the .env.local file before importing data.\n\nSee the connection test above for setup instructions.');
      return;
    }
    
    console.log('✅ Supabase configured, starting import...');

    setIsImporting(true);
    setImportProgress(null);
    setImportResult(null);

    try {
      const result = await DataImportService.importFile(selectedFile, (progress) => {
        console.log(`📊 Import progress: ${progress.progress}% - ${progress.currentStep}`);
        setImportProgress(progress);
      });
      
      // Check if duplicates were detected
      const duplicateError = result.errors.find(e => e.type === 'duplicate');
      if (duplicateError && duplicateError.details?.duplicateGroups) {
        setDuplicateGroups(duplicateError.details.duplicateGroups);
        setShowDuplicateModal(true);
        return; // Don't set result yet, wait for user resolution
      }
      
      setImportResult(result);
      onImportComplete?.(result);
    } catch (error) {
      setImportResult({
        success: false,
        sessionId: '',
        importedRows: 0,
        duplicatesDetected: 0,
        errors: [{
          type: 'processing',
          message: error instanceof Error ? error.message : 'Import failed'
        }],
        warnings: []
      });
    }
    
    setIsImporting(false);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setValidation(null);
    setImportProgress(null);
    setImportResult(null);
    setIsImporting(false);
    setIsValidating(false);
    setDuplicateGroups([]);
    setShowDuplicateModal(false);
    setIsResolvingDuplicates(false);
  };

  const handleDuplicateResolution = async (resolutions: Record<string, 'keep_existing' | 'replace_with_new' | 'skip'>) => {
    if (!selectedFile) return;
    
    setIsResolvingDuplicates(true);
    setShowDuplicateModal(false);
    
    try {
      const result = await DataImportService.importFile(
        selectedFile, 
        (progress) => {
          setImportProgress(progress);
        },
        {
          duplicateResolutions: resolutions,
          skipDuplicateCheck: false
        }
      );
      
      setImportResult(result);
      onImportComplete?.(result);
    } catch (error) {
      setImportResult({
        success: false,
        sessionId: '',
        importedRows: 0,
        duplicatesDetected: 0,
        errors: [{
          type: 'processing',
          message: error instanceof Error ? error.message : 'Import failed after resolution'
        }],
        warnings: []
      });
    }
    
    setIsResolvingDuplicates(false);
  };

  const handleDuplicateModalClose = () => {
    setShowDuplicateModal(false);
    setIsImporting(false);
    setImportProgress(null);
  };

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'meta': return 'Meta Ads';
      case 'google': return 'Google Ads';
      case 'shopify': return 'Shopify';
      default: return 'Unknown';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'meta': return 'text-blue-600 bg-blue-50';
      case 'google': return 'text-green-600 bg-green-50';
      case 'shopify': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Import Campaign Data</h2>
      
      {/* File Upload Area */}
      {!selectedFile && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Campaign Data</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your CSV file here, or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports: Meta Ads, Google Ads, Shopify exports (Max 150MB)
          </p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <span>Choose File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* File Selected */}
      {selectedFile && (
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
                📄
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg mb-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="text-blue-700">Validating file...</span>
            </div>
          )}

          {validation && (
            <div className="space-y-3">
              {/* Source Detection */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Detected Source:</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceColor(validation.source)}`}>
                  {getSourceDisplayName(validation.source)}
                </span>
                {validation.rowCount > 0 && (
                  <span className="text-sm text-gray-600">
                    ({validation.rowCount.toLocaleString()} rows)
                  </span>
                )}
              </div>

              {/* Date Range */}
              {validation.dateRange && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">Date Range:</span>
                  <span className="text-gray-600">
                    {validation.dateRange.startDate} to {validation.dateRange.endDate}
                  </span>
                </div>
              )}

              {/* Validation Status */}
              <div className={`p-3 rounded-lg ${validation.isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.isValid ? '✅' : '❌'}
                  </span>
                  <span className={`font-medium ${validation.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {validation.isValid ? 'File is valid and ready to import' : 'File has validation errors'}
                  </span>
                </div>

                {/* Errors */}
                {validation.errors.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-800 text-sm">Errors:</h4>
                    {validation.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        • {error.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {validation.warnings.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <h4 className="font-medium text-yellow-800 text-sm">Warnings:</h4>
                    {validation.warnings.map((warning, index) => (
                      <div key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                        • {warning.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sample Data Preview */}
              {validation.sampleData && validation.sampleData.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-800 mb-2">Data Preview (first 5 rows):</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs border">
                      <thead className="bg-gray-50">
                        <tr>
                          {Object.keys(validation.sampleData[0]).slice(0, 6).map(header => (
                            <th key={header} className="px-2 py-1 border text-left font-medium text-gray-700">
                              {header}
                            </th>
                          ))}
                          {Object.keys(validation.sampleData[0]).length > 6 && (
                            <th className="px-2 py-1 border text-left font-medium text-gray-700">
                              ... +{Object.keys(validation.sampleData[0]).length - 6} more
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {validation.sampleData.map((row, index) => (
                          <tr key={index} className="border-t">
                            {Object.keys(row).slice(0, 6).map(key => (
                              <td key={key} className="px-2 py-1 border text-gray-600">
                                {String(row[key]).length > 20 
                                  ? String(row[key]).substring(0, 20) + '...' 
                                  : String(row[key])
                                }
                              </td>
                            ))}
                            {Object.keys(row).length > 6 && (
                              <td className="px-2 py-1 border text-gray-400">...</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Button */}
              {validation.isValid && !isImporting && !importResult && (
                <div className="pt-3">
                  <button
                    onClick={handleStartImport}
                    disabled={!supabaseConfig.isConfigured}
                    className={`w-full px-4 py-3 rounded-lg font-medium ${
                      supabaseConfig.isConfigured
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                    title={!supabaseConfig.isConfigured ? 'Configure Supabase credentials first' : 'Import Data to Supabase'}
                  >
                    {supabaseConfig.isConfigured ? 'Import Data to Supabase' : 'Configure Supabase First'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Import Progress */}
      {isImporting && importProgress && (
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Import Progress</h3>
            <span className="text-sm text-gray-600">{importProgress.progress.toFixed(0)}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${importProgress.progress}%` }}
            ></div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{importProgress.currentStep}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">
                {importProgress.processedRows.toLocaleString()} / {importProgress.totalRows.toLocaleString()} rows
              </span>
            </div>
            {importProgress.warnings.length > 0 && (
              <div className="text-yellow-600">
                {importProgress.warnings.length} warning(s) detected
              </div>
            )}
          </div>
        </div>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`border rounded-lg p-4 ${importResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-lg ${importResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {importResult.success ? '✅' : '❌'}
            </span>
            <h3 className={`font-medium ${importResult.success ? 'text-green-800' : 'text-red-800'}`}>
              {importResult.success ? 'Import Completed Successfully' : 'Import Failed'}
            </h3>
          </div>

          {importResult.success && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Rows Imported:</span>
                <span className="font-medium text-green-700">{importResult.importedRows.toLocaleString()}</span>
              </div>
              {importResult.duplicatesDetected > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duplicates Skipped:</span>
                  <span className="font-medium text-yellow-600">{importResult.duplicatesDetected.toLocaleString()}</span>
                </div>
              )}
              {importResult.dateRange && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Date Range:</span>
                  <span className="font-medium text-gray-700">
                    {importResult.dateRange.startDate} to {importResult.dateRange.endDate}
                  </span>
                </div>
              )}
            </div>
          )}

          {importResult.errors.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="font-medium text-red-800 text-sm">Errors:</h4>
              {importResult.errors.map((error, index) => (
                <div key={index} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                  • {error.message}
                </div>
              ))}
            </div>
          )}

          {importResult.warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              <h4 className="font-medium text-yellow-800 text-sm">Warnings:</h4>
              {importResult.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                  • {warning.message}
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}


      {/* Duplicate Comparison Modal */}
      <DuplicateComparisonModal
        isOpen={showDuplicateModal}
        onClose={handleDuplicateModalClose}
        duplicates={duplicateGroups}
        onResolve={handleDuplicateResolution}
        isResolving={isResolvingDuplicates}
      />
    </div>
  );
};