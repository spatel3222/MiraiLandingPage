// FORCE REFRESH META FIX: 2025-10-03T06:23:00 
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
import { generateSampleOutputData, loadDashboardFromOutputFiles } from './utils/outputDataProcessor';
import { loadCachedOutputData, cacheOutputData, checkForRecentOutputFiles, loadExistingOutputFiles } from './utils/fileLoader';
import { processAllInputFiles } from './utils/integratedDataProcessor';
import { processMetaAdsCSV } from './utils/metaProcessor';
import { processGoogleAdsCSV } from './utils/googleProcessor';
import Papa from 'papaparse';
import type { DashboardData } from './types';

/**
 * Create Shopify pivot table (Campaign + AdSet level) - same logic as integratedDataProcessor
 */
const createShopifyPivotFromShopifyData = (shopifyData: any[]): any[] => {
  console.log('📊 Creating granular Campaign+AdSet level pivot...');
  
  const pivotMap = new Map<string, any>();

  shopifyData.forEach(record => {
    const utmCampaign = record['UTM campaign'] || record['Utm campaign'] || 'Unknown Campaign';
    const utmTerm = record['UTM term'] || record['Utm term'] || 'Unknown AdSet';
    const key = `${utmCampaign}|||${utmTerm}`;

    if (!pivotMap.has(key)) {
      pivotMap.set(key, {
        'UTM Campaign': utmCampaign,
        'UTM Term': utmTerm,
        'Online store visitors': 0,
        'Sessions': 0,
        'Sessions with cart additions': 0,
        'Sessions that reached checkout': 0,
        'Average session duration': 0,
        'Pageviews': 0,
        'Date': record['Day'] || record['Date'] || new Date().toISOString().split('T')[0],
        '_sessionDurationTotal': 0,
        '_visitorCount': 0
      });
    }

    const pivot = pivotMap.get(key)!;
    
    // Helper function to parse numbers
    const parseNumber = (value: any): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const cleaned = value.replace(/[,$%]/g, '');
        const num = parseFloat(cleaned);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };
    
    // Aggregate numeric fields
    pivot['Online store visitors'] += parseNumber(record['Online store visitors']);
    pivot['Sessions'] += parseNumber(record['Sessions']);
    pivot['Sessions with cart additions'] += parseNumber(record['Sessions with cart additions']);
    pivot['Sessions that reached checkout'] += parseNumber(record['Sessions that reached checkout']);
    pivot['Pageviews'] += parseNumber(record['Pageviews']);
    
    // For average session duration, accumulate total and count
    const sessionDuration = parseNumber(record['Average session duration']);
    const visitors = parseNumber(record['Online store visitors']);
    if (visitors > 0 && sessionDuration > 0) {
      pivot._sessionDurationTotal += sessionDuration * visitors;
      pivot._visitorCount += visitors;
    }
  });

  // Calculate weighted averages and clean up
  const pivotArray = Array.from(pivotMap.values()).map(pivot => {
    if (pivot._visitorCount > 0) {
      pivot['Average session duration'] = pivot._sessionDurationTotal / pivot._visitorCount;
    }
    delete pivot._sessionDurationTotal;
    delete pivot._visitorCount;
    return pivot;
  });

  console.log(`📊 Created ${pivotArray.length} pivot records from ${shopifyData.length} Shopify records`);
  return pivotArray;
};

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

  // Load cached data on mount - disabled auto file loading to prevent fetch issues
  useEffect(() => {
    const loadDataOnStartup = async () => {
      // Check if user just reset all data
      const wasReset = localStorage.getItem('moi-reset-flag');
      if (wasReset) {
        console.log('Reset flag detected, skipping automatic data loading...');
        localStorage.removeItem('moi-reset-flag');
        return; // Exit early, don't load any data
      }
      
      // Force cache clear for this version (Public directory file access)
      const CACHE_VERSION = 'v2.7.0-shopify-users-meta-spend-fixes';
      const currentCacheVersion = localStorage.getItem('moi-cache-version');
      
      console.log('🔧 CACHE VERSION CHECK:');
      console.log(`  Current version in storage: "${currentCacheVersion}"`);
      console.log(`  Required version: "${CACHE_VERSION}"`);
      console.log(`  Version match: ${currentCacheVersion === CACHE_VERSION}`);
      
      if (currentCacheVersion !== CACHE_VERSION) {
        console.log('🧹 CACHE CLEARING INITIATED - Version mismatch detected');
        
        // List all items to be cleared
        const itemsToRemove = [
          'moi-dashboard-data',
          'moi-dashboard-timestamp', 
          'moi-output-data',
          'moi-output-timestamp',
          'moi-shopify-data',
          'moi-meta-data',
          'moi-google-data',
          'moi-pivot-data'
        ];
        
        console.log('🗑️ Removing cached items:', itemsToRemove);
        
        itemsToRemove.forEach(item => {
          const existed = localStorage.getItem(item) !== null;
          localStorage.removeItem(item);
          console.log(`  ✓ Removed ${item} (existed: ${existed})`);
        });
        
        localStorage.setItem('moi-cache-version', CACHE_VERSION);
        console.log(`✅ CACHE CLEARED SUCCESSFULLY - New version: ${CACHE_VERSION}`);
        console.log('📝 Note: All data will be reprocessed on next file upload');
      } else {
        console.log('✅ CACHE VERSION CURRENT - No clearing needed');
      }
      
      // Only try to load cached dashboard data (no file system access)
      const cachedData = localStorage.getItem('moi-dashboard-data');
      const cachedTimestamp = localStorage.getItem('moi-dashboard-timestamp');
      
      console.log('🔍 POST-CACHE-CLEAR DATA CHECK:');
      console.log(`  - Dashboard data exists: ${!!cachedData} (${cachedData ? Math.round(cachedData.length/1024) + 'KB' : '0KB'})`);
      console.log(`  - Dashboard timestamp: ${cachedTimestamp || 'None'}`);
      console.log(`  - Shopify data exists: ${!!localStorage.getItem('moi-shopify-data')}`);
      console.log(`  - Meta data exists: ${!!localStorage.getItem('moi-meta-data')}`);
      console.log(`  - Google data exists: ${!!localStorage.getItem('moi-google-data')}`);
      console.log(`  - Output data exists: ${!!localStorage.getItem('moi-output-data')}`);
      
      if (cachedData && cachedTimestamp) {
        console.log('📋 LOADING FROM CACHED DASHBOARD DATA...');
        try {
          const parsedData = JSON.parse(cachedData);
          console.log('📊 Cached data structure check:');
          console.log(`  - Has keyMetrics: ${!!parsedData.keyMetrics}`);
          console.log(`  - Has campaigns: ${!!parsedData.campaigns}`);
          console.log(`  - Total campaigns: ${parsedData.campaigns?.length || 0}`);
          
          // Validate the data structure
          if (parsedData.keyMetrics && typeof parsedData.keyMetrics.totalUniqueUsers === 'number') {
            console.log('✅ VALID CACHED DATA FOUND');
            console.log(`  - Unique campaigns: ${parsedData.keyMetrics.uniqueCampaigns}`);
            console.log(`  - Total users: ${parsedData.keyMetrics.totalUniqueUsers}`);
            console.log(`  - Last updated: ${cachedTimestamp}`);
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
      
      // Try cached output data only (no file system fetch)
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
      } else {
        console.log('No cached data available, dashboard will show empty state');
        console.log('Please use "Generate Reports" to upload and process your files');
      }
    };
    
    loadDataOnStartup();
  }, []);

  const handleFileUpload = async (file: File, fileType: 'shopify' | 'meta' | 'google') => {
    console.log('📁 FILE UPLOAD INITIATED:');
    console.log(`  - File name: ${file.name}`);
    console.log(`  - File type: ${fileType}`);
    console.log(`  - File size: ${Math.round(file.size / 1024)}KB`);
    console.log(`  - Upload timestamp: ${new Date().toLocaleString()}`);
    
    if (fileType !== 'shopify') {
      alert('Currently only Shopify Export is supported. Meta Ads and Google Ads will be added in future updates.');
      return;
    }

    console.log('🔄 STARTING FILE PROCESSING...');
    setIsLoading(true);
    try {
      const processedData = await processShopifyCSV(file);
      console.log('✅ FILE PROCESSING COMPLETED');
      console.log(`  - Unique campaigns: ${processedData.keyMetrics?.uniqueCampaigns || 0}`);
      console.log(`  - Total users: ${processedData.keyMetrics?.totalUniqueUsers || 0}`);
      console.log(`  - Total campaigns: ${processedData.campaigns?.length || 0}`);
      
      // Cache the data
      const timestamp = new Date().toISOString();
      console.log('💾 CACHING PROCESSED DATA...');
      console.log(`  - Timestamp: ${timestamp}`);
      localStorage.setItem('moi-dashboard-data', JSON.stringify(processedData));
      localStorage.setItem('moi-dashboard-timestamp', timestamp);
      console.log('✅ DATA CACHED SUCCESSFULLY');
      
      setDashboardData(processedData);
      setLastUpdated(timestamp);
      setShowUploadModal(false);
      console.log('🎯 UI STATE UPDATED - File upload complete');
    } catch (error) {
      console.error('❌ ERROR PROCESSING FILE:', error);
      console.log('  - Error type:', error.constructor.name);
      console.log('  - Error message:', error.message);
      alert('Error processing file. Please check the format and try again.');
    } finally {
      setIsLoading(false);
      console.log('🏁 FILE UPLOAD PROCESS FINISHED');
    }
  };

  const handleGenerateReport = async (files: { shopify: File | null; meta: File | null; google: File | null }, useConfigurableLogic: boolean = false) => {
    setIsLoading(true);
    
    // CRITICAL DEBUG: Log everything about the upload
    console.log('🚀 === UPLOAD DEBUG START ===');
    console.log('📁 Files received:', {
      shopify: files.shopify ? `${files.shopify.name} (${files.shopify.size} bytes)` : 'null',
      meta: files.meta ? `${files.meta.name} (${files.meta.size} bytes)` : 'null',
      google: files.google ? `${files.google.name} (${files.google.size} bytes)` : 'null'
    });
    console.log('⚙️ useConfigurableLogic:', useConfigurableLogic);
    
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
          const result = await processAllInputFiles(files, false);
          outputData = result.dashboardData;
          
          console.log('✅ Standard processing completed using processAllInputFiles');
          
          const processingErrors = [];
          
          // NOTE: File processing now handled by processAllInputFiles() above
          // Keeping this section for potential error handling
          /*
          if (files.meta) {
            console.log('Processing Meta Ads file:', files.meta.name);
            try {
              const metaData = await processMetaAdsCSV(files.meta);
              localStorage.setItem('moi-meta-data', JSON.stringify(metaData));
              console.log('💾 Saved original Meta Ads data to localStorage:', metaData.length, 'rows');
            } catch (error) {
              console.error('❌ Error processing Meta Ads file:', error);
              processingErrors.push(`Meta Ads: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          
          if (files.google) {
            console.log('Processing Google Ads file:', files.google.name);
            try {
              const googleData = await processGoogleAdsCSV(files.google);
              localStorage.setItem('moi-google-data', JSON.stringify(googleData));
              console.log('💾 Saved original Google Ads data to localStorage:', googleData.length, 'rows');
            } catch (error) {
              console.error('❌ Error processing Google Ads file:', error);
              processingErrors.push(`Google Ads: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
          
          // CRITICAL: Process and save original Shopify file data (with compression)
          console.log('Processing Shopify Export file:', files.shopify.name);
          try {
            const shopifyData = await new Promise<any[]>((resolve, reject) => {
              Papa.parse(files.shopify, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data as any[]),
                error: (error) => reject(error)
              });
            });
            
            // Compress large Shopify data by only storing essential fields
            const compressedData = shopifyData.map(row => ({
              'Day': row['Day'] || row['Date'],
              'UTM campaign': row['UTM campaign'] || row['Utm campaign'],
              'UTM term': row['UTM term'] || row['Utm term'],
              'Online store visitors': row['Online store visitors'],
              'Sessions with cart additions': row['Sessions with cart additions'],
              'Sessions that reached checkout': row['Sessions that reached checkout'],
              'Sessions that completed checkout': row['Sessions that completed checkout'],
              'Average session duration': row['Average session duration'],
              'Pageviews': row['Pageviews']
            }));
            
            localStorage.setItem('moi-shopify-data', JSON.stringify(compressedData));
            console.log('💾 Saved compressed Shopify data to localStorage:', compressedData.length, 'rows');
            console.log('🗜️ Compression: Original', shopifyData.length, 'rows compressed to essential fields');
            
            // Generate pivot data from Shopify data (standard processing)
            console.log('📊 Generating pivot data from Shopify data...');
            const pivotData = createShopifyPivotFromShopifyData(compressedData);
            
            // Store pivot data in localStorage
            try {
              localStorage.setItem('moi-pivot-data', JSON.stringify(pivotData));
              console.log(`💾 Stored ${pivotData.length} pivot records in localStorage (standard processing)`);
            } catch (error) {
              console.warn('⚠️ Failed to store pivot data in localStorage:', error);
            }
          } catch (error) {
            console.error('❌ Error processing Shopify file:', error);
            processingErrors.push(`Shopify: ${error instanceof Error ? error.message : 'Unknown error'}`);
            
            // Fallback: Try to save just a sample of the data
            try {
              const shopifyData = await new Promise<any[]>((resolve, reject) => {
                Papa.parse(files.shopify, {
                  header: true,
                  skipEmptyLines: true,
                  complete: (results) => resolve(results.data as any[]),
                  error: (error) => reject(error)
                });
              });
              const sampleData = shopifyData.slice(0, 1000); // First 1000 rows
              localStorage.setItem('moi-shopify-data', JSON.stringify(sampleData));
              console.log('⚠️ Saved sample Shopify data (first 1000 rows) due to size limits');
              processingErrors.push('Shopify: File too large, saved first 1000 rows only');
            } catch (fallbackError) {
              console.error('❌ Fallback also failed:', fallbackError);
              processingErrors.push(`Shopify fallback: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
            }
          }
          */
          
          // Report partial processing errors if any occurred
          if (processingErrors.length > 0) {
            console.warn('⚠️ Some files had processing issues:', processingErrors);
            const warningMessage = `Upload completed with warnings:\n\n${processingErrors.map(err => `• ${err}`).join('\n')}\n\nThe dashboard will work with the data that was successfully processed. Check the console for details.`;
            
            // Show warning after success message
            setTimeout(() => {
              alert(warningMessage);
            }, 1000);
          }
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
        
        // CRITICAL DEBUG: Verify localStorage after processing
        console.log('🔍 === LOCALSTORAGE VERIFICATION ===');
        const savedKeys = ['moi-shopify-data', 'moi-meta-data', 'moi-google-data', 'moi-dashboard-data'];
        savedKeys.forEach(key => {
          const data = localStorage.getItem(key);
          if (data) {
            console.log(`✅ ${key}: ${data.length} characters`);
          } else {
            console.log(`❌ ${key}: NOT FOUND`);
          }
        });
        console.log('🏁 === UPLOAD DEBUG END ===');
        
        // Show success message
        setTimeout(() => {
          const processingMethod = useConfigurableLogic ? 'custom logic template' : 'standard processing';
          alert(`Reports generated successfully using ${processingMethod}! Dashboard metrics are now populated.`);
        }, 500);
      }
    } catch (error) {
      console.error('Error generating reports:', error);
      
      // Detailed error handling with user-friendly messages
      let errorMessage = 'Error generating reports. ';
      let technicalDetails = '';
      
      if (error instanceof Error) {
        technicalDetails = error.message;
        
        // Specific error types with helpful guidance
        if (error.message.includes('QuotaExceededError') || error.message.includes('exceeded the quota')) {
          errorMessage += 'Your files are too large for browser storage. Please try with smaller files or contact support.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorMessage += 'Network connection issue. Please check your internet connection and try again.';
        } else if (error.message.includes('CSV') || error.message.includes('parse')) {
          errorMessage += 'File format issue. Please ensure your CSV files are properly formatted with headers.';
        } else if (error.message.includes('Permission') || error.message.includes('Access')) {
          errorMessage += 'File access permission issue. Please try re-selecting your files.';
        } else if (error.message.includes('date') || error.message.includes('Date')) {
          errorMessage += 'Date format issue. Please ensure your files contain valid date columns.';
        } else {
          errorMessage += 'Unexpected error occurred during processing.';
        }
      } else {
        errorMessage += 'Unknown error occurred.';
        technicalDetails = String(error);
      }
      
      // Show detailed error information
      const fullErrorMessage = `${errorMessage}\n\nTechnical Details: ${technicalDetails}\n\nTroubleshooting:\n• Check file formats (CSV with headers)\n• Ensure files are not corrupted\n• Try with smaller files\n• Check browser console for more details`;
      
      alert(fullErrorMessage);
      
      // Log detailed error for debugging
      console.error('🚨 === DETAILED ERROR REPORT ===');
      console.error('User-friendly message:', errorMessage);
      console.error('Technical details:', technicalDetails);
      console.error('Full error object:', error);
      console.error('Files that were being processed:', {
        shopify: files.shopify ? `${files.shopify.name} (${files.shopify.size} bytes)` : 'null',
        meta: files.meta ? `${files.meta.name} (${files.meta.size} bytes)` : 'null',
        google: files.google ? `${files.google.name} (${files.google.size} bytes)` : 'null'
      });
      console.error('🚨 === END ERROR REPORT ===');
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

  const handleTestPhase1 = async () => {
    console.log('🧪 Testing Phase 1: CSV-based data loading...');
    setIsLoading(true);
    
    try {
      const phase1Data = await loadDashboardFromOutputFiles();
      
      console.log('✅ Phase 1 test completed successfully');
      console.log('📊 Phase 1 results:', {
        campaigns: phase1Data.campaigns?.length || 0,
        totalUsers: phase1Data.keyMetrics?.totalUniqueUsers || 0,
        uniqueCampaigns: phase1Data.keyMetrics?.uniqueCampaigns || 0
      });
      
      // Update dashboard with Phase 1 data
      const timestamp = new Date().toISOString();
      localStorage.setItem('moi-dashboard-data', JSON.stringify(phase1Data));
      localStorage.setItem('moi-dashboard-timestamp', timestamp);
      
      setDashboardData(phase1Data);
      setLastUpdated(timestamp);
      setReportGenerated(true);
      
      // Show success message
      alert(`✅ Phase 1 Test Successful!\n\nLoaded from CSV output files:\n• ${phase1Data.campaigns?.length || 0} campaign combinations\n• ${phase1Data.keyMetrics?.totalUniqueUsers || 0} total users\n• ${phase1Data.keyMetrics?.uniqueCampaigns || 0} unique campaigns\n\nDashboard now shows Phase 1 data architecture.`);
      
    } catch (error) {
      console.error('❌ Phase 1 test failed:', error);
      alert(`❌ Phase 1 Test Failed\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck browser console for details. This may be expected if CSV files are not accessible.`);
    } finally {
      setIsLoading(false);
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
