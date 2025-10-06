import React, { useState, useEffect } from 'react';
import { DataCoverageService, type CoverageAnalysis, type DataCoverageInfo } from '../services/dataCoverageService';

interface DataCoverageDashboardProps {
  selectedDateRange?: { startDate: string; endDate: string } | null;
  onRefresh?: () => void;
}

export const DataCoverageDashboard: React.FC<DataCoverageDashboardProps> = ({
  selectedDateRange,
  onRefresh
}) => {
  const [coverageAnalysis, setCoverageAnalysis] = useState<CoverageAnalysis | null>(null);
  const [dateRangeCoverage, setDateRangeCoverage] = useState<DataCoverageInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load overall coverage analysis
  const loadCoverageAnalysis = async () => {
    setIsLoading(true);
    try {
      const analysis = await DataCoverageService.getDataCoverageAnalysis();
      setCoverageAnalysis(analysis);
    } catch (error) {
      console.error('Error loading coverage analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load date range specific coverage
  const loadDateRangeCoverage = async () => {
    if (!selectedDateRange) return;
    
    try {
      const coverage = await DataCoverageService.getDateRangeCoverage(
        selectedDateRange.startDate,
        selectedDateRange.endDate
      );
      setDateRangeCoverage(coverage);
    } catch (error) {
      console.error('Error loading date range coverage:', error);
    }
  };

  useEffect(() => {
    loadCoverageAnalysis();
  }, []);

  useEffect(() => {
    if (selectedDateRange) {
      loadDateRangeCoverage();
    }
  }, [selectedDateRange]);

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'meta': return 'text-blue-600 bg-blue-100';
      case 'google': return 'text-green-600 bg-green-100';
      case 'shopify': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'meta': return '📘';
      case 'google': return '🔍';
      case 'shopify': return '🛍️';
      default: return '📊';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data coverage...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔍</span>
            <h3 className="text-lg font-medium text-gray-900">Data Coverage Debug</h3>
            {coverageAnalysis && (
              <span className="text-sm text-gray-500">
                ({coverageAnalysis.totalRecords} total records)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                loadCoverageAnalysis();
                if (onRefresh) onRefresh();
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? '➖' : '➕'}
            </button>
          </div>
        </div>
      </div>

      {/* Compact View */}
      <div className="p-4">
        {coverageAnalysis ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Meta Ads */}
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl">📘</div>
              <div>
                <div className="font-medium text-blue-900">Meta Ads</div>
                <div className="text-sm text-blue-700">
                  {coverageAnalysis.sourceBreakdown.meta.records} records
                  <br />
                  {coverageAnalysis.sourceBreakdown.meta.campaigns} campaigns
                </div>
              </div>
            </div>

            {/* Google Ads */}
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="text-2xl">🔍</div>
              <div>
                <div className="font-medium text-green-900">Google Ads</div>
                <div className="text-sm text-green-700">
                  {coverageAnalysis.sourceBreakdown.google.records} records
                  <br />
                  {coverageAnalysis.sourceBreakdown.google.campaigns} campaigns
                </div>
              </div>
            </div>

            {/* Shopify */}
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl">🛍️</div>
              <div>
                <div className="font-medium text-purple-900">Shopify</div>
                <div className="text-sm text-purple-700">
                  {coverageAnalysis.sourceBreakdown.shopify.records} records
                  <br />
                  {coverageAnalysis.sourceBreakdown.shopify.campaigns} campaigns
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            No data available. Import some files to see coverage analysis.
          </div>
        )}

        {/* Date Range Summary */}
        {coverageAnalysis && coverageAnalysis.totalRecords > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-gray-900">Date Coverage: </span>
                <span className="text-gray-700">
                  {coverageAnalysis.dateSpan.earliest} to {coverageAnalysis.dateSpan.latest}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {coverageAnalysis.dateSpan.totalDays} days
                {coverageAnalysis.gaps.length > 0 && (
                  <span className="ml-2 text-yellow-600">
                    ({coverageAnalysis.gaps.length} gaps)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Date Range Coverage */}
        {selectedDateRange && dateRangeCoverage.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="font-medium text-blue-900 mb-2">
              📅 Selected Range: {selectedDateRange.startDate} to {selectedDateRange.endDate}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {dateRangeCoverage.map((coverage) => (
                <div key={coverage.source} className={`px-2 py-1 rounded text-sm ${getSourceColor(coverage.source)}`}>
                  <span className="mr-1">{getSourceIcon(coverage.source)}</span>
                  {coverage.recordCount} records
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expanded View */}
      {isExpanded && coverageAnalysis && (
        <div className="border-t border-gray-200 p-4">
          {/* Daily Coverage Grid */}
          {coverageAnalysis.dailyCoverage.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Daily Coverage</h4>
              <div className="grid grid-cols-7 gap-1 text-xs">
                {coverageAnalysis.dailyCoverage.slice(-21).map((day) => (
                  <div
                    key={day.date}
                    className="aspect-square p-1 border rounded flex flex-col items-center justify-center"
                    title={`${day.date}: ${day.sources.join(', ')} (${day.recordCount} records)`}
                  >
                    <div className="text-[10px] font-mono">{day.date.split('-')[2]}</div>
                    <div className="flex gap-[1px] mt-1">
                      {day.sources.includes('meta') && <div className="w-1 h-1 bg-blue-400 rounded-full"></div>}
                      {day.sources.includes('google') && <div className="w-1 h-1 bg-green-400 rounded-full"></div>}
                      {day.sources.includes('shopify') && <div className="w-1 h-1 bg-purple-400 rounded-full"></div>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Meta</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Google</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Shopify</span>
                </div>
              </div>
            </div>
          )}

          {/* Data Gaps */}
          {coverageAnalysis.gaps.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Data Gaps</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {coverageAnalysis.gaps.slice(0, 10).map((gap, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm bg-yellow-50 p-2 rounded">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="font-mono text-gray-700">{gap.date}</span>
                    <span className="text-gray-600">missing:</span>
                    <div className="flex gap-1">
                      {gap.missingSources.map(source => (
                        <span key={source} className={`px-1 py-0.5 rounded text-xs ${getSourceColor(source)}`}>
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {coverageAnalysis.gaps.length > 10 && (
                  <div className="text-sm text-gray-500 text-center">
                    ... and {coverageAnalysis.gaps.length - 10} more gaps
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Aggregation Button */}
          {selectedDateRange && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={async () => {
                  console.log('🧪 Testing aggregation...');
                  await DataCoverageService.testDateRangeAggregation(
                    selectedDateRange.startDate,
                    selectedDateRange.endDate
                  );
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                🧪 Test Aggregation for Selected Range
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataCoverageDashboard;