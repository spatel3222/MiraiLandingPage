import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Database, FileText, AlertCircle, CheckCircle, XCircle, RefreshCw, CloudDownload } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { loadDashboardDataFromSupabase } from '../services/supabaseDataLoader';

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'skipped';
  timestamp?: string;
  dataCount?: number;
  sample?: any;
  error?: string;
  details?: Record<string, any>;
}

interface DataPipelineDebuggerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DataPipelineDebugger: React.FC<DataPipelineDebuggerProps> = ({ isOpen, onClose }) => {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentData, setCurrentData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      inspectPipeline();
    }
  }, [isOpen]);

  const inspectPipeline = async () => {
    setIsRefreshing(true);
    const pipelineStages: PipelineStage[] = [];

    try {
      // Stage 1: Check localStorage cache
      const cacheStage: PipelineStage = {
        id: 'cache',
        name: '1. Local Storage Cache',
        status: 'pending',
        details: {}
      };

      // Check multiple cache locations
      const cachedData = localStorage.getItem('moi-dashboard-data') || localStorage.getItem('dashboardData');
      if (cachedData) {
        const data = JSON.parse(cachedData);
        cacheStage.status = 'success';
        cacheStage.timestamp = new Date(data.timestamp || data.lastUpdated || Date.now()).toISOString();
        cacheStage.dataCount = data.campaigns?.length || 0;
        cacheStage.details = {
          'Campaigns': data.campaigns?.length || 0,
          'Date Range': `${data.dateRange?.startDate} to ${data.dateRange?.endDate}`,
          'Cache Size': (cachedData.length / 1024).toFixed(2) + ' KB'
        };
        cacheStage.sample = data.campaigns?.[0];
      } else {
        cacheStage.status = 'skipped';
        cacheStage.details = { 'Status': 'No cached data found' };
      }
      pipelineStages.push(cacheStage);

      // Stage 2: Supabase Raw Data
      const supabaseStage: PipelineStage = {
        id: 'supabase',
        name: '2. Supabase Raw Data Tables',
        status: 'pending',
        details: {}
      };

      try {
        const [metaCount, googleCount, shopifyCount] = await Promise.all([
          supabase.from('raw_data_meta').select('*', { count: 'exact', head: true }),
          supabase.from('raw_data_google').select('*', { count: 'exact', head: true }),
          supabase.from('raw_data_shopify').select('*', { count: 'exact', head: true })
        ]);

        supabaseStage.status = 'success';
        supabaseStage.dataCount = (metaCount.count || 0) + (googleCount.count || 0) + (shopifyCount.count || 0);
        supabaseStage.details = {
          'Meta/Facebook Rows': metaCount.count || 0,
          'Google Ads Rows': googleCount.count || 0,
          'Shopify Rows': shopifyCount.count || 0,
          'Total Rows': supabaseStage.dataCount
        };

        // Get sample data
        const { data: metaSample } = await supabase.from('raw_data_meta').select('*').limit(1);
        if (metaSample?.[0]) {
          supabaseStage.sample = metaSample[0];
        }
      } catch (error: any) {
        supabaseStage.status = 'error';
        supabaseStage.error = error.message;
        supabaseStage.details = { 'Error': error.message };
      }
      pipelineStages.push(supabaseStage);

      // Stage 3: Data Transformation
      const transformStage: PipelineStage = {
        id: 'transform',
        name: '3. Data Transformation Pipeline',
        status: 'pending',
        details: {}
      };

      // Check if transformation is happening
      const transformedDataKey = 'moi_processed_data';
      const transformedData = localStorage.getItem(transformedDataKey);
      
      if (transformedData) {
        try {
          const parsed = JSON.parse(transformedData);
          transformStage.status = 'success';
          transformStage.details = {
            'Daily Metrics': parsed.dailyMetrics?.length || 0,
            'Ad Set Data': parsed.adsetData?.length || 0,
            'Integrated Data': parsed.integratedData ? 'Yes' : 'No'
          };
          transformStage.sample = parsed.dailyMetrics?.[0];
        } catch {
          transformStage.status = 'error';
          transformStage.error = 'Failed to parse transformed data';
        }
      } else {
        transformStage.status = 'skipped';
        transformStage.details = { 'Status': 'No transformed data in cache' };
      }
      pipelineStages.push(transformStage);

      // Stage 4: Integration Processing
      const integrationStage: PipelineStage = {
        id: 'integration',
        name: '4. Data Integration & Deduplication',
        status: 'pending',
        details: {}
      };

      // Check for duplicates in database
      try {
        const { data: metaData } = await supabase
          .from('raw_data_meta')
          .select('campaign_name, date_reported')
          .limit(1000);

        if (metaData) {
          const uniqueKeys = new Set();
          let duplicateCount = 0;
          
          metaData.forEach(row => {
            const key = `${row.campaign_name}_${row.date_reported}`;
            if (uniqueKeys.has(key)) {
              duplicateCount++;
            } else {
              uniqueKeys.add(key);
            }
          });

          integrationStage.status = 'success';
          integrationStage.details = {
            'Unique Campaign-Date Pairs': uniqueKeys.size,
            'Duplicate Records Found': duplicateCount,
            'Deduplication': duplicateCount > 0 ? 'Required' : 'Clean'
          };
        }
      } catch (error: any) {
        integrationStage.status = 'error';
        integrationStage.error = error.message;
      }
      pipelineStages.push(integrationStage);

      // Stage 5: Output Generation
      const outputStage: PipelineStage = {
        id: 'output',
        name: '5. Dashboard Output Generation',
        status: 'pending',
        details: {}
      };

      const dashboardData = localStorage.getItem('moi-dashboard-data') || localStorage.getItem('dashboardData');
      if (dashboardData) {
        const data = JSON.parse(dashboardData);
        outputStage.status = 'success';
        outputStage.details = {
          'Campaigns': data.campaigns?.length || 0,
          'Key Metrics': Object.keys(data.keyMetrics || {}).length,
          'Statistics': Object.keys(data.statistics || {}).length,
          'Last Updated': new Date(data.lastUpdated || Date.now()).toLocaleString()
        };
        outputStage.sample = data.keyMetrics;
      } else {
        outputStage.status = 'skipped';
        outputStage.details = { 'Status': 'No output data generated' };
      }
      pipelineStages.push(outputStage);

      // Stage 6: Export Readiness
      const exportStage: PipelineStage = {
        id: 'export',
        name: '6. Export File Generation',
        status: 'pending',
        details: {}
      };

      if (dashboardData) {
        const data = JSON.parse(dashboardData);
        exportStage.status = data.campaigns?.length > 0 ? 'success' : 'skipped';
        exportStage.details = {
          'Top Level CSV Ready': data.campaigns?.length > 0 ? 'Yes' : 'No',
          'Ad Set CSV Ready': data.adsetLevelData?.length > 0 ? 'Yes' : 'No',
          'Total Exportable Rows': (data.campaigns?.length || 0) + (data.adsetLevelData?.length || 0)
        };
      } else {
        exportStage.status = 'skipped';
        exportStage.details = { 'Status': 'No data to export' };
      }
      pipelineStages.push(exportStage);

      setStages(pipelineStages);
      setCurrentData(dashboardData ? JSON.parse(dashboardData) : null);
      
    } catch (error) {
      console.error('Pipeline inspection error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const getStatusIcon = (status: PipelineStage['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-300" />;
    }
  };

  const getStatusColor = (status: PipelineStage['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'skipped':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const clearAllCaches = async () => {
    if (confirm('This will clear all cached data. Continue?')) {
      localStorage.removeItem('dashboardData');
      localStorage.removeItem('moi-dashboard-data');
      localStorage.removeItem('moi-dashboard-timestamp');
      localStorage.removeItem('moi_processed_data');
      localStorage.removeItem('uploadedFiles');
      localStorage.removeItem('moi-output-data');
      await inspectPipeline();
      alert('All caches cleared successfully');
    }
  };

  const forceLoadFromSupabase = async () => {
    if (confirm('This will bypass cache and load fresh data from Supabase. Continue?')) {
      setIsRefreshing(true);
      try {
        console.log('🔄 Force loading from Supabase...');
        const supabaseData = await loadDashboardDataFromSupabase();
        if (supabaseData) {
          // Save to localStorage to update the dashboard
          localStorage.setItem('moi-dashboard-data', JSON.stringify(supabaseData));
          localStorage.setItem('moi-dashboard-timestamp', new Date().toISOString());
          localStorage.setItem('dashboardData', JSON.stringify({
            ...supabaseData,
            timestamp: Date.now()
          }));
          alert('Successfully loaded fresh data from Supabase! Refresh the page to see updated dashboard.');
          await inspectPipeline();
        } else {
          alert('No data found in Supabase or processing failed.');
        }
      } catch (error: any) {
        console.error('Failed to load from Supabase:', error);
        alert(`Failed to load from Supabase: ${error.message}`);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6" />
            <h2 className="text-xl font-bold">Data Pipeline Debugger</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={forceLoadFromSupabase}
              disabled={isRefreshing}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm flex items-center gap-2"
            >
              <CloudDownload className="w-4 h-4" />
              Force Load from Supabase
            </button>
            <button
              onClick={clearAllCaches}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              Clear All Caches
            </button>
            <button
              onClick={inspectPipeline}
              disabled={isRefreshing}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
          {/* Pipeline Flow Diagram */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-gray-700 mb-3">Pipeline Flow</h3>
            <div className="flex items-center justify-between text-xs">
              <div className="text-center">
                <FileText className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                <p>CSV Import</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className="text-center">
                <Database className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                <p>Supabase</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                <p>Transform</p>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-gray-600 mx-auto mb-1" />
                <p>Dashboard</p>
              </div>
            </div>
          </div>

          {/* Pipeline Stages */}
          <div className="space-y-4">
            {stages.map((stage) => (
              <div
                key={stage.id}
                className={`border rounded-lg overflow-hidden ${getStatusColor(stage.status)}`}
              >
                <div
                  className="p-4 cursor-pointer hover:bg-opacity-70 transition-colors"
                  onClick={() => toggleStage(stage.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedStages.has(stage.id) ? (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                      )}
                      {getStatusIcon(stage.status)}
                      <h3 className="font-semibold text-gray-800">{stage.name}</h3>
                      {stage.dataCount !== undefined && (
                        <span className="px-2 py-1 bg-white rounded text-sm text-gray-600">
                          {stage.dataCount.toLocaleString()} records
                        </span>
                      )}
                    </div>
                    {stage.timestamp && (
                      <span className="text-xs text-gray-500">
                        {new Date(stage.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>

                {expandedStages.has(stage.id) && (
                  <div className="border-t bg-white p-4">
                    {/* Stage Details */}
                    {stage.details && Object.keys(stage.details).length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-700 mb-2">Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(stage.details).map(([key, value]) => (
                            <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                              <span className="text-gray-600">{key}:</span>
                              <span className="font-medium text-gray-800">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {stage.error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 text-sm">{stage.error}</p>
                      </div>
                    )}

                    {/* Sample Data */}
                    {stage.sample && (
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Sample Data</h4>
                        <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                          {JSON.stringify(stage.sample, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Current Dashboard Data Summary */}
          {currentData && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-3">Current Dashboard Data</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Total Campaigns:</span>
                  <span className="ml-2 font-bold">{currentData.campaigns?.length || 0}</span>
                </div>
                <div>
                  <span className="text-blue-700">Ad Sets:</span>
                  <span className="ml-2 font-bold">{currentData.adsetLevelData?.length || 0}</span>
                </div>
                <div>
                  <span className="text-blue-700">Date Range:</span>
                  <span className="ml-2 font-bold">
                    {currentData.dateRange?.startDate} to {currentData.dateRange?.endDate}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataPipelineDebugger;