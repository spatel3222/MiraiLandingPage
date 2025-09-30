import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Clock, Download, Info } from 'lucide-react';
import { LogicTemplateManager } from '../services/logicTemplateManager';

interface UploadedFile {
  shopify: File | null;
  meta: File | null;
  google: File | null;
}

interface UploadStatus {
  shopify: 'pending' | 'uploaded' | 'processing' | 'processed';
  meta: 'pending' | 'uploaded' | 'processing' | 'processed';
  google: 'pending' | 'uploaded' | 'processing' | 'processed';
}

interface Props {
  onClose: () => void;
  onGenerateReport: (files: UploadedFile, useConfigurableLogic?: boolean) => void;
  isProcessing: boolean;
}

const MultiFileUploadModal: React.FC<Props> = ({ onClose, onGenerateReport, isProcessing }) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile>({
    shopify: null,
    meta: null,
    google: null
  });
  
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({
    shopify: 'pending',
    meta: 'pending',
    google: 'pending'
  });

  const [dragActive, setDragActive] = useState<keyof UploadedFile | null>(null);
  const [error, setError] = useState<string>('');
  const [showInfoTooltip, setShowInfoTooltip] = useState<boolean>(false);
  // Auto-detect if custom template exists and get config for last updated info
  const hasCustomTemplate = LogicTemplateManager.hasCustomTemplate();
  const currentConfig = LogicTemplateManager.getCurrentConfiguration();
  
  const shopifyRef = useRef<HTMLInputElement>(null);
  const metaRef = useRef<HTMLInputElement>(null);
  const googleRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent, fileType: keyof UploadedFile) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(fileType);
    } else if (e.type === 'dragleave') {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, fileType: keyof UploadedFile) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], fileType);
    }
  };

  const handleFileSelect = (file: File, fileType: keyof UploadedFile) => {
    setError('');
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file.');
      return;
    }
    
    // Validate file size (max 200MB)
    if (file.size > 200 * 1024 * 1024) {
      setError('File size must be less than 200MB.');
      return;
    }
    
    setUploadedFiles(prev => ({ ...prev, [fileType]: file }));
    setUploadStatus(prev => ({ ...prev, [fileType]: 'uploaded' }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFile) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0], fileType);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
      case 'processed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Upload className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded':
        return 'border-green-500 bg-green-50';
      case 'processing':
        return 'border-yellow-500 bg-yellow-50';
      case 'processed':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const canGenerateReport = uploadedFiles.shopify !== null; // Required: Shopify, Optional: Meta & Google

  const handleGenerateReport = () => {
    if (!canGenerateReport) {
      setError('Please upload at least the Shopify export file to generate reports.');
      return;
    }
    
    // Update status to processing
    setUploadStatus(prev => ({
      shopify: uploadedFiles.shopify ? 'processing' : prev.shopify,
      meta: uploadedFiles.meta ? 'processing' : prev.meta,
      google: uploadedFiles.google ? 'processing' : prev.google,
    }));
    
    onGenerateReport(uploadedFiles, hasCustomTemplate);
  };

  const fileTypes: Array<{
    key: keyof UploadedFile;
    label: string;
    description: string;
    required: boolean;
    ref: React.RefObject<HTMLInputElement>;
  }> = [
    { key: 'shopify', label: 'Shopify Export', description: 'Customer & session data', required: true, ref: shopifyRef },
    { key: 'meta', label: 'Meta Ads', description: 'Campaign performance', required: false, ref: metaRef },
    { key: 'google', label: 'Google Ads', description: 'Campaign metrics', required: false, ref: googleRef },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-moi-light">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
                Upload Data Files for Report Generation
              </h2>
              <button
                onClick={() => setShowInfoTooltip(!showInfoTooltip)}
                className="p-1 text-moi-grey hover:text-moi-charcoal transition-colors"
                title="Report Generation Information"
              >
                <Info className="w-5 h-5" />
              </button>
            </div>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Upload your data files sequentially to generate comprehensive reports
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        {/* File Upload Areas */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fileTypes.map(({ key, label, description, required, ref }) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-benton text-sm font-medium text-moi-charcoal">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  {uploadStatus[key] !== 'pending' && (
                    <button
                      onClick={() => {
                        setUploadedFiles(prev => ({ ...prev, [key]: null }));
                        setUploadStatus(prev => ({ ...prev, [key]: 'pending' }));
                      }}
                      className="text-xs text-moi-grey hover:text-moi-charcoal"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                    dragActive === key 
                      ? 'border-moi-red bg-red-50' 
                      : getStatusColor(uploadStatus[key])
                  }`}
                  onDragEnter={(e) => handleDrag(e, key)}
                  onDragLeave={(e) => handleDrag(e, key)}
                  onDragOver={(e) => handleDrag(e, key)}
                  onDrop={(e) => handleDrop(e, key)}
                >
                  {uploadedFiles[key] ? (
                    <div className="space-y-1">
                      <FileText className="w-8 h-8 text-moi-charcoal mx-auto" />
                      <p className="font-benton text-xs font-medium text-moi-charcoal truncate">
                        {uploadedFiles[key].name}
                      </p>
                      <p className="font-benton text-xs text-moi-grey">
                        {formatFileSize(uploadedFiles[key].size)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-8 h-8 text-moi-grey mx-auto" />
                      <p className="font-benton text-xs text-moi-charcoal">
                        Drop file or{' '}
                        <button
                          onClick={() => ref.current?.click()}
                          disabled={isProcessing}
                          className="text-moi-red hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          browse
                        </button>
                      </p>
                      <p className="font-benton text-xs text-moi-grey">
                        {description}
                      </p>
                    </div>
                  )}
                </div>
                
                <input
                  ref={ref}
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleFileInputChange(e, key)}
                  className="hidden"
                  disabled={isProcessing}
                />
              </div>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="font-benton text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Report Generation Info Tooltip */}
          {showInfoTooltip && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg relative">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-benton font-medium text-blue-900">Report Generation Info</h4>
                <button
                  onClick={() => setShowInfoTooltip(false)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="font-benton text-sm text-blue-800 space-y-1">
                <li>• Shopify Export is required for basic metrics</li>
                <li>• Meta Ads and Google Ads files enhance campaign analysis</li>
                <li>• Reports will include: Top Level Metrics & Adset Level Matrices</li>
                <li>• Processing typically takes 5-10 seconds</li>
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-moi-light bg-gray-50">
          <div className="font-benton text-sm text-moi-grey">
            {canGenerateReport ? (
              <span className="text-green-600 font-medium">
                Ready to generate reports
              </span>
            ) : (
              <span>Upload required files to continue</span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {/* Logic Type Indicator */}
            <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border">
              <div className={`w-3 h-3 rounded-full ${
                hasCustomTemplate ? 'bg-green-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex flex-col">
                <span className="font-benton text-sm font-medium text-moi-charcoal">
                  {hasCustomTemplate ? 'Custom Logic Template' : 'Default Standard Logic'}
                </span>
                <span className="font-benton text-xs text-moi-grey">
                  {hasCustomTemplate 
                    ? `Using your custom business rules • Last updated: ${currentConfig.lastModified.toLocaleDateString()} at ${currentConfig.lastModified.toLocaleTimeString()}`
                    : 'Using built-in standard calculations'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="px-6 py-2 font-benton text-moi-grey hover:text-moi-charcoal transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateReport}
                disabled={!canGenerateReport || isProcessing}
                className={`px-6 py-2 rounded-lg font-benton flex items-center space-x-2 transition-all ${
                  canGenerateReport && !isProcessing
                    ? 'bg-moi-charcoal text-white hover:bg-moi-grey' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>
                  {isProcessing ? 'Generating Reports...' : 'Generate Reports'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiFileUploadModal;