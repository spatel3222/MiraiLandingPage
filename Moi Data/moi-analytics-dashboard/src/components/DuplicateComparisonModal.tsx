import React, { useState } from 'react';
import { X, AlertTriangle, Calendar, TrendingUp, DollarSign } from 'lucide-react';

export interface DuplicateData {
  id: string;
  source_type: 'meta' | 'google' | 'shopify';
  date_reported: string;
  campaign_name: string;
  ad_set_name: string | null;
  impressions: number | null;
  amount_spent: number | null;
  link_clicks: number | null;
  cost: number | null;
  clicks: number | null;
  conversions: number | null;
  sessions: number | null;
  purchases: number | null;
  total_sales: number | null;
  imported_at: string;
  import_session_id: string | null;
}

export interface DuplicateGroup {
  key: string; // campaign_name + date_reported + source_type
  campaign_name: string;
  date_reported: string;
  source_type: 'meta' | 'google' | 'shopify';
  existing: DuplicateData;
  new: DuplicateData;
}

interface DuplicateComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  duplicates: DuplicateGroup[];
  onResolve: (resolutions: Record<string, 'keep_existing' | 'replace_with_new' | 'skip'>) => void;
  isResolving: boolean;
}

const DuplicateComparisonModal: React.FC<DuplicateComparisonModalProps> = ({
  isOpen,
  onClose,
  duplicates,
  onResolve,
  isResolving
}) => {
  const [resolutions, setResolutions] = useState<Record<string, 'keep_existing' | 'replace_with_new' | 'skip'>>({});
  const [applyToAll, setApplyToAll] = useState<'keep_existing' | 'replace_with_new' | 'skip' | ''>('');

  if (!isOpen) return null;

  const handleResolutionChange = (duplicateKey: string, resolution: 'keep_existing' | 'replace_with_new' | 'skip') => {
    setResolutions(prev => ({
      ...prev,
      [duplicateKey]: resolution
    }));
  };

  const handleApplyToAll = () => {
    if (!applyToAll) return;
    const newResolutions: Record<string, 'keep_existing' | 'replace_with_new' | 'skip'> = {};
    duplicates.forEach(dup => {
      newResolutions[dup.key] = applyToAll;
    });
    setResolutions(newResolutions);
  };

  const handleResolveAll = () => {
    // Fill in any missing resolutions with 'keep_existing' as default
    const finalResolutions = { ...resolutions };
    duplicates.forEach(dup => {
      if (!finalResolutions[dup.key]) {
        finalResolutions[dup.key] = 'keep_existing';
      }
    });
    onResolve(finalResolutions);
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'meta': return '📘';
      case 'google': return '🔍';
      case 'shopify': return '🛍️';
      default: return '📊';
    }
  };

  const formatCurrency = (value: number | null | undefined) => 
    (value !== null && value !== undefined) ? `$${value.toLocaleString()}` : 'N/A';

  const formatNumber = (value: number | null | undefined) => 
    (value !== null && value !== undefined) ? value.toLocaleString() : 'N/A';

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Duplicate Data Detected</h2>
              <p className="text-sm text-gray-600">
                Found {duplicates.length} duplicate{duplicates.length !== 1 ? 's' : ''} that need resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Apply to All Section */}
        {duplicates.length > 1 && (
          <div className="px-6 pt-4 pb-2 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Apply to all duplicates:</label>
              <select
                value={applyToAll}
                onChange={(e) => setApplyToAll(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select action...</option>
                <option value="keep_existing">Keep all existing</option>
                <option value="replace_with_new">Replace all with new</option>
                <option value="skip">Skip all</option>
              </select>
              <button
                onClick={handleApplyToAll}
                disabled={!applyToAll}
                className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {duplicates.map((duplicate, index) => (
            <div key={duplicate.key} className="border border-gray-200 rounded-lg p-4">
              {/* Duplicate Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getSourceIcon(duplicate.source_type)}</span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {duplicate.campaign_name}
                  </h3>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded uppercase">
                    {duplicate.source_type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{formatDate(duplicate.date_reported)}</span>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Existing Data */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-900">Existing Data</h4>
                    <span className="text-xs text-blue-600">
                      Imported: {formatDate(duplicate.existing.imported_at)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <span className="font-medium">{formatNumber(duplicate.existing.impressions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Spent:</span>
                      <span className="font-medium">{formatCurrency(duplicate.existing.amount_spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clicks:</span>
                      <span className="font-medium">{formatNumber(duplicate.existing.link_clicks || duplicate.existing.clicks)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions:</span>
                      <span className="font-medium">{formatNumber(duplicate.existing.conversions || duplicate.existing.purchases)}</span>
                    </div>
                    {duplicate.existing.total_sales && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{formatCurrency(duplicate.existing.total_sales)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Data */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-900">New Data</h4>
                    <span className="text-xs text-green-600">
                      Importing now
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Impressions:</span>
                      <span className="font-medium">{formatNumber(duplicate.new.impressions)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Spent:</span>
                      <span className="font-medium">{formatCurrency(duplicate.new.amount_spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clicks:</span>
                      <span className="font-medium">{formatNumber(duplicate.new.link_clicks || duplicate.new.clicks)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversions:</span>
                      <span className="font-medium">{formatNumber(duplicate.new.conversions || duplicate.new.purchases)}</span>
                    </div>
                    {duplicate.new.total_sales && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Sales:</span>
                        <span className="font-medium">{formatCurrency(duplicate.new.total_sales)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolution Options */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">How should this duplicate be handled?</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`resolution-${duplicate.key}`}
                      value="keep_existing"
                      checked={resolutions[duplicate.key] === 'keep_existing'}
                      onChange={() => handleResolutionChange(duplicate.key, 'keep_existing')}
                      className="text-blue-600"
                    />
                    <span className="text-sm">Keep existing</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`resolution-${duplicate.key}`}
                      value="replace_with_new"
                      checked={resolutions[duplicate.key] === 'replace_with_new'}
                      onChange={() => handleResolutionChange(duplicate.key, 'replace_with_new')}
                      className="text-green-600"
                    />
                    <span className="text-sm">Replace with new</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`resolution-${duplicate.key}`}
                      value="skip"
                      checked={resolutions[duplicate.key] === 'skip'}
                      onChange={() => handleResolutionChange(duplicate.key, 'skip')}
                      className="text-gray-600"
                    />
                    <span className="text-sm">Skip this row</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {Object.keys(resolutions).length} of {duplicates.length} duplicates resolved
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isResolving}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel Import
            </button>
            <button
              onClick={handleResolveAll}
              disabled={isResolving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isResolving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resolving...
                </>
              ) : (
                'Continue Import'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateComparisonModal;