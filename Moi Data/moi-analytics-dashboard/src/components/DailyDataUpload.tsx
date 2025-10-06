import React, { useState } from 'react';
import { Upload, Calendar, Trash2, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  storeDailyDataFromInputFiles, 
  getCumulativeDataInfo, 
  clearAllCumulativeData 
} from '../utils/fileLoader';

interface Props {
  onDataUpdate: () => void; // Callback to refresh dashboard
}

const DailyDataUpload: React.FC<Props> = ({ onDataUpdate }) => {
  const [metaFile, setMetaFile] = useState<File | null>(null);
  const [googleFile, setGoogleFile] = useState<File | null>(null);
  const [shopifyFile, setShopifyFile] = useState<File | null>(null);
  const [uploadDate, setUploadDate] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ 
    type: 'success' | 'error' | null; 
    message: string; 
  }>({ type: null, message: '' });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const cumulativeInfo = getCumulativeDataInfo();

  const handleFileUpload = async () => {
    if (!metaFile && !googleFile && !shopifyFile) {
      setUploadStatus({ 
        type: 'error', 
        message: 'Please select at least one input file to upload' 
      });
      return;
    }

    setIsUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      const result = await storeDailyDataFromInputFiles(
        metaFile,
        googleFile,
        shopifyFile,
        uploadDate || undefined
      );

      if (result.success) {
        setUploadStatus({ 
          type: 'success', 
          message: `${result.message}. Dashboard will update with cumulative data.` 
        });
        
        // Clear form
        setMetaFile(null);
        setGoogleFile(null);
        setShopifyFile(null);
        setUploadDate('');
        
        // Refresh dashboard
        onDataUpdate();
      } else {
        setUploadStatus({ 
          type: 'error', 
          message: result.message 
        });
      }
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearData = () => {
    clearAllCumulativeData();
    setShowClearConfirm(false);
    setUploadStatus({ 
      type: 'success', 
      message: 'All cumulative data cleared. Upload new files to start fresh.' 
    });
    onDataUpdate();
  };

  const formatFileSize = (bytes: number) => {
    return bytes > 1024 ? `${Math.round(bytes / 1024)} KB` : `${bytes} bytes`;
  };

  return (
    <div className="bg-white rounded-lg border border-moi-light p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal">
            Daily Data Upload
          </h2>
          <p className="font-benton text-sm text-moi-grey mt-1">
            Upload daily files - Dashboard shows cumulative data across all uploaded dates
          </p>
        </div>
        <div className="flex items-center space-x-1 text-moi-grey">
          <Database className="w-5 h-5" />
          <span className="font-benton text-sm">Cumulative Storage</span>
        </div>
      </div>

      {/* Cumulative Data Summary */}
      {cumulativeInfo.totalDays > 0 && (
        <div className="mb-6 p-4 bg-moi-beige rounded-lg">
          <h3 className="font-benton text-lg font-semibold text-moi-charcoal mb-2">
            Current Data Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-benton text-moi-grey">Total Days:</span>
              <div className="font-benton font-bold text-moi-charcoal">{cumulativeInfo.totalDays}</div>
            </div>
            <div>
              <span className="font-benton text-moi-grey">Date Range:</span>
              <div className="font-benton font-bold text-moi-charcoal">
                {cumulativeInfo.dateRange ? 
                  `${cumulativeInfo.dateRange.start} to ${cumulativeInfo.dateRange.end}` : 
                  'N/A'
                }
              </div>
            </div>
            <div>
              <span className="font-benton text-moi-grey">Campaigns:</span>
              <div className="font-benton font-bold text-moi-charcoal">{cumulativeInfo.campaigns.length}</div>
            </div>
            <div>
              <span className="font-benton text-moi-grey">Storage Size:</span>
              <div className="font-benton font-bold text-moi-charcoal">{cumulativeInfo.totalSize}</div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Form */}
      <div className="space-y-4">
        {/* Date Input */}
        <div>
          <label className="block font-benton text-sm font-medium text-moi-grey mb-2">
            Date for this data (optional - will auto-detect if not specified)
          </label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-moi-red" />
            <input
              type="date"
              value={uploadDate}
              onChange={(e) => setUploadDate(e.target.value)}
              className="flex-1 p-2 border border-moi-light rounded-lg font-benton"
              placeholder="YYYY-MM-DD"
            />
          </div>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meta Ads File */}
          <div>
            <label className="block font-benton text-sm font-medium text-moi-grey mb-2">
              Meta Ads CSV
            </label>
            <div className="border-2 border-dashed border-moi-light rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-moi-red mx-auto mb-2" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setMetaFile(e.target.files?.[0] || null)}
                className="hidden"
                id="metaFile"
              />
              <label 
                htmlFor="metaFile" 
                className="cursor-pointer font-benton text-sm text-moi-charcoal hover:text-moi-red"
              >
                {metaFile ? (
                  <div>
                    <div className="font-bold">{metaFile.name}</div>
                    <div className="text-moi-grey">{formatFileSize(metaFile.size)}</div>
                  </div>
                ) : (
                  'Click to select Meta CSV'
                )}
              </label>
            </div>
          </div>

          {/* Google Ads File */}
          <div>
            <label className="block font-benton text-sm font-medium text-moi-grey mb-2">
              Google Ads CSV
            </label>
            <div className="border-2 border-dashed border-moi-light rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-moi-red mx-auto mb-2" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setGoogleFile(e.target.files?.[0] || null)}
                className="hidden"
                id="googleFile"
              />
              <label 
                htmlFor="googleFile" 
                className="cursor-pointer font-benton text-sm text-moi-charcoal hover:text-moi-red"
              >
                {googleFile ? (
                  <div>
                    <div className="font-bold">{googleFile.name}</div>
                    <div className="text-moi-grey">{formatFileSize(googleFile.size)}</div>
                  </div>
                ) : (
                  'Click to select Google CSV'
                )}
              </label>
            </div>
          </div>

          {/* Shopify File */}
          <div>
            <label className="block font-benton text-sm font-medium text-moi-grey mb-2">
              Shopify CSV
            </label>
            <div className="border-2 border-dashed border-moi-light rounded-lg p-4 text-center">
              <Upload className="w-8 h-8 text-moi-red mx-auto mb-2" />
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setShopifyFile(e.target.files?.[0] || null)}
                className="hidden"
                id="shopifyFile"
              />
              <label 
                htmlFor="shopifyFile" 
                className="cursor-pointer font-benton text-sm text-moi-charcoal hover:text-moi-red"
              >
                {shopifyFile ? (
                  <div>
                    <div className="font-bold">{shopifyFile.name}</div>
                    <div className="text-moi-grey">{formatFileSize(shopifyFile.size)}</div>
                  </div>
                ) : (
                  'Click to select Shopify CSV'
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Upload Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleFileUpload}
            disabled={isUploading || (!metaFile && !googleFile && !shopifyFile)}
            className="flex items-center space-x-2 px-6 py-3 bg-moi-red text-white rounded-lg font-benton font-medium hover:bg-red-700 disabled:bg-moi-grey disabled:cursor-not-allowed transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>{isUploading ? 'Uploading...' : 'Upload Daily Data'}</span>
          </button>

          {/* Clear Data Button */}
          {cumulativeInfo.totalDays > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-red-500 text-red-600 rounded-lg font-benton hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus.type && (
          <div className={`flex items-center space-x-2 p-3 rounded-lg ${
            uploadStatus.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-benton text-sm">{uploadStatus.message}</span>
          </div>
        )}
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="font-orpheus text-xl font-bold text-moi-charcoal mb-4">
              Clear All Cumulative Data?
            </h3>
            <p className="font-benton text-moi-grey mb-6">
              This will permanently delete all {cumulativeInfo.totalDays} days of stored data. 
              You'll need to re-upload files to see dashboard data again.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-moi-light text-moi-charcoal rounded-lg font-benton hover:bg-moi-beige"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-benton hover:bg-red-700"
              >
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyDataUpload;