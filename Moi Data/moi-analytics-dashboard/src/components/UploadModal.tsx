import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';

interface Props {
  onClose: () => void;
  onUpload: (file: File, fileType: 'shopify' | 'meta' | 'google') => void;
  isLoading: boolean;
}

const UploadModal: React.FC<Props> = ({ onClose, onUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'shopify' | 'meta' | 'google'>('shopify');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
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
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    onUpload(selectedFile, fileType);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-moi-light">
          <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
            Upload Data Files
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 text-moi-grey hover:text-moi-charcoal transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* File Type Selection */}
          <div className="mb-6">
            <label className="block font-benton text-sm font-medium text-moi-charcoal mb-3">
              Select Data Source
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setFileType('shopify')}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg transition-all disabled:opacity-50 ${
                  fileType === 'shopify' 
                    ? 'border-moi-red bg-red-50 text-moi-red' 
                    : 'border-moi-light hover:border-moi-grey text-moi-grey'
                }`}
              >
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-benton font-medium">Shopify Export</div>
                  <div className="font-benton text-xs mt-1">Customer & session data</div>
                </div>
              </button>
              
              <button
                onClick={() => setFileType('meta')}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg transition-all disabled:opacity-50 ${
                  fileType === 'meta' 
                    ? 'border-moi-red bg-red-50 text-moi-red' 
                    : 'border-moi-light hover:border-moi-grey text-moi-grey'
                }`}
              >
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-benton font-medium">Meta Ads</div>
                  <div className="font-benton text-xs mt-1">Campaign performance</div>
                </div>
              </button>
              
              <button
                onClick={() => setFileType('google')}
                disabled={isLoading}
                className={`p-4 border-2 rounded-lg transition-all disabled:opacity-50 ${
                  fileType === 'google' 
                    ? 'border-moi-red bg-red-50 text-moi-red' 
                    : 'border-moi-light hover:border-moi-grey text-moi-grey'
                }`}
              >
                <div className="text-center">
                  <FileText className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-benton font-medium">Google Ads</div>
                  <div className="font-benton text-xs mt-1">Campaign metrics</div>
                </div>
              </button>
            </div>
            
            {fileType !== 'shopify' && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="font-benton text-sm text-yellow-800">
                  <strong>Coming Soon:</strong> Meta Ads and Google Ads integration will be available in the next update. 
                  Currently only Shopify Export is supported.
                </div>
              </div>
            )}
          </div>

          {/* File Upload Area */}
          <div className="mb-6">
            <label className="block font-benton text-sm font-medium text-moi-charcoal mb-3">
              Upload CSV File
            </label>
            
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                dragActive 
                  ? 'border-moi-red bg-red-50' 
                  : 'border-moi-light hover:border-moi-grey'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 text-moi-grey mx-auto mb-4" />
              
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="font-benton text-lg font-medium text-moi-charcoal">
                    {selectedFile.name}
                  </p>
                  <p className="font-benton text-sm text-moi-grey">
                    {formatFileSize(selectedFile.size)}
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="font-benton text-sm text-moi-red hover:text-red-700 transition-colors disabled:opacity-50"
                  >
                    Choose different file
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-benton text-lg text-moi-charcoal">
                    Drag and drop your CSV file here
                  </p>
                  <p className="font-benton text-sm text-moi-grey">
                    or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="text-moi-red hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="font-benton text-xs text-moi-grey">
                    Maximum file size: 200MB
                  </p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="font-benton text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Expected Format Info */}
          {fileType === 'shopify' && (
            <div className="mb-6 p-4 bg-moi-beige rounded-lg">
              <h3 className="font-benton font-medium text-moi-charcoal mb-2">
                Expected Shopify Export Format
              </h3>
              <div className="font-benton text-sm text-moi-grey space-y-1">
                <p><strong>Required columns:</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Utm campaign</li>
                  <li>Online store visitors</li>
                  <li>Sessions</li>
                  <li>Sessions with cart additions</li>
                  <li>Sessions that reached checkout</li>
                  <li>Average session duration</li>
                  <li>Pageviews</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-4 p-6 border-t border-moi-light">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2 font-benton text-moi-grey hover:text-moi-charcoal transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading || fileType !== 'shopify'}
            className="px-6 py-2 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-benton"
          >
            {isLoading ? 'Processing...' : 'Upload & Process'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;