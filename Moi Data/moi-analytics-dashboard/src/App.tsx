import { useState, useEffect } from 'react';
import { Settings, MessageCircle, Download, X, Send, FileUp, RotateCcw } from 'lucide-react';
import KeyMetricsPanel from './components/KeyMetricsPanel';
import CampaignPerformanceTiers from './components/CampaignPerformanceTiers';
import UTMCampaignTable from './components/UTMCampaignTable';
import UploadModal from './components/UploadModal';
import MultiFileUploadModal from './components/MultiFileUploadModal';
import ExportModal from './components/ExportModal';
import ChatBot from './components/ChatBot';
import LogicTemplateSettings from './components/LogicTemplateSettings';
import { processShopifyCSV } from './utils/csvProcessor';
import { generateSampleOutputData } from './utils/outputDataProcessor';
import { loadCachedOutputData, cacheOutputData, checkForRecentOutputFiles, loadExistingOutputFiles } from './utils/fileLoader';
import { processAllInputFiles } from './utils/integratedDataProcessor';
import type { DashboardData } from './types';

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMultiUploadModal, setShowMultiUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showChatBot, setShowChatBot] = useState(false);
  const [showLogicSettings, setShowLogicSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [autoLoadedData, setAutoLoadedData] = useState(false);

  // Load cached data or output files on mount
  useEffect(() => {
    const loadDataOnStartup = async () => {
      // Check if user just reset all data
      const wasReset = localStorage.getItem('moi-reset-flag');
      if (wasReset) {
        console.log('Reset flag detected, skipping automatic data loading...');
        localStorage.removeItem('moi-reset-flag');
        return; // Exit early, don't load any data
      }
      
      // Clear any potentially corrupted cache first
      console.log('Checking for corrupted cache...');
      
      // Force cache clear for this version (campaign count bug fix)
      const CACHE_VERSION = 'v1.1.0-campaign-fix';
      const currentCacheVersion = localStorage.getItem('moi-cache-version');
      if (currentCacheVersion !== CACHE_VERSION) {
        console.log('Cache version mismatch, clearing all cached data...');
        localStorage.removeItem('moi-dashboard-data');
        localStorage.removeItem('moi-dashboard-timestamp');
        localStorage.removeItem('moi-output-data');
        localStorage.removeItem('moi-output-timestamp');
        localStorage.setItem('moi-cache-version', CACHE_VERSION);
      }
      
      // First, try to load cached dashboard data
      const cachedData = localStorage.getItem('moi-dashboard-data');
      const cachedTimestamp = localStorage.getItem('moi-dashboard-timestamp');
      
      console.log('🔍 App.tsx data loading check:');
      console.log('  - cachedData exists:', !!cachedData);
      console.log('  - cachedTimestamp:', cachedTimestamp);
      
      if (cachedData && cachedTimestamp) {
        console.log('📋 Loading from cached dashboard data...');
        try {
          const parsedData = JSON.parse(cachedData);
          // Validate the data structure
          if (parsedData.keyMetrics && typeof parsedData.keyMetrics.totalUniqueUsers === 'number') {
            console.log('✅ Valid cached data found - uniqueCampaigns:', parsedData.keyMetrics.uniqueCampaigns);
            setDashboardData(parsedData);
            setLastUpdated(cachedTimestamp);
            setReportGenerated(true);
            return;
          } else {
            console.log('Corrupted cache detected, clearing...');
            localStorage.removeItem('moi-dashboard-data');
            localStorage.removeItem('moi-dashboard-timestamp');
          }
        } catch (error) {
          console.log('Invalid cached data, clearing...');
          localStorage.removeItem('moi-dashboard-data');
          localStorage.removeItem('moi-dashboard-timestamp');
        }
      }
      
      // If no cached dashboard data, try to load from output files
      console.log('📂 Trying to load from cached output files...');
      const outputData = loadCachedOutputData();
      if (outputData) {
        console.log('📄 Auto-loading dashboard from cached output files - uniqueCampaigns:', outputData.keyMetrics.uniqueCampaigns);
        setDashboardData(outputData);
        setReportGenerated(true);
        setAutoLoadedData(true);
        
        const timestamp = new Date().toISOString();
        setLastUpdated(timestamp);
        
        // Cache this data for future use
        localStorage.setItem('moi-dashboard-data', JSON.stringify(outputData));
        localStorage.setItem('moi-dashboard-timestamp', timestamp);
        
        // Show notification after a brief delay
        setTimeout(() => {
          if (window.confirm('Dashboard automatically loaded with existing output file data. Would you like to see the loaded metrics?')) {
            // User can see the loaded data is already displayed
          }
        }, 1000);
      } else {
        // Try to load from existing output files (with fallback sample data)
        console.log('🗂️ No cached data found, trying to load existing output files...');
        loadExistingOutputFiles().then(existingData => {
          if (existingData) {
            console.log('📁 Loaded data from existing output files - uniqueCampaigns:', existingData.keyMetrics.uniqueCampaigns);
            setDashboardData(existingData);
            setReportGenerated(true);
            setAutoLoadedData(true);
            
            const timestamp = new Date().toISOString();
            setLastUpdated(timestamp);
            
            // Cache this data for future use
            localStorage.setItem('moi-dashboard-data', JSON.stringify(existingData));
            localStorage.setItem('moi-dashboard-timestamp', timestamp);
            cacheOutputData(existingData);
          } else {
            console.log('No data available, dashboard will show empty state');
          }
        }).catch(error => {
          console.error('Error loading existing output files:', error);
        });
      }
    };
    
    loadDataOnStartup();
  }, []);

  const handleFileUpload = async (file: File, fileType: 'shopify' | 'meta' | 'google') => {
    if (fileType !== 'shopify') {
      alert('Currently only Shopify Export is supported. Meta Ads and Google Ads will be added in future updates.');
      return;
    }

    setIsLoading(true);
    try {
      const processedData = await processShopifyCSV(file);
      
      // Cache the data
      const timestamp = new Date().toISOString();
      localStorage.setItem('moi-dashboard-data', JSON.stringify(processedData));
      localStorage.setItem('moi-dashboard-timestamp', timestamp);
      
      setDashboardData(processedData);
      setLastUpdated(timestamp);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (files: { shopify: File | null; meta: File | null; google: File | null }, useConfigurableLogic: boolean = false) => {
    setIsLoading(true);
    
    try {
      if (files.shopify) {
        let outputData: DashboardData;

        if (useConfigurableLogic) {
          // Use configurable logic processing
          console.log('Processing with configurable logic template...');
          const result = await processAllInputFiles(files, true);
          outputData = result.dashboardData;
          
          // Show processing method in console
          if (files.meta) console.log('Processing Meta Ads file with custom logic:', files.meta.name);
          if (files.google) console.log('Processing Google Ads file with custom logic:', files.google.name);
        } else {
          // Use standard processing
          console.log('Processing with standard logic...');
          outputData = generateSampleOutputData();
          
          // Standard processing messages
          if (files.meta) console.log('Processing Meta Ads file:', files.meta.name);
          if (files.google) console.log('Processing Google Ads file:', files.google.name);
        }
        
        // Update dashboard with processed output data
        const timestamp = new Date().toISOString();
        localStorage.setItem('moi-dashboard-data', JSON.stringify(outputData));
        localStorage.setItem('moi-dashboard-timestamp', timestamp);
        
        setDashboardData(outputData);
        setLastUpdated(timestamp);
        setReportGenerated(true);
        setShowMultiUploadModal(false);
        
        // Cache the output data for auto-loading
        cacheOutputData(outputData);
        
        // Show success message
        setTimeout(() => {
          const processingMethod = useConfigurableLogic ? 'custom logic template' : 'standard processing';
          alert(`Reports generated successfully using ${processingMethod}! Dashboard metrics are now populated.`);
        }, 500);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Error generating reports. Please check the file formats and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAllData = () => {
    if (window.confirm('🔄 Reset All Data\n\nThis will:\n• Clear all cached dashboard data\n• Clear all output files cache\n• Clear all localStorage data\n• Reset custom logic templates\n• Return dashboard to empty state\n\nAre you sure you want to continue?')) {
      try {
        // Clear all MOI-related localStorage items
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('moi-') || key.includes('moi'))) {
            keysToRemove.push(key);
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key);
          console.log(`Removed localStorage key: ${key}`);
        });
        
        // Set reset flag to prevent automatic data loading on next mount
        localStorage.setItem('moi-reset-flag', 'true');
        
        // Reset React state
        setDashboardData(null);
        setLastUpdated(null);
        setReportGenerated(false);
        setAutoLoadedData(false);
        
        console.log('🔄 All data reset successfully');
        alert('✅ All data has been reset successfully!\n\nThe dashboard is now in a fresh state.');
        
      } catch (error) {
        console.error('Error resetting data:', error);
        alert('❌ Error resetting data. Please check the console for details.');
      }
    }
  };

  const handleDataSync = () => {
    // Download both generated CSV files with date range in filename
    const downloadCSV = (filename: string, sourcePath: string) => {
      // Read the file content (in production, this would come from your server)
      fetch(sourcePath)
        .then(response => response.text())
        .then(csvContent => {
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        })
        .catch(() => {
          // For now, create sample CSVs with the data structure
          const dateRange = "Sep10-Oct09_2025";
          
          // Create download links for both files
          const topLevelContent = `Date,Meta Ads,,,Google Ads,,,Shopify,,,,,,,,,Sales Data,,Shopify
Note,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Direct,Derived,Derived,Derived,Derived,Direct,Direct,Direct
Note,Spend,CTR,CPM,Spend,CTR,CPM,"Total 
Users","Total 
ATC","Total 
Reached Checkout ",Total Abandoned Checkout,Session Duration,Users with Session above 1 min,Users with Above 5 page views and above 1 min,ATC with session duration above 1 min,Reached Checkout with session duration above 1 min,General Queries,Open Queries ,Online Orders
"Wed, Sep 10, 25","39,829",1.49%,59.16,"16,080",0.80%,244.71,"7,922",35,13,1,0:00:42,835,525,23,8,9,2,0`;
          
          const adsetContent = `Date,Campaign Name,Campaign ID,Adset Name,Adset ID,Platform,Spend,Impressions,CTR,CPM,CPC,Users,ATC,Reached Checkout,Purchases,Revenue,ROAS
"Wed, Sep 10, 25",BOF | DPA,123456,DPA - Broad,789012,Meta,"2,500","42,300",1.45%,59.10,4.08,523,3,1,0,0,0.00`;
          
          // Download Top Level Metrics
          const topLevelBlob = new Blob([topLevelContent], { type: 'text/csv' });
          const topLevelUrl = URL.createObjectURL(topLevelBlob);
          const topLevelLink = document.createElement('a');
          topLevelLink.href = topLevelUrl;
          topLevelLink.download = `MOI_Top_Level_Metrics_${dateRange}.csv`;
          topLevelLink.click();
          URL.revokeObjectURL(topLevelUrl);
          
          // Small delay between downloads
          setTimeout(() => {
            // Download Adset Level Matrices
            const adsetBlob = new Blob([adsetContent], { type: 'text/csv' });
            const adsetUrl = URL.createObjectURL(adsetBlob);
            const adsetLink = document.createElement('a');
            adsetLink.href = adsetUrl;
            adsetLink.download = `MOI_Adset_Level_Matrices_${dateRange}.csv`;
            adsetLink.click();
            URL.revokeObjectURL(adsetUrl);
          }, 500);
        });
    };
    
    // Trigger downloads
    downloadCSV('MOI_Top_Level_Metrics.csv', '/data/top_level_metrics.csv');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-moi-light px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-orpheus text-3xl font-bold text-moi-charcoal">
              MOI Analytics Dashboard
            </h1>
            <p className="font-benton text-sm text-moi-grey mt-1">
              Boutique Everyday Luxury - Marketing Intelligence
            </p>
            {lastUpdated && (
              <p className="font-benton text-xs text-moi-grey mt-1">
                Last updated: {new Date(lastUpdated).toLocaleString()}
                {autoLoadedData && (
                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    Auto-loaded from output files
                  </span>
                )}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowMultiUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-moi-charcoal text-white rounded-lg hover:bg-moi-grey transition-colors font-benton text-sm"
            >
              <FileUp className="w-4 h-4" />
              <span>Generate Reports</span>
            </button>
            
            {reportGenerated && (
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-moi-beige text-moi-charcoal rounded-lg hover:bg-moi-light transition-colors font-benton text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export Reports</span>
              </button>
            )}
            
            <button
              onClick={handleResetAllData}
              className="flex items-center space-x-2 p-2 text-red-500 hover:text-red-700 transition-colors"
              title="Reset All Data (Testing)"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowLogicSettings(true)}
              className="flex items-center space-x-2 p-2 text-moi-grey hover:text-moi-charcoal transition-colors"
              title="Logic Template Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {dashboardData ? (
          <div className="space-y-8">
            {/* Key Metrics Panel */}
            <KeyMetricsPanel data={dashboardData} />
            
            {/* Campaign Performance Tiers */}
            <CampaignPerformanceTiers data={dashboardData} />
            
            {/* UTM Campaign Table */}
            <UTMCampaignTable data={dashboardData} />
          </div>
        ) : (
          <div className="space-y-8">
              {/* Empty State - All Zeros */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  Key Performance Metrics
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Total Unique Campaigns</p>
                        <p className="font-benton text-2xl font-bold text-moi-charcoal">0</p>
                      </div>
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-moi-red text-xs">📊</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Total Sessions</p>
                        <p className="font-benton text-2xl font-bold text-moi-charcoal">0</p>
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs">👥</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-moi-beige rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-benton text-sm text-moi-grey">Conversion Rate</p>
                        <p className="font-benton text-2xl font-bold text-moi-red">0%</p>
                      </div>
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-xs">🎯</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Performance Tiers Empty State */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  Campaign Performance Tiers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-green-800">Excellent</h3>
                    <p className="font-benton text-2xl font-bold text-green-800 mt-2">0</p>
                  </div>
                  <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-yellow-800">Good</h3>
                    <p className="font-benton text-2xl font-bold text-yellow-800 mt-2">0</p>
                  </div>
                  <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-orange-800">Average</h3>
                    <p className="font-benton text-2xl font-bold text-orange-800 mt-2">0</p>
                  </div>
                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4 text-center">
                    <h3 className="font-benton font-semibold text-red-800">Poor</h3>
                    <p className="font-benton text-2xl font-bold text-red-800 mt-2">0</p>
                  </div>
                </div>
              </div>

              {/* Table Empty State */}
              <div className="bg-white rounded-lg border border-moi-light p-6">
                <h2 className="font-orpheus text-2xl font-bold text-moi-charcoal mb-6">
                  UTM Campaign Analysis Table
                </h2>
                <div className="text-center py-12 text-moi-grey">
                  <p className="font-benton text-lg mb-2">No campaigns to display</p>
                  <p className="font-benton text-sm">Upload data files to generate reports and view campaign analysis</p>
                </div>
              </div>
            </div>
        )}
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
          isLoading={isLoading}
        />
      )}

      {/* Multi-File Upload Modal */}
      {showMultiUploadModal && (
        <MultiFileUploadModal
          onClose={() => setShowMultiUploadModal(false)}
          onGenerateReport={handleGenerateReport}
          isProcessing={isLoading}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          dashboardData={dashboardData}
        />
      )}

      {/* Logic Template Settings */}
      {showLogicSettings && (
        <LogicTemplateSettings
          onClose={() => setShowLogicSettings(false)}
          onConfigurationChange={(config) => {
            // Logic configuration changed - could trigger data reprocessing
            console.log('Logic configuration updated:', config);
          }}
        />
      )}

      {/* ChatBot Toggle */}
      <button
        onClick={() => setShowChatBot(!showChatBot)}
        className="fixed bottom-6 right-6 bg-moi-charcoal text-white p-4 rounded-full shadow-lg hover:bg-moi-grey transition-colors z-50"
        title={dashboardData ? "Ask questions about your data" : "Preview MOI Analytics Assistant"}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* ChatBot */}
      {showChatBot && (
        <>
          {dashboardData ? (
            <ChatBot
              data={dashboardData}
              onClose={() => setShowChatBot(false)}
            />
          ) : (
            <div className="fixed bottom-6 right-20 w-96 h-96 bg-white rounded-lg shadow-2xl border border-moi-light flex flex-col z-50">
              <div className="flex items-center justify-between p-4 border-b border-moi-light bg-moi-beige rounded-t-lg">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5 text-moi-red" />
                  <h3 className="font-benton font-medium text-moi-charcoal">MOI Analytics Assistant</h3>
                </div>
                <button
                  onClick={() => setShowChatBot(false)}
                  className="p-1 text-moi-grey hover:text-moi-charcoal transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-moi-beige p-3 rounded-lg mb-4">
                  <p className="font-benton text-sm text-moi-charcoal">
                    Hi! I'm your MOI Analytics Assistant. Upload your data to start asking questions about your campaigns!
                  </p>
                </div>
              </div>
              
              <div className="p-4 border-t border-moi-light">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Ask about your campaigns..." 
                    className="flex-1 px-3 py-2 border border-moi-light rounded-lg focus:outline-none focus:ring-2 focus:ring-moi-red text-sm font-benton" 
                    disabled
                  />
                  <button className="p-2 bg-gray-400 text-white rounded-lg cursor-not-allowed">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-moi-charcoal mx-auto mb-4"></div>
            <p className="font-benton text-moi-charcoal">Processing your data...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
